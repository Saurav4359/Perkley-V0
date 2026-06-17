/**
 * E2E test for Supabase Storage uploads.
 * Signs up a creator, prepares an avatar upload, PUTs bytes (→ Supabase),
 * attaches it, then verifies the public Supabase URL serves the file.
 * Run: API_URL=http://localhost:3009 bun run scripts/e2e-upload.ts
 */
const BASE = process.env.API_URL ?? "http://localhost:3001"

type Jar = { cookie: string }
function pickCookie(res: Response, jar: Jar) {
  for (const c of res.headers.getSetCookie?.() ?? []) {
    const [pair] = c.split(";")
    if (pair) {
      const name = pair.split("=")[0]
      const parts = jar.cookie ? jar.cookie.split("; ").filter((p) => !p.startsWith(name + "=")) : []
      parts.push(pair)
      jar.cookie = parts.join("; ")
    }
  }
}
async function call(method: string, path: string, jar: Jar, body?: unknown, headers?: Record<string, string>, raw?: Uint8Array) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(jar.cookie ? { Cookie: jar.cookie } : {}),
      ...headers,
    },
    body: raw ?? (body !== undefined ? JSON.stringify(body) : undefined),
  })
  pickCookie(res, jar)
  const text = await res.text()
  let data: any = null
  try { data = JSON.parse(text) } catch { data = text }
  return { status: res.status, data }
}

let pass = 0, fail = 0
function check(label: string, ok: boolean, detail?: unknown) {
  if (ok) { pass++; console.log(`  ✅ ${label}`) }
  else { fail++; console.log(`  ❌ ${label}`, detail !== undefined ? JSON.stringify(detail) : "") }
}

// 1x1 transparent PNG
const PNG = Uint8Array.from(
  atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="),
  (c) => c.charCodeAt(0)
)

async function main() {
  const stamp = Date.now()
  const creator: Jar = { cookie: "" }

  const signup = await call("POST", "/api/auth/signup", creator, {
    role: "creator",
    email: `e2e-upl-${stamp}@test.dev`,
    password: "Password123!",
    displayName: "Upload Tester",
  })
  check("creator signup", signup.status === 201, signup.data)

  const prep = await call("POST", "/api/uploads/prepare", creator, {
    purpose: "creator_avatar",
    filename: "avatar.png",
    mimeType: "image/png",
    byteSize: PNG.byteLength,
  })
  check("prepare upload", prep.status === 201 && !!prep.data?.upload?.url, prep.data)
  const upload = prep.data?.upload
  const assetId = prep.data?.asset?.id
  if (!upload) return done()

  const put = await call(
    upload.method,
    upload.url,
    creator,
    undefined,
    { "content-type": upload.headers["content-type"], "x-upload-token": upload.headers["x-upload-token"] },
    PNG
  )
  check("PUT bytes → Supabase (uploaded)", put.status === 200 && put.data?.asset?.status === "uploaded", put.data)
  const publicUrl = put.data?.asset?.publicUrl
  check("publicUrl is absolute Supabase URL", typeof publicUrl === "string" && publicUrl.includes("supabase.co/storage/v1/object/public/"), publicUrl)

  // Attach as avatar
  const attach = await call("PATCH", "/api/creator/avatar", creator, { assetId })
  check("attach avatar", attach.status === 200 || attach.status === 204, attach.data)

  // Verify the public Supabase URL actually serves the bytes
  if (typeof publicUrl === "string" && publicUrl.startsWith("http")) {
    const fetched = await fetch(publicUrl)
    const buf = new Uint8Array(await fetched.arrayBuffer())
    check("public URL serves file", fetched.status === 200 && buf.byteLength === PNG.byteLength, { status: fetched.status, len: buf.byteLength })
  }

  done()
}
function done() {
  console.log(`\n=== Upload result: ${pass} passed, ${fail} failed ===\n`)
  process.exit(fail > 0 ? 1 : 0)
}
main().catch((e) => { console.error("Fatal:", e); process.exit(1) })
