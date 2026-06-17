import { Router } from "express"

import { asyncRoute } from "../../middleware/async-route"
import { requireAuth, requireRoles } from "../../middleware/auth"
import { validateBody } from "../../middleware/validate"
import { forbidden } from "../../lib/http-error"
import {
  approveSubmission,
  createSubmission,
  getMyCampaignSubmission,
  listCampaignSubmissions,
  rejectSubmission,
  updateMyCampaignSubmission,
  validateSubmission,
} from "./submission.service"
import {
  campaignIdParamSchema,
  createSubmissionSchema,
  listSubmissionsQuerySchema,
  rejectSubmissionSchema,
  submissionParamsSchema,
  updateSubmissionSchema,
} from "./submission.schemas"

export const campaignSubmissionRoutes = Router()

campaignSubmissionRoutes.post(
  "/submissions",
  requireAuth,
  requireRoles("creator"),
  validateBody(createSubmissionSchema),
  asyncRoute(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params)
    const submission = await createSubmission(req.auth!.id, id, req.body)
    res.status(201).json({ submission })
  })
)

campaignSubmissionRoutes.get(
  "/submissions/mine",
  requireAuth,
  requireRoles("creator"),
  asyncRoute(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params)
    res.json({ submission: await getMyCampaignSubmission(req.auth!.id, id) })
  })
)

campaignSubmissionRoutes.patch(
  "/submissions/mine",
  requireAuth,
  requireRoles("creator"),
  validateBody(updateSubmissionSchema),
  asyncRoute(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params)
    res.json({ submission: await updateMyCampaignSubmission(req.auth!.id, id, req.body) })
  })
)

campaignSubmissionRoutes.get(
  "/submissions",
  requireAuth,
  requireRoles("brand"),
  asyncRoute(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params)
    const query = listSubmissionsQuerySchema.parse(req.query)
    res.json({
      submissions: await listCampaignSubmissions(req.auth!.id, id, query.status),
    })
  })
)

campaignSubmissionRoutes.post(
  "/submissions/:submissionId/validate",
  requireAuth,
  asyncRoute(async (req, res) => {
    const { id, submissionId } = submissionParamsSchema.parse(req.params)
    const role = req.auth!.role
    if (role !== "creator" && role !== "brand") {
      throw forbidden()
    }

    res.json({
      submission: await validateSubmission(req.auth!.id, role, id, submissionId),
    })
  })
)

campaignSubmissionRoutes.post(
  "/submissions/:submissionId/approve",
  requireAuth,
  requireRoles("brand"),
  asyncRoute(async (req, res) => {
    const { id, submissionId } = submissionParamsSchema.parse(req.params)
    res.json({
      submission: await approveSubmission(req.auth!.id, id, submissionId),
    })
  })
)

campaignSubmissionRoutes.post(
  "/submissions/:submissionId/reject",
  requireAuth,
  requireRoles("brand"),
  validateBody(rejectSubmissionSchema),
  asyncRoute(async (req, res) => {
    const { id, submissionId } = submissionParamsSchema.parse(req.params)
    res.json({
      submission: await rejectSubmission(req.auth!.id, id, submissionId, req.body),
    })
  })
)
