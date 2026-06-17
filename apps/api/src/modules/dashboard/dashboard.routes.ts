import { Router } from "express"

import { asyncRoute } from "../../middleware/async-route"
import { requireAuth, requireRoles } from "../../middleware/auth"
import {
  getBrandDashboard,
  getBrandRecentActivity,
  getBrandStats,
  getCreatorDashboard,
  getCreatorRecentActivity,
  getCreatorStats,
  searchBrandCampaigns,
  searchCreatorCampaigns,
} from "./dashboard.service"
import { dashboardActivityQuerySchema, dashboardSearchQuerySchema } from "./dashboard.schemas"

export const creatorDashboardRoutes = Router()
export const brandDashboardRoutes = Router()

creatorDashboardRoutes.use(requireAuth, requireRoles("creator"))
brandDashboardRoutes.use(requireAuth, requireRoles("brand"))

creatorDashboardRoutes.get(
  "/",
  asyncRoute(async (req, res) => {
    res.json({ dashboard: await getCreatorDashboard(req.auth!.id) })
  })
)

creatorDashboardRoutes.get(
  "/stats",
  asyncRoute(async (req, res) => {
    res.json({ stats: await getCreatorStats(req.auth!.id) })
  })
)

creatorDashboardRoutes.get(
  "/activity",
  asyncRoute(async (req, res) => {
    const query = dashboardActivityQuerySchema.parse(req.query)
    res.json({ activity: await getCreatorRecentActivity(req.auth!.id, query.limit) })
  })
)

creatorDashboardRoutes.get(
  "/search",
  asyncRoute(async (req, res) => {
    const query = dashboardSearchQuerySchema.parse(req.query)
    res.json({
      results: await searchCreatorCampaigns(query.q, query.limit),
    })
  })
)

brandDashboardRoutes.get(
  "/",
  asyncRoute(async (req, res) => {
    res.json({ dashboard: await getBrandDashboard(req.auth!.id) })
  })
)

brandDashboardRoutes.get(
  "/stats",
  asyncRoute(async (req, res) => {
    res.json({ stats: await getBrandStats(req.auth!.id) })
  })
)

brandDashboardRoutes.get(
  "/activity",
  asyncRoute(async (req, res) => {
    const query = dashboardActivityQuerySchema.parse(req.query)
    res.json({ activity: await getBrandRecentActivity(req.auth!.id, query.limit) })
  })
)

brandDashboardRoutes.get(
  "/search",
  asyncRoute(async (req, res) => {
    const query = dashboardSearchQuerySchema.parse(req.query)
    res.json({
      results: await searchBrandCampaigns(req.auth!.id, query.q, query.limit),
    })
  })
)
