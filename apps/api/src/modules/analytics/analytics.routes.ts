import { Router } from "express"

import { asyncRoute } from "../../middleware/async-route"
import { requireAuth, requireRoles } from "../../middleware/auth"
import { campaignIdParamSchema } from "./analytics.schemas"
import {
  getBrandAnalytics,
  getCampaignAnalytics,
  getCreatorAnalytics,
} from "./analytics.service"

export const analyticsRoutes = Router()

analyticsRoutes.get(
  "/creator",
  requireAuth,
  requireRoles("creator"),
  asyncRoute(async (req, res) => {
    res.json({ analytics: await getCreatorAnalytics(req.auth!.id) })
  })
)

analyticsRoutes.get(
  "/brand",
  requireAuth,
  requireRoles("brand"),
  asyncRoute(async (req, res) => {
    res.json({ analytics: await getBrandAnalytics(req.auth!.id) })
  })
)

export const campaignAnalyticsRoutes = Router({ mergeParams: true })

campaignAnalyticsRoutes.get(
  "/analytics",
  requireAuth,
  requireRoles("brand"),
  asyncRoute(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params)
    res.json({ analytics: await getCampaignAnalytics(req.auth!.id, id) })
  })
)
