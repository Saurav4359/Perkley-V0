import { z } from "zod"

export const campaignIdParamSchema = z.object({
  id: z.uuid(),
})
