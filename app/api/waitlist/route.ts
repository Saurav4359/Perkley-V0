import { NextResponse } from "next/server"

import { sendWaitlistConfirmation } from "@/lib/email"
import { createSupabaseAdmin } from "@/lib/supabase/server"
import { waitlistSchema } from "@/lib/validations/waitlist"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = waitlistSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const data = parsed.data
    const supabase = createSupabaseAdmin()

    if (!supabase) {
      return NextResponse.json(
        { error: "Waitlist storage is not configured" },
        { status: 503 }
      )
    }

    const row = {
      role: data.role,
      name: data.name,
      email: data.email,
      company: data.role === "brand" ? data.company : null,
      instagram: data.role === "creator" ? data.instagram : null,
      niche: data.role === "creator" ? data.niche : null,
      followers: data.role === "creator" ? data.followers : null,
    }

    const { error } = await supabase.from("waitlist").insert(row as never)

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "This email is already on the waitlist for this role" },
          { status: 409 }
        )
      }

      console.error("Supabase insert error:", error)
      return NextResponse.json(
        { error: "Failed to save your submission" },
        { status: 500 }
      )
    }

    try {
      await sendWaitlistConfirmation(data)
    } catch (emailError) {
      console.error("Email send error:", emailError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Waitlist API error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
