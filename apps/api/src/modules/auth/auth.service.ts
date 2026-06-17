import { Prisma, type OAuthProvider, type User, type UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"

import { conflict, unauthorized } from "../../lib/http-error"
import { prisma } from "../../lib/prisma"
import { encryptSecret } from "../../lib/secrets"
import type { SigninInput, SignupInput } from "./auth.schemas"
import type { GoogleProfile, InstagramProfile, SupabaseGoogleProfile } from "./oauth"
import { createSessionTokens, type SessionUser, type SessionTokens } from "./session"

const passwordCost = 12

type UserWithProfiles = User & {
  creatorProfile?: { displayName: string; instagramHandle: string | null } | null
  brandProfile?: { brandName: string } | null
}

export function publicUser(user: UserWithProfiles) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    emailVerified: user.emailVerified,
    displayName:
      user.creatorProfile?.displayName ?? user.brandProfile?.brandName ?? user.email,
    instagramHandle: user.creatorProfile?.instagramHandle ?? null,
    createdAt: user.createdAt,
  }
}

async function issueSession(user: Pick<User, "id" | "role" | "email">): Promise<SessionTokens> {
  const sessionUser: SessionUser = {
    id: user.id,
    role: user.role,
    email: user.email,
  }

  return createSessionTokens(sessionUser)
}

function isUniqueViolation(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
}

function assertActive(user: Pick<User, "status">) {
  if (user.status !== "active") {
    throw unauthorized("This account is not active.")
  }
}

export async function signup(input: SignupInput) {
  const passwordHash = await bcrypt.hash(input.password, passwordCost)

  try {
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        role: input.role,
        emailVerified: false,
        creatorProfile:
          input.role === "creator"
            ? {
                create: {
                  displayName: input.displayName ?? input.email.split("@")[0],
                },
              }
            : undefined,
        brandProfile:
          input.role === "brand"
            ? {
                create: {
                  brandName: input.brandName!,
                  workEmail: input.email,
                },
              }
            : undefined,
      },
      include: {
        creatorProfile: true,
        brandProfile: true,
      },
    })

    return {
      user: publicUser(user),
      tokens: await issueSession(user),
    }
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw conflict("An account with this email already exists.", "email_taken")
    }

    throw error
  }
}

export async function signin(input: SigninInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: {
      creatorProfile: true,
      brandProfile: true,
    },
  })

  if (!user?.passwordHash) {
    throw unauthorized("Invalid email or password.")
  }

  assertActive(user)

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash)
  if (!passwordMatches) {
    throw unauthorized("Invalid email or password.")
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
    include: {
      creatorProfile: true,
      brandProfile: true,
    },
  })

  return {
    user: publicUser(updated),
    tokens: await issueSession(updated),
  }
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      creatorProfile: true,
      brandProfile: true,
    },
  })

  if (!user) throw unauthorized()
  assertActive(user)

  return publicUser(user)
}

export async function refreshSession(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      creatorProfile: true,
      brandProfile: true,
    },
  })

  if (!user) throw unauthorized()
  assertActive(user)

  return {
    user: publicUser(user),
    tokens: await issueSession(user),
  }
}

async function upsertOAuthAccount(input: {
  userId: string
  provider: OAuthProvider
  providerAccountId: string
  email?: string | null
  username?: string | null
  accessToken?: string | null
  refreshToken?: string | null
  expiresAt?: Date | null
  rawProfile: Prisma.InputJsonObject
}) {
  await prisma.oAuthAccount.upsert({
    where: {
      provider_providerAccountId: {
        provider: input.provider,
        providerAccountId: input.providerAccountId,
      },
    },
    create: {
      userId: input.userId,
      provider: input.provider,
      providerAccountId: input.providerAccountId,
      email: input.email,
      username: input.username,
      accessToken: encryptSecret(input.accessToken),
      refreshToken: encryptSecret(input.refreshToken),
      expiresAt: input.expiresAt,
      rawProfile: input.rawProfile,
    },
    update: {
      email: input.email,
      username: input.username,
      accessToken: encryptSecret(input.accessToken),
      refreshToken: encryptSecret(input.refreshToken),
      expiresAt: input.expiresAt,
      rawProfile: input.rawProfile,
    },
  })
}

async function createOAuthUser(input: {
  role: UserRole
  email?: string | null
  emailVerified?: boolean
  displayName: string
}) {
  return prisma.user.create({
    data: {
      email: input.email,
      role: input.role,
      emailVerified: input.emailVerified ?? false,
      creatorProfile:
        input.role === "creator"
          ? {
              create: {
                displayName: input.displayName,
              },
            }
          : undefined,
      brandProfile:
        input.role === "brand"
          ? {
              create: {
                brandName: input.displayName,
                workEmail: input.email ?? undefined,
              },
            }
          : undefined,
    },
    include: {
      creatorProfile: true,
      brandProfile: true,
    },
  })
}

export async function completeGoogleOAuth(input: {
  profile: GoogleProfile
  role: UserRole
  linkUserId?: string | null
}) {
  const existingOAuth = await prisma.oAuthAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider: "google",
        providerAccountId: input.profile.providerAccountId,
      },
    },
    include: {
      user: {
        include: {
          creatorProfile: true,
          brandProfile: true,
        },
      },
    },
  })

  let user = existingOAuth?.user ?? null

  if (!user && input.linkUserId) {
    user = await prisma.user.findUnique({
      where: { id: input.linkUserId },
      include: {
        creatorProfile: true,
        brandProfile: true,
      },
    })
  }

  if (!user) {
    const existingEmailUser = await prisma.user.findUnique({
      where: { email: input.profile.email },
      include: {
        creatorProfile: true,
        brandProfile: true,
      },
    })

    user =
      existingEmailUser ??
      (await createOAuthUser({
        role: input.role,
        email: input.profile.email,
        emailVerified: input.profile.emailVerified,
        displayName: input.profile.name ?? input.profile.email.split("@")[0],
      }))
  }

  assertActive(user)

  await upsertOAuthAccount({
    userId: user.id,
    provider: "google",
    providerAccountId: input.profile.providerAccountId,
    email: input.profile.email,
    accessToken: input.profile.accessToken,
    refreshToken: input.profile.refreshToken,
    expiresAt: input.profile.expiresAt,
    rawProfile: input.profile.rawProfile as Prisma.InputJsonObject,
  })

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: user.email === input.profile.email ? input.profile.emailVerified : undefined,
      lastLoginAt: new Date(),
    },
    include: {
      creatorProfile: true,
      brandProfile: true,
    },
  })

  return {
    user: publicUser(updated),
    tokens: await issueSession(updated),
  }
}

/**
 * Bridges a verified Supabase Google identity onto a Perkley account. Supabase
 * only proves the Google identity — this mints the app's own `perkley_session`
 * so every existing API call, role check, and dashboard keeps working. Matches
 * the same user whether they previously signed in via the API's Google OAuth
 * (shared Google `sub`) or by email.
 */
export async function completeSupabaseOAuth(input: {
  profile: SupabaseGoogleProfile
  role: UserRole
  linkUserId?: string | null
}) {
  const { profile } = input

  let user: UserWithProfiles | null = null

  if (profile.googleSub) {
    const existingOAuth = await prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId: profile.googleSub,
        },
      },
      include: {
        user: { include: { creatorProfile: true, brandProfile: true } },
      },
    })
    user = existingOAuth?.user ?? null
  }

  if (!user && input.linkUserId) {
    user = await prisma.user.findUnique({
      where: { id: input.linkUserId },
      include: { creatorProfile: true, brandProfile: true },
    })
  }

  if (!user) {
    const existingEmailUser = await prisma.user.findUnique({
      where: { email: profile.email },
      include: { creatorProfile: true, brandProfile: true },
    })

    user =
      existingEmailUser ??
      (await createOAuthUser({
        role: input.role,
        email: profile.email,
        emailVerified: profile.emailVerified,
        displayName: profile.name ?? profile.email.split("@")[0],
      }))
  }

  assertActive(user)

  if (profile.googleSub) {
    await upsertOAuthAccount({
      userId: user.id,
      provider: "google",
      providerAccountId: profile.googleSub,
      email: profile.email,
      rawProfile: profile.rawProfile as Prisma.InputJsonObject,
    })
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: user.email === profile.email ? profile.emailVerified : undefined,
      lastLoginAt: new Date(),
    },
    include: { creatorProfile: true, brandProfile: true },
  })

  return {
    user: publicUser(updated),
    tokens: await issueSession(updated),
  }
}

export async function completeInstagramOAuth(input: {
  profile: InstagramProfile
  role: UserRole
  linkUserId?: string | null
}) {
  const existingOAuth = await prisma.oAuthAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider: "instagram",
        providerAccountId: input.profile.providerAccountId,
      },
    },
    include: {
      user: {
        include: {
          creatorProfile: true,
          brandProfile: true,
        },
      },
    },
  })

  let user = existingOAuth?.user ?? null

  if (!user && input.linkUserId) {
    user = await prisma.user.findUnique({
      where: { id: input.linkUserId },
      include: {
        creatorProfile: true,
        brandProfile: true,
      },
    })
  }

  if (!user) {
    user = await createOAuthUser({
      role: input.role,
      email: null,
      displayName: input.profile.username,
    })
  }

  assertActive(user)

  await upsertOAuthAccount({
    userId: user.id,
    provider: "instagram",
    providerAccountId: input.profile.providerAccountId,
    username: input.profile.username,
    accessToken: input.profile.accessToken,
    expiresAt: input.profile.expiresAt,
    rawProfile: input.profile.rawProfile as Prisma.InputJsonObject,
  })

  if (user.role === "creator") {
    await prisma.creatorProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        displayName: input.profile.username,
        instagramHandle: input.profile.username,
        instagramUserId: input.profile.providerAccountId,
      },
      update: {
        instagramHandle: input.profile.username,
        instagramUserId: input.profile.providerAccountId,
      },
    })
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
    include: {
      creatorProfile: true,
      brandProfile: true,
    },
  })

  return {
    user: publicUser(updated),
    tokens: await issueSession(updated),
  }
}
