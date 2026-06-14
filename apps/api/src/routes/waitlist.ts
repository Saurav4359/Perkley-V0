import { createSupabaseAdmin } from "@perkley/database"
import { sendWaitlistConfirmation } from "@perkley/email"
import { toWaitlistInsertRow, waitlistSchema } from "@perkley/validations"
import { Hono } from "hono"

export const waitlistRoutes = new Hono()

waitlistRoutes.post("/", async (c) => {
  try {
    const body = await c.req.json()
    const parsed = waitlistSchema.safeParse(body)

    if (!parsed.success) {
      return c.json(
        {
          error: "Validation failed",
          issues: parsed.error.flatten().fieldErrors,
        },
        400
      )
    }

    const data = parsed.data
    const supabase = createSupabaseAdmin()

    if (!supabase) {
      return c.json({ error: "Waitlist storage is not configured" }, 503)
    }

    const { error } = await supabase
      .from("waitlist")
      .insert(toWaitlistInsertRow(data) as never)

    if (error) {
      if (error.code === "23505") {
        return c.json(
          { error: "This email is already on the waitlist for this role" },
          409
        )
      }

      console.error("Supabase insert error:", error)
      return c.json({ error: "Failed to save your submission" }, 500)
    }

    try {
      await sendWaitlistConfirmation(data)
    } catch (emailError) {
      console.error("Email send error:", emailError)
    }

    return c.json({ success: true })
  } catch (error) {
    console.error("Waitlist API error:", error)
    return c.json({ error: "Something went wrong. Please try again." }, 500)
  }
})
