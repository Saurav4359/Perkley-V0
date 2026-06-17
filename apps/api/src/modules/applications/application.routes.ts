import { Router } from "express"

import { asyncRoute } from "../../middleware/async-route"
import { requireAuth, requireRoles } from "../../middleware/auth"
import { validateBody } from "../../middleware/validate"
import {
  acceptApplication,
  applyToCampaign,
  listCampaignApplications,
  rejectApplication,
  withdrawApplication,
} from "./application.service"
import {
  applicationParamsSchema,
  applyToCampaignSchema,
  campaignIdParamSchema,
  listApplicationsQuerySchema,
} from "./application.schemas"

export const campaignApplicationRoutes = Router()

campaignApplicationRoutes.post(
  "/apply",
  requireAuth,
  requireRoles("creator"),
  validateBody(applyToCampaignSchema),
  asyncRoute(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params)
    const application = await applyToCampaign(req.auth!.id, id, req.body)
    res.status(201).json({ application })
  })
)

campaignApplicationRoutes.delete(
  "/apply",
  requireAuth,
  requireRoles("creator"),
  asyncRoute(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params)
    const application = await withdrawApplication(req.auth!.id, id)
    res.json({ application })
  })
)

campaignApplicationRoutes.get(
  "/applications",
  requireAuth,
  requireRoles("brand"),
  asyncRoute(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params)
    const query = listApplicationsQuerySchema.parse(req.query)
    res.json({
      applications: await listCampaignApplications(req.auth!.id, id, query.status),
    })
  })
)

campaignApplicationRoutes.post(
  "/applications/:applicationId/accept",
  requireAuth,
  requireRoles("brand"),
  asyncRoute(async (req, res) => {
    const { id, applicationId } = applicationParamsSchema.parse(req.params)
    res.json({
      application: await acceptApplication(req.auth!.id, id, applicationId),
    })
  })
)

campaignApplicationRoutes.post(
  "/applications/:applicationId/reject",
  requireAuth,
  requireRoles("brand"),
  asyncRoute(async (req, res) => {
    const { id, applicationId } = applicationParamsSchema.parse(req.params)
    res.json({
      application: await rejectApplication(req.auth!.id, id, applicationId),
    })
  })
)
