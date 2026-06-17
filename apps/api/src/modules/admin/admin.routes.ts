import { Router } from "express"

import { asyncRoute } from "../../middleware/async-route"
import { requireAuth, requireRoles } from "../../middleware/auth"
import { validateBody } from "../../middleware/validate"
import {
  getPlatformReport,
  listBrands,
  listCampaigns,
  listCreators,
  listPayments,
  listUsers,
  moderateCampaign,
  setBrandVerification,
  setCreatorVerification,
  updateUserStatus,
} from "./admin.service"
import {
  idParamSchema,
  listCampaignsQuerySchema,
  listPaymentsQuerySchema,
  listProfilesQuerySchema,
  listUsersQuerySchema,
  moderateCampaignSchema,
  updateUserStatusSchema,
  updateVerificationSchema,
} from "./admin.schemas"

export const adminRoutes = Router()

adminRoutes.use(requireAuth, requireRoles("admin"))

adminRoutes.get(
  "/users",
  asyncRoute(async (req, res) => {
    res.json(await listUsers(listUsersQuerySchema.parse(req.query)))
  })
)

adminRoutes.patch(
  "/users/:id/status",
  validateBody(updateUserStatusSchema),
  asyncRoute(async (req, res) => {
    const { id } = idParamSchema.parse(req.params)
    res.json(await updateUserStatus(id, req.body.status))
  })
)

adminRoutes.get(
  "/creators",
  asyncRoute(async (req, res) => {
    res.json(await listCreators(listProfilesQuerySchema.parse(req.query)))
  })
)

adminRoutes.patch(
  "/creators/:id/verification",
  validateBody(updateVerificationSchema),
  asyncRoute(async (req, res) => {
    const { id } = idParamSchema.parse(req.params)
    res.json(await setCreatorVerification(id, req.body.verificationStatus))
  })
)

adminRoutes.get(
  "/brands",
  asyncRoute(async (req, res) => {
    res.json(await listBrands(listProfilesQuerySchema.parse(req.query)))
  })
)

adminRoutes.patch(
  "/brands/:id/verification",
  validateBody(updateVerificationSchema),
  asyncRoute(async (req, res) => {
    const { id } = idParamSchema.parse(req.params)
    res.json(await setBrandVerification(id, req.body.verificationStatus))
  })
)

adminRoutes.get(
  "/campaigns",
  asyncRoute(async (req, res) => {
    res.json(await listCampaigns(listCampaignsQuerySchema.parse(req.query)))
  })
)

adminRoutes.post(
  "/campaigns/:id/moderate",
  validateBody(moderateCampaignSchema),
  asyncRoute(async (req, res) => {
    const { id } = idParamSchema.parse(req.params)
    res.json(await moderateCampaign(id, req.body.reason))
  })
)

adminRoutes.get(
  "/payments",
  asyncRoute(async (req, res) => {
    res.json(await listPayments(listPaymentsQuerySchema.parse(req.query)))
  })
)

adminRoutes.get(
  "/reports",
  asyncRoute(async (_req, res) => {
    res.json({ report: await getPlatformReport() })
  })
)
