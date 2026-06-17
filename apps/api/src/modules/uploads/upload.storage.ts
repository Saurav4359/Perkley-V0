import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"

import { getEnv } from "../../lib/env"

export function storagePathForKey(storageKey: string) {
  return resolve(getEnv().UPLOAD_STORAGE_DIR, storageKey)
}

export async function storeUpload(storageKey: string, bytes: Buffer) {
  const filePath = storagePathForKey(storageKey)
  await mkdir(dirname(filePath), { recursive: true })
  await writeFile(filePath, bytes)
}

export async function readUpload(storageKey: string) {
  return readFile(storagePathForKey(storageKey))
}

export function publicMediaPath(assetId: string) {
  return `/api/media/${assetId}`
}
