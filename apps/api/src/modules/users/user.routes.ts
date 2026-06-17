import { Router } from "express"

import { asyncRoute } from "../../middleware/async-route"
import { requireAuth } from "../../middleware/auth"
import { validateBody } from "../../middleware/validate"
import { getMe, updateMe } from "../profiles/profile.service"
import { updateUserSchema } from "../profiles/profile.schemas"

export const userRoutes = Router()

userRoutes.use(requireAuth)

userRoutes.get(
  "/me",
  asyncRoute(async (req, res) => {
    res.json({ user: await getMe(req.auth!.id) })
  })
)

userRoutes.patch(
  "/me",
  validateBody(updateUserSchema),
  asyncRoute(async (req, res) => {
    res.json({ user: await updateMe(req.auth!.id, req.body) })
  })
)
