import { Router } from "express"

import { asyncRoute } from "../../middleware/async-route"
import { requireAuth } from "../../middleware/auth"
import {
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "./notification.service"
import { listNotificationsQuerySchema, notificationIdParamSchema } from "./notification.schemas"

export const notificationRoutes = Router()

notificationRoutes.use(requireAuth)

notificationRoutes.get(
  "/",
  asyncRoute(async (req, res) => {
    const query = listNotificationsQuerySchema.parse(req.query)
    res.json({
      notifications: await listNotifications(req.auth!.id, {
        limit: query.limit,
        unreadOnly: query.unreadOnly,
      }),
    })
  })
)

notificationRoutes.get(
  "/unread-count",
  asyncRoute(async (req, res) => {
    res.json(await getUnreadNotificationCount(req.auth!.id))
  })
)

notificationRoutes.post(
  "/read-all",
  asyncRoute(async (req, res) => {
    res.json(await markAllNotificationsRead(req.auth!.id))
  })
)

notificationRoutes.post(
  "/:id/read",
  asyncRoute(async (req, res) => {
    const { id } = notificationIdParamSchema.parse(req.params)
    res.json({
      notification: await markNotificationRead(req.auth!.id, id),
    })
  })
)
