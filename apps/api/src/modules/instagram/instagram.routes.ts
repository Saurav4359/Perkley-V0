import { Router } from "express"

import { asyncRoute } from "../../middleware/async-route"
import { requireAuth } from "../../middleware/auth"
import { submissionParamsSchema } from "../submissions/submission.schemas"
import { syncSubmissionMetrics } from "./instagram.service"

export const campaignInstagramRoutes = Router({ mergeParams: true })

campaignInstagramRoutes.post(
  "/submissions/:submissionId/sync-metrics",
  requireAuth,
  asyncRoute(async (req, res) => {
    const { id, submissionId } = submissionParamsSchema.parse(req.params)
    const role = req.auth!.role

    if (role !== "creator" && role !== "brand") {
      res.status(403).json({ error: "Forbidden", code: "forbidden" })
      return
    }

    res.json(await syncSubmissionMetrics(req.auth!.id, role, id, submissionId))
  })
)
