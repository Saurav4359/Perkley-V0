import { API_BASE_URL, ApiError, apiFetch } from "@/lib/api/client"

export type UploadPurpose = "brand_logo" | "creator_avatar" | "portfolio_image"

export type MediaAsset = {
  id: string
  purpose: UploadPurpose
  status: string
  mimeType: string
  byteSizeExpected: number
  publicUrl: string | null
}

type PrepareUploadResponse = {
  asset: MediaAsset
  upload: {
    method: string
    url: string
    headers: Record<string, string>
  }
}

export type PrepareUploadInput = {
  purpose: UploadPurpose
  filename: string
  mimeType: string
  byteSize: number
}

export async function prepareUpload(
  input: PrepareUploadInput
): Promise<PrepareUploadResponse> {
  return apiFetch<PrepareUploadResponse>("/api/uploads/prepare", {
    method: "POST",
    body: input,
  })
}

/**
 * Prepares an upload slot, PUTs the raw file bytes, and returns the
 * resulting media asset id (ready to attach to a profile/portfolio item).
 */
export async function uploadFile(
  file: File,
  purpose: UploadPurpose
): Promise<MediaAsset> {
  const prepared = await prepareUpload({
    purpose,
    filename: file.name,
    mimeType: file.type || "application/octet-stream",
    byteSize: file.size,
  })

  const response = await fetch(`${API_BASE_URL}${prepared.upload.url}`, {
    method: prepared.upload.method,
    headers: prepared.upload.headers,
    body: file,
  })

  if (!response.ok) {
    let message = "Upload failed."
    try {
      const payload = (await response.json()) as { error?: string }
      if (payload?.error) message = payload.error
    } catch {
      // Ignore non-JSON error bodies.
    }
    throw new ApiError(message, { status: response.status })
  }

  const { asset } = (await response.json()) as { asset: MediaAsset }
  return asset
}
