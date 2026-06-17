import { Router } from "express"

import { getEnv } from "../../lib/env"
import { badRequest } from "../../lib/http-error"
import { asyncRoute } from "../../middleware/async-route"
import { requireAuth } from "../../middleware/auth"
import { authRateLimit, oauthRateLimit } from "../../middleware/rate-limit"
import { validateBody } from "../../middleware/validate"
import {
  oauthCallbackQuerySchema,
  oauthStartQuerySchema,
  signinSchema,
  signupSchema,
} from "./auth.schemas"
import {
  completeGoogleOAuth,
  completeInstagramOAuth,
  getCurrentUser,
  signin,
  signup,
} from "./auth.service"
import {
  consumeOAuthState,
  createOAuthState,
  exchangeGoogleCode,
  exchangeInstagramCode,
  getGoogleAuthorizationUrl,
  getInstagramAuthorizationUrl,
} from "./oauth"
import {
  clearSessionCookie,
  getOptionalSession,
  setSessionCookie,
} from "./session"

export const authRoutes = Router()

function redirectAfterOAuth(path?: string | null) {
  const env = getEnv()
  return new URL(path || "/dashboard", env.FRONTEND_URL).toString()
}

authRoutes.post(
  "/signup",
  authRateLimit,
  validateBody(signupSchema),
  asyncRoute(async (req, res) => {
    const result = await signup(req.body)
    setSessionCookie(res, result.token)
    res.status(201).json({ user: result.user })
  })
)

authRoutes.post(
  "/signin",
  authRateLimit,
  validateBody(signinSchema),
  asyncRoute(async (req, res) => {
    const result = await signin(req.body)
    setSessionCookie(res, result.token)
    res.json({ user: result.user })
  })
)

authRoutes.post("/signout", (_req, res) => {
  clearSessionCookie(res)
  res.status(204).send()
})

authRoutes.get(
  "/me",
  requireAuth,
  asyncRoute(async (req, res) => {
    const user = await getCurrentUser(req.auth!.id)
    res.json({ user })
  })
)

authRoutes.get(
  "/oauth/google/start",
  oauthRateLimit,
  asyncRoute(async (req, res) => {
    const query = oauthStartQuerySchema.parse(req.query)
    const session = await getOptionalSession(req)
    const state = await createOAuthState({
      provider: "google",
      role: query.role,
      redirectTo: query.redirectTo,
      userId: session?.id,
    })

    res.redirect(await getGoogleAuthorizationUrl(state))
  })
)

authRoutes.get(
  "/oauth/google/callback",
  oauthRateLimit,
  asyncRoute(async (req, res) => {
    const query = oauthCallbackQuerySchema.parse(req.query)
    if (query.error) {
      throw badRequest(query.error_description ?? query.error)
    }
    if (!query.code) throw badRequest("Missing Google OAuth code.")

    const state = await consumeOAuthState("google", query.state)
    const profile = await exchangeGoogleCode(query.code)
    const result = await completeGoogleOAuth({
      profile,
      role: state.role,
      linkUserId: state.userId,
    })

    setSessionCookie(res, result.token)
    res.redirect(redirectAfterOAuth(state.redirectTo))
  })
)

authRoutes.get(
  "/oauth/instagram/start",
  oauthRateLimit,
  asyncRoute(async (req, res) => {
    const query = oauthStartQuerySchema.parse(req.query)
    const session = await getOptionalSession(req)
    const state = await createOAuthState({
      provider: "instagram",
      role: query.role,
      redirectTo: query.redirectTo,
      userId: session?.id,
    })

    res.redirect(await getInstagramAuthorizationUrl(state))
  })
)

authRoutes.get(
  "/oauth/instagram/callback",
  oauthRateLimit,
  asyncRoute(async (req, res) => {
    const query = oauthCallbackQuerySchema.parse(req.query)
    if (query.error) {
      throw badRequest(query.error_description ?? query.error)
    }
    if (!query.code) throw badRequest("Missing Instagram OAuth code.")

    const state = await consumeOAuthState("instagram", query.state)
    const profile = await exchangeInstagramCode(query.code)
    const result = await completeInstagramOAuth({
      profile,
      role: state.role,
      linkUserId: state.userId,
    })

    setSessionCookie(res, result.token)
    res.redirect(redirectAfterOAuth(state.redirectTo))
  })
)
