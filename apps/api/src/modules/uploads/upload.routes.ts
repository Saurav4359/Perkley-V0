import express, { Router } from "express"

import { asyncRoute } from "../../middleware/async-route"
import { optionalAuth, requireAuth } from "../../middleware/auth"
import { publicReadRateLimit, uploadContentRateLimit } from "../../middleware/rate-limit"
import { validateBody } from "../../middleware/validate"
import { assetIdParamSchema, prepareUploadSchema } from "./upload.schemas"
import { getMediaResponse, prepareUpload, uploadAssetContent } from "./upload.service"

export const uploadRoutes = Router()
export const mediaRoutes = Router()

uploadRoutes.post(
  "/prepare",
  requireAuth,
  validateBody(prepareUploadSchema),
  asyncRoute(async (req, res) => {
    res.status(201).json(await prepareUpload(req.auth!.id, req.body))
  })
)

uploadRoutes.put(
  "/content/:assetId",
  uploadContentRateLimit,
  express.raw({ type: () => true, limit: "10mb" }),
  asyncRoute(async (req, res) => {
    const { assetId } = assetIdParamSchema.parse(req.params)
    const token = req.header("x-upload-token")
    if (!token) {
      res.status(401).json({ error: "Missing upload token", code: "unauthorized" })
      return
    }

    const body = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0)
    const asset = await uploadAssetContent(assetId, token, body, req.header("content-type") ?? undefined)
    res.json({ asset })
  })
)
mediaRoutes.get(
  "/:assetId",
  publicReadRateLimit,
  optionalAuth,
  asyncRoute(async (req, res) => {
    const { assetId } = assetIdParamSchema.parse(req.params)
    const media = await getMediaResponse(assetId, req.auth?.id)
    res.setHeader("Content-Type", media.mimeType)
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable")
    res.setHeader("X-Content-Type-Options", "nosniff")
    res.send(media.bytes)
  })
)
