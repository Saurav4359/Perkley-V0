import { Router } from "express"

import { asyncRoute } from "../../middleware/async-route"
import { requireAuth, requireRoles } from "../../middleware/auth"
import { getCampaignLeaderboard, selectCampaignWinners } from "./leaderboard.service"
import { campaignIdParamSchema } from "./leaderboard.schemas"

export const campaignLeaderboardRoutes = Router()

campaignLeaderboardRoutes.get(
  "/leaderboard",
  asyncRoute(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params)
    res.json({ leaderboard: await getCampaignLeaderboard(id) })
  })
)

campaignLeaderboardRoutes.post(
  "/leaderboard/select-winners",
  requireAuth,
  requireRoles("brand"),
  asyncRoute(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params)
    res.json(await selectCampaignWinners(req.auth!.id, id))
  })
)
