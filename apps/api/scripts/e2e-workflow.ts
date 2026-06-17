/**
 * End-to-end workflow smoke test against the running API (localhost:3001).
 * Exercises Phase 3–6 flows: brand signup → campaign → escrow fund/confirm →
 * publish → creator signup → apply → accept → submit → analytics → payments.
 * Run: bun run scripts/e2e-workflow.ts
 */
const BASE = process.env.API_URL ?? "http://localhost:3001"

type Jar = { cookie: string }

function pickCookie(res: Response, jar: Jar) {
  const setCookie = res.headers.getSetCookie?.() ?? []
  for (const c of setCookie) {
    const [pair] = c.split(";")
    if (pair) {
      const name = pair.split("=")[0]
      // replace existing cookie of same name
      const parts = jar.cookie ? jar.cookie.split("; ").filter((p) => !p.startsWith(name + "=")) : []
      parts.push(pair)
      jar.cookie = parts.join("; ")
    }
  }
}

async function call(
  method: string,
  path: string,
  jar: Jar | null,
  body?: unknown
): Promise<{ status: number; data: any }> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(jar?.cookie ? { Cookie: jar.cookie } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (jar) pickCookie(res, jar)
  const data = await res.json().catch(() => null)
  return { status: res.status, data }
}

let passed = 0
let failed = 0
function check(label: string, ok: boolean, detail?: unknown) {
  if (ok) {
    passed++
    console.log(`  ✅ ${label}`)
  } else {
    failed++
    console.log(`  ❌ ${label}`, detail !== undefined ? JSON.stringify(detail) : "")
  }
}

async function main() {
  const stamp = Date.now()
  const brand: Jar = { cookie: "" }
  const creator: Jar = { cookie: "" }

  console.log("\n=== Phase 1/2: Auth & profiles ===")
  const brandSignup = await call("POST", "/api/auth/signup", brand, {
    role: "brand",
    email: `e2e-brand-${stamp}@test.dev`,
    password: "Password123!",
    brandName: "E2E Test Brand",
  })
  check("brand signup 201", brandSignup.status === 201, brandSignup.data)

  const brandMe = await call("GET", "/api/auth/me", brand)
  check("brand /me authenticated", brandMe.status === 200 && brandMe.data?.user?.role === "brand", brandMe.data)

  console.log("\n=== Phase 3: Campaign create ===")
  const create = await call("POST", "/api/campaigns", brand, {
    type: "campaign",
    title: "E2E Reel Campaign",
    description: "End to end test campaign description.",
    niche: "tech",
    contentType: "reel",
    minFollowers: 0,
    requiredHashtag: "#e2e",
    requiredMention: "@e2ebrand",
    deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
    totalBudget: 10000,
    maxCreators: 2,
    minViewsThreshold: 5000,
    fixedReward: 5000,
  })
  const campaignId = create.data?.campaign?.id
  check("campaign created", create.status === 201 && !!campaignId, create.data)
  if (!campaignId) return summary()

  console.log("\n=== Phase 6: Escrow fund + confirm ===")
  const fund = await call("POST", `/api/campaigns/${campaignId}/escrow/fund`, brand)
  const order = fund.data?.order
  check("escrow fund (order created)", fund.status === 200 && !!order?.orderId, fund.data)

  const confirm = await call("POST", `/api/campaigns/${campaignId}/escrow/confirm`, brand, {
    orderId: order?.orderId,
    paymentId: `dev_payment_${stamp}`,
  })
  check("escrow confirmed → funded", confirm.status === 200 && confirm.data?.escrow?.status === "funded", confirm.data)

  console.log("\n=== Phase 3: Publish ===")
  const publish = await call("POST", `/api/campaigns/${campaignId}/publish`, brand)
  check("campaign published → active", publish.status === 200 && publish.data?.campaign?.status === "active", publish.data)

  const publicList = await call("GET", "/api/campaigns", null)
  const inFeed = (publicList.data?.campaigns ?? []).some((c: any) => c.id === campaignId)
  check("campaign appears in public feed", inFeed, publicList.data?.campaigns?.length)

  const mine = await call("GET", "/api/campaigns/mine", brand)
  check("campaign appears in /mine", (mine.data?.campaigns ?? []).some((c: any) => c.id === campaignId))

  console.log("\n=== Phase 1/2: Creator signup ===")
  const creatorSignup = await call("POST", "/api/auth/signup", creator, {
    role: "creator",
    email: `e2e-creator-${stamp}@test.dev`,
    password: "Password123!",
    displayName: "E2E Creator",
  })
  check("creator signup 201", creatorSignup.status === 201, creatorSignup.data)

  console.log("\n=== Phase 4: Apply → accept ===")
  const apply = await call("POST", `/api/campaigns/${campaignId}/apply`, creator, {
    message: "I would love to work on this campaign!",
  })
  check("creator applied", apply.status === 201 && !!apply.data?.application?.id, apply.data)
  const applicationId = apply.data?.application?.id

  const creatorApps = await call("GET", "/api/creator/applications", creator)
  check("creator sees own application", (creatorApps.data?.applications ?? []).some((a: any) => a.id === applicationId), creatorApps.status)

  const brandApps = await call("GET", `/api/campaigns/${campaignId}/applications`, brand)
  check("brand lists applications", (brandApps.data?.applications ?? []).length >= 1, brandApps.data)

  if (applicationId) {
    const accept = await call("POST", `/api/campaigns/${campaignId}/applications/${applicationId}/accept`, brand)
    check("brand accepted application", accept.status === 200 && accept.data?.application?.status === "accepted", accept.data)
  }

  console.log("\n=== Phase 4: Creator submission ===")
  const submit = await call("POST", `/api/campaigns/${campaignId}/submissions`, creator, {
    postUrl: "https://instagram.com/reel/e2eTestReel01",
    note: "Here is my submission",
  })
  const submissionId = submit.data?.submission?.id
  check("creator created submission", submit.status === 201 && !!submissionId, submit.data)

  const brandSubs = await call("GET", `/api/campaigns/${campaignId}/submissions`, brand)
  check("brand lists submissions", (brandSubs.data?.submissions ?? []).length >= 1, brandSubs.status)

  console.log("\n=== Phase 6: Analytics ===")
  const brandAnalytics = await call("GET", "/api/analytics/brand", brand)
  check(
    "brand analytics shape",
    brandAnalytics.status === 200 && typeof brandAnalytics.data?.analytics?.campaigns === "number" && !!brandAnalytics.data?.analytics?.spend,
    brandAnalytics.data
  )

  const creatorAnalytics = await call("GET", "/api/analytics/creator", creator)
  check(
    "creator analytics shape",
    creatorAnalytics.status === 200 && !!creatorAnalytics.data?.analytics?.engagement,
    creatorAnalytics.data
  )

  const campaignAnalytics = await call("GET", `/api/campaigns/${campaignId}/analytics`, brand)
  check("campaign analytics shape", campaignAnalytics.status === 200 && !!campaignAnalytics.data?.analytics?.engagement, campaignAnalytics.status)

  console.log("\n=== Phase 6: Payment history ===")
  const brandPayments = await call("GET", "/api/brand/payments", brand)
  check("brand payment history", brandPayments.status === 200 && Array.isArray(brandPayments.data?.payments), brandPayments.status)

  const creatorPayments = await call("GET", "/api/creator/payments", creator)
  check("creator payment history", creatorPayments.status === 200 && Array.isArray(creatorPayments.data?.payments), creatorPayments.status)

  console.log("\n=== Phase 6: Escrow status ===")
  const escrow = await call("GET", `/api/campaigns/${campaignId}/escrow`, brand)
  check("escrow status funded", escrow.status === 200 && escrow.data?.escrow?.status === "funded", escrow.data)

  console.log("\n=== Phase 5: Notifications & dashboard ===")
  const notifs = await call("GET", "/api/notifications", creator)
  check("creator notifications", notifs.status === 200 && Array.isArray(notifs.data?.notifications ?? notifs.data), notifs.status)

  const creatorStats = await call("GET", "/api/dashboard/creator/stats", creator)
  check("creator dashboard stats", creatorStats.status === 200, creatorStats.status)

  const brandStats = await call("GET", "/api/dashboard/brand/stats", brand)
  check("brand dashboard stats", brandStats.status === 200, brandStats.status)

  console.log("\n=== Phase 7: Admin (expect 403 for non-admin) ===")
  const adminUsers = await call("GET", "/api/admin/users", brand)
  check("admin route blocks non-admin", adminUsers.status === 403, adminUsers.status)

  summary()
}

function summary() {
  console.log(`\n=== Result: ${passed} passed, ${failed} failed ===\n`)
  process.exit(failed > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error("Fatal:", err)
  process.exit(1)
})
