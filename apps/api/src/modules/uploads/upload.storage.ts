import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"

import { getEnv, isSupabaseStorageConfigured } from "../../lib/env"
import {
  downloadFromSupabase,
  supabasePublicUrl,
  uploadToSupabase,
} from "./upload.supabase"

export function storagePathForKey(storageKey: string) {
  return resolve(getEnv().UPLOAD_STORAGE_DIR, storageKey)
}

export async function storeUpload(
  storageKey: string,
  bytes: Buffer,
  contentType?: string
) {
  if (isSupabaseStorageConfigured()) {
    await uploadToSupabase(storageKey, bytes, contentType ?? "application/octet-stream")
    return
  }

  const filePath = storagePathForKey(storageKey)
  await mkdir(dirname(filePath), { recursive: true })
  await writeFile(filePath, bytes)
}

export async function readUpload(storageKey: string) {
  if (isSupabaseStorageConfigured()) {
    return downloadFromSupabase(storageKey)
  }
  return readFile(storagePathForKey(storageKey))
}

/**
 * Public URL for a stored asset. With Supabase configured this is a direct
 * (absolute) public bucket URL; otherwise it falls back to the API media proxy.
 */
export function assetPublicUrl(asset: { id: string; storageKey: string }): string {
  if (isSupabaseStorageConfigured()) {
    return supabasePublicUrl(asset.storageKey)
  }
  return publicMediaPath(asset.id)
}

export function publicMediaPath(assetId: string) {
  return `/api/media/${assetId}`
}
