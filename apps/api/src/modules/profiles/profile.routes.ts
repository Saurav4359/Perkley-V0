import { Router } from "express"

import { asyncRoute } from "../../middleware/async-route"
import { requireAuth, requireRoles } from "../../middleware/auth"
import { validateBody } from "../../middleware/validate"
import { attachAssetSchema, assetIdParamSchema } from "../uploads/upload.schemas"
import { attachBrandLogo, attachCreatorAvatar, attachPortfolioImage } from "../uploads/upload.service"
import { listCreatorApplications } from "../applications/application.service"
import { creatorApplicationsQuerySchema } from "../applications/application.schemas"
import { listCreatorSubmissions } from "../submissions/submission.service"
import { creatorSubmissionsQuerySchema } from "../submissions/submission.schemas"
import { paymentHistoryQuerySchema } from "../payments/payment.schemas"
import {
  listBrandPaymentHistory,
  listCreatorPaymentHistory,
} from "../payments/payment.service"
import {
  createPortfolioItemSchema,
  updateBrandProfileSchema,
  updateCreatorProfileSchema,
  upsertPaymentDetailsSchema,
} from "./profile.schemas"
import {
  createCreatorPortfolioItem,
  deleteCreatorPortfolioItem,
  getBrandProfile,
  getCreatorProfile,
  listCreatorPortfolio,
  saveCreatorPaymentDetails,
  updateBrandProfile,
  updateCreatorProfile,
} from "./profile.service"

export const creatorProfileRoutes = Router()
export const brandProfileRoutes = Router()

creatorProfileRoutes.use(requireAuth, requireRoles("creator"))

creatorProfileRoutes.get(
  "/applications",
  asyncRoute(async (req, res) => {
    const query = creatorApplicationsQuerySchema.parse(req.query)
    res.json({ applications: await listCreatorApplications(req.auth!.id, query.status) })
  })
)

creatorProfileRoutes.get(
  "/submissions",
  asyncRoute(async (req, res) => {
    const query = creatorSubmissionsQuerySchema.parse(req.query)
    res.json({ submissions: await listCreatorSubmissions(req.auth!.id, query.status) })
  })
)

creatorProfileRoutes.get(
  "/payments",
  asyncRoute(async (req, res) => {
    const query = paymentHistoryQuerySchema.parse(req.query)
    res.json({
      payments: await listCreatorPaymentHistory(req.auth!.id, {
        limit: query.limit,
        status: query.status,
      }),
    })
  })
)

creatorProfileRoutes.get(
  "/profile",
  asyncRoute(async (req, res) => {
    res.json({ profile: await getCreatorProfile(req.auth!.id) })
  })
)

creatorProfileRoutes.patch(
  "/profile",
  validateBody(updateCreatorProfileSchema),
  asyncRoute(async (req, res) => {
    res.json({ profile: await updateCreatorProfile(req.auth!.id, req.body) })
  })
)

creatorProfileRoutes.patch(
  "/payment-details",
  validateBody(upsertPaymentDetailsSchema),
  asyncRoute(async (req, res) => {
    res.json({ paymentMethod: await saveCreatorPaymentDetails(req.auth!.id, req.body) })
  })
)

creatorProfileRoutes.patch(
  "/avatar",
  validateBody(attachAssetSchema),
  asyncRoute(async (req, res) => {
    await attachCreatorAvatar(req.auth!.id, req.body.assetId)
    res.status(204).send()
  })
)

creatorProfileRoutes.get(
  "/portfolio",
  asyncRoute(async (req, res) => {
    res.json({ items: await listCreatorPortfolio(req.auth!.id) })
  })
)

creatorProfileRoutes.post(
  "/portfolio",
  validateBody(createPortfolioItemSchema),
  asyncRoute(async (req, res) => {
    const item = await createCreatorPortfolioItem(req.auth!.id, req.body)
    res.status(201).json({ item })
  })
)

creatorProfileRoutes.delete(
  "/portfolio/:id",
  asyncRoute(async (req, res) => {
    const { assetId: id } = assetIdParamSchema.parse({ assetId: req.params.id })
    await deleteCreatorPortfolioItem(req.auth!.id, id)
    res.status(204).send()
  })
)

creatorProfileRoutes.patch(
  "/portfolio/:id/image",
  validateBody(attachAssetSchema),
  asyncRoute(async (req, res) => {
    const { assetId: portfolioItemId } = assetIdParamSchema.parse({ assetId: req.params.id })
    await attachPortfolioImage(req.auth!.id, portfolioItemId, req.body.assetId)
    res.status(204).send()
  })
)

brandProfileRoutes.use(requireAuth, requireRoles("brand"))

brandProfileRoutes.get(
  "/payments",
  asyncRoute(async (req, res) => {
    const query = paymentHistoryQuerySchema.parse(req.query)
    res.json({
      payments: await listBrandPaymentHistory(req.auth!.id, { limit: query.limit }),
    })
  })
)

brandProfileRoutes.get(
  "/profile",
  asyncRoute(async (req, res) => {
    res.json({ profile: await getBrandProfile(req.auth!.id) })
  })
)

brandProfileRoutes.patch(
  "/profile",
  validateBody(updateBrandProfileSchema),
  asyncRoute(async (req, res) => {
    res.json({ profile: await updateBrandProfile(req.auth!.id, req.body) })
  })
)

brandProfileRoutes.patch(
  "/logo",
  validateBody(attachAssetSchema),
  asyncRoute(async (req, res) => {
    await attachBrandLogo(req.auth!.id, req.body.assetId)
    res.status(204).send()
  })
)
