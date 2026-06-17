import { Router } from "express"

import { asyncRoute } from "../../middleware/async-route"
import { requireAuth, requireRoles } from "../../middleware/auth"
import { badRequest } from "../../lib/http-error"
import { runAllJobs, runJob } from "./jobs.service"
import { isValidJobName } from "./jobs.utils"

export const jobsRoutes = Router()

jobsRoutes.use(requireAuth, requireRoles("admin"))

jobsRoutes.post(
  "/run",
  asyncRoute(async (_req, res) => {
    res.json(await runAllJobs())
  })
)

jobsRoutes.post(
  "/:job/run",
  asyncRoute(async (req, res) => {
    const job = String(req.params.job)
    if (!isValidJobName(job)) {
      throw badRequest("Unknown job name.", "unknown_job")
    }
    res.json({ result: await runJob(job) })
  })
)
