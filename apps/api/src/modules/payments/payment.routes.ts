import { Router } from "express"

import { asyncRoute } from "../../middleware/async-route"
import { requireAuth, requireRoles } from "../../middleware/auth"
import { validateBody } from "../../middleware/validate"
import { campaignIdParamSchema } from "../campaigns/campaign.schemas"
import {
  confirmCampaignEscrowFunding,
  getCampaignEscrow,
  initiateCampaignEscrowFunding,
  refundCampaignEscrow,
  releaseCampaignPayments,
} from "./payment.service"
import { confirmEscrowSchema, releasePaymentsSchema } from "./payment.schemas"

export const campaignPaymentRoutes = Router({ mergeParams: true })

campaignPaymentRoutes.use(requireAuth, requireRoles("brand"))

campaignPaymentRoutes.get(
  "/escrow",
  asyncRoute(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params)
    res.json(await getCampaignEscrow(req.auth!.id, id))
  })
)

campaignPaymentRoutes.post(
  "/escrow/fund",
  asyncRoute(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params)
    res.json(await initiateCampaignEscrowFunding(req.auth!.id, id))
  })
)

campaignPaymentRoutes.post(
  "/escrow/confirm",
  validateBody(confirmEscrowSchema),
  asyncRoute(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params)
    res.json(await confirmCampaignEscrowFunding(req.auth!.id, id, req.body))
  })
)

campaignPaymentRoutes.post(
  "/escrow/refund",
  asyncRoute(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params)
    res.json(await refundCampaignEscrow(req.auth!.id, id))
  })
)

campaignPaymentRoutes.post(
  "/payments/release",
  validateBody(releasePaymentsSchema),
  asyncRoute(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params)
    res.json(await releaseCampaignPayments(req.auth!.id, id, req.body))
  })
)
