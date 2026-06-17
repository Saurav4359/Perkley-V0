import { requireSupabaseStorageEnv } from "../../lib/env"

/**
 * Minimal Supabase Storage client built on the Storage REST API.
 * Avoids pulling in the full @supabase/supabase-js SDK for a few object calls.
 * Uses the service-role key, so this must only ever run server-side.
 */

function objectUrl(bucket: string, baseUrl: string, storageKey: string) {
  // Keep "/" as path separators; encode each segment individually.
  const encodedKey = storageKey
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")
  return `${baseUrl}/storage/v1/object/${bucket}/${encodedKey}`
}

export async function uploadToSupabase(
  storageKey: string,
  bytes: Buffer,
  contentType: string
) {
  const { url, serviceKey, bucket } = requireSupabaseStorageEnv()

  const response = await fetch(objectUrl(bucket, url, storageKey), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": contentType,
      "Cache-Control": "max-age=31536000, immutable",
      "x-upsert": "true",
    },
    body: new Uint8Array(bytes),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => "")
    throw new Error(
      `Supabase upload failed (${response.status}) for ${storageKey}: ${detail}`
    )
  }
}

export async function downloadFromSupabase(storageKey: string): Promise<Buffer> {
  const { url, serviceKey, bucket } = requireSupabaseStorageEnv()

  const response = await fetch(objectUrl(bucket, url, storageKey), {
    headers: { Authorization: `Bearer ${serviceKey}` },
  })

  if (!response.ok) {
    throw new Error(
      `Supabase download failed (${response.status}) for ${storageKey}`
    )
  }

  return Buffer.from(await response.arrayBuffer())
}

export async function deleteFromSupabase(storageKey: string): Promise<void> {
  const { url, serviceKey, bucket } = requireSupabaseStorageEnv()

  await fetch(objectUrl(bucket, url, storageKey), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${serviceKey}` },
  }).catch(() => {
    // Best-effort cleanup; ignore failures.
  })
}

/** Public URL for an object in a public bucket. */
export function supabasePublicUrl(storageKey: string): string {
  const { url, bucket } = requireSupabaseStorageEnv()
  const encodedKey = storageKey
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")
  return `${url}/storage/v1/object/public/${bucket}/${encodedKey}`
}
