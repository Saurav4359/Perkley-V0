import type { User } from "@prisma/client"

import { conflict } from "../../lib/http-error"

type OAuthLinkUser = Pick<User, "id">

export function resolveOAuthLinkUser<T extends OAuthLinkUser>(
  existingOAuthUser: T | null | undefined,
  linkUserId?: string | null
): T | null {
  if (linkUserId && existingOAuthUser && existingOAuthUser.id !== linkUserId) {
    throw conflict(
      "This provider account is already linked to another user.",
      "oauth_account_taken"
    )
  }

  return existingOAuthUser ?? null
}
