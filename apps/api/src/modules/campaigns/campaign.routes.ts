import { Router } from "express"

import { asyncRoute } from "../../middleware/async-route"
import { optionalAuth, requireAuth, requireRoles } from "../../middleware/auth"
import { validateBody } from "../../middleware/validate"
import { campaignAnalyticsRoutes } from "../analytics/analytics.routes"
import { campaignApplicationRoutes } from "../applications/application.routes"
import { campaignInstagramRoutes } from "../instagram/instagram.routes"
import { campaignLeaderboardRoutes } from "../leaderboard/leaderboard.routes"
import { campaignPaymentRoutes } from "../payments/payment.routes"
import { campaignSubmissionRoutes } from "../submissions/submission.routes"
import {
  archiveCampaign,
  createCampaign,
  deleteCampaign,
  getCampaign,
  listMyCampaigns,
  listPublicCampaigns,
  publishCampaign,
  updateCampaign,
} from "./campaign.service"
import {
  campaignIdParamSchema,
  campaignListQuerySchema,
  createCampaignSchema,
  myCampaignsQuerySchema,
  updateCampaignSchema,
} from "./campaign.schemas"

export const campaignRoutes = Router()

campaignRoutes.get(
  "/",
  asyncRoute(async (req, res) => {
    const query = campaignListQuerySchema.parse(req.query)
    res.json({ campaigns: await listPublicCampaigns(query) })
  })
)

campaignRoutes.get(
  "/mine",
  requireAuth,
  requireRoles("brand"),
  asyncRoute(async (req, res) => {
    const query = myCampaignsQuerySchema.parse(req.query)
    res.json({ campaigns: await listMyCampaigns(req.auth!.id, query.status) })
  })
)

campaignRoutes.use("/:id", campaignApplicationRoutes)
campaignRoutes.use("/:id", campaignSubmissionRoutes)
campaignRoutes.use("/:id", campaignLeaderboardRoutes)
campaignRoutes.use("/:id", campaignPaymentRoutes)
campaignRoutes.use("/:id", campaignInstagramRoutes)
campaignRoutes.use("/:id", campaignAnalyticsRoutes)

campaignRoutes.get(
  "/:id",
  optionalAuth,
  asyncRoute(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params)
    res.json({ campaign: await getCampaign(id, req.auth?.id) })
  })
)

campaignRoutes.post(
  "/",
  requireAuth,
  requireRoles("brand"),
  validateBody(createCampaignSchema),
  asyncRoute(async (req, res) => {
    const campaign = await createCampaign(req.auth!.id, req.body)
    res.status(201).json({ campaign })
  })
)

campaignRoutes.patch(
  "/:id",
  requireAuth,
  requireRoles("brand"),
  validateBody(updateCampaignSchema),
  asyncRoute(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params)
    res.json({ campaign: await updateCampaign(req.auth!.id, id, req.body) })
  })
)

campaignRoutes.delete(
  "/:id",
  requireAuth,
  requireRoles("brand"),
  asyncRoute(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params)
    await deleteCampaign(req.auth!.id, id)
    res.status(204).send()
  })
)

campaignRoutes.post(
  "/:id/publish",
  requireAuth,
  requireRoles("brand"),
  asyncRoute(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params)
    res.json({ campaign: await publishCampaign(req.auth!.id, id) })
  })
)

campaignRoutes.post(
  "/:id/archive",
  requireAuth,
  requireRoles("brand"),
  asyncRoute(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params)
    res.json({ campaign: await archiveCampaign(req.auth!.id, id) })
  })
)
