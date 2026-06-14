import nodemailer from "nodemailer"

import type { WaitlistInput } from "@perkley/validations"

function getTransporter() {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !port || !user || !pass) {
    return null
  }

  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  })
}

export async function sendWaitlistConfirmation(input: WaitlistInput) {
  const transporter = getTransporter()
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER

  if (!transporter || !from) {
    return { sent: false as const, reason: "SMTP not configured" }
  }

  const roleLabel = input.role === "brand" ? "Brand" : "Creator"

  await transporter.sendMail({
    from,
    to: input.email,
    subject: "You're on the Perkley waitlist",
    text: [
      `Hi ${input.name},`,
      "",
      `Thanks for joining the Perkley waitlist as a ${roleLabel}.`,
      "",
      "We're building a performance-driven creator marketing platform where brands launch campaigns and creators compete for rewards.",
      "",
      "You're on the list for early access. We'll reach out as we open the next cohort.",
      "",
      "— The Perkley team",
    ].join("\n"),
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111; line-height: 1.6; max-width: 560px;">
        <p>Hi ${input.name},</p>
        <p>Thanks for joining the Perkley waitlist as a <strong>${roleLabel}</strong>.</p>
        <p>We're building a performance-driven creator marketing platform where brands launch campaigns and creators compete for rewards.</p>
        <p><strong>You're on the list for early access.</strong> We'll reach out as we open the next cohort.</p>
        <p style="color: #666;">— The Perkley team</p>
      </div>
    `,
  })

  return { sent: true as const }
}
