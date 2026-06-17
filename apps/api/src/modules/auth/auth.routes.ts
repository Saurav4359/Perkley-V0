import { Router } from "express"

import { getEnv, getRefreshCookieName } from "../../lib/env"
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
  supabaseBridgeSchema,
} from "./auth.schemas"
import {
  completeGoogleOAuth,
  completeInstagramOAuth,
  completeSupabaseOAuth,
  getCurrentUser,
  refreshSession,
  signin,
  signup,
} from "./auth.service"
import {
  consumeOAuthState,
  createOAuthState,
  exchangeGoogleCode,
  exchangeInstagramCode,
  fetchSupabaseUser,
  getGoogleAuthorizationUrl,
  getInstagramAuthorizationUrl,
} from "./oauth"
import {
  clearSessionCookies,
  getOptionalSession,
  setSessionCookies,
  verifyRefreshToken,
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
    setSessionCookies(res, result.tokens)
    res.status(201).json({ user: result.user })
  })
)

authRoutes.post(
  "/signin",
  authRateLimit,
  validateBody(signinSchema),
  asyncRoute(async (req, res) => {
    const result = await signin(req.body)
    setSessionCookies(res, result.tokens)
    res.json({ user: result.user })
  })
)

authRoutes.post("/signout", (_req, res) => {
  clearSessionCookies(res)
  res.status(204).send()
})

authRoutes.post(
  "/refresh",
  authRateLimit,
  asyncRoute(async (req, res) => {
    const env = getEnv()
    const refreshToken = req.cookies?.[getRefreshCookieName(env)]
    if (!refreshToken) {
      clearSessionCookies(res)
      res.status(401).json({ error: "Session expired.", code: "unauthorized" })
      return
    }

    const { userId } = await verifyRefreshToken(refreshToken)
    const result = await refreshSession(userId)
    setSessionCookies(res, result.tokens)
    res.json({ user: result.user })
  })
)

authRoutes.get(
  "/me",
  requireAuth,
  asyncRoute(async (req, res) => {
    const user = await getCurrentUser(req.auth!.id)
    res.json({ user })
  })
)

/**
 * Bridges a Supabase Google sign-in into a Perkley session. The web app
 * authenticates with Supabase, then posts the resulting Supabase access token
 * here; we verify it with Supabase, link/mint the Perkley user, and set the
 * usual `perkley_session` cookie so the rest of the app is unaffected.
 */
authRoutes.post(
  "/supabase",
  authRateLimit,
  validateBody(supabaseBridgeSchema),
  asyncRoute(async (req, res) => {
    const profile = await fetchSupabaseUser(req.body.accessToken)
    const session = await getOptionalSession(req)
    const result = await completeSupabaseOAuth({
      profile,
      role: req.body.role,
      linkUserId: session?.id,
    })

    setSessionCookies(res, result.tokens)
    res.json({ user: result.user })
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

    setSessionCookies(res, result.tokens)
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

    setSessionCookies(res, result.tokens)
    res.redirect(redirectAfterOAuth(state.redirectTo))
  })
)
