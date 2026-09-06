import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY || "re_123")

export const dynamic = "force-dynamic" // Ensure it doesn't get cached at build time

export async function GET(request: Request) {
  // Vercel secures cron jobs with a secret token
  const authHeader = request.headers.get("authorization")
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV !== "development") {
    return new Response("Unauthorized", { status: 401 })
  }

  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Find users with a streak of 2 or more
    const { data: users, error } = await sb
      .from("profiles")
      .select("email, current_streak")
      .gte("current_streak", 2)

    if (error) {
      console.error("Failed to fetch users for daily cron:", error)
      return new Response("Database Error", { status: 500 })
    }

    if (!users || users.length === 0) {
      return Response.json({ success: true, emailsSent: 0, message: "No users qualify for reminders today." })
    }

    // Send emails
    const emails = users.map((user) => ({
      from: "PatternFlow <anubhav@patternflowdsa.in>",
      to: [user.email],
      subject: `🔥 You're on a ${user.current_streak}-day streak!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1814;">
          <h2 style="color: #1a1814;">Keep the momentum going!</h2>
          <p>Hey there,</p>
          <p>You have successfully solved DSA problems for <strong>${user.current_streak} days in a row!</strong></p>
          <p>Consistency is the secret to cracking top-tier technical interviews. Don't let your streak break today.</p>
          <a href="https://patternflowdsa.in" style="display: inline-block; background-color: #f59e0b; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Solve Today's Problem</a>
        </div>
      `
    }))

    // Resend allows batch sending
    const { error: batchError } = await resend.batch.send(emails)

    if (batchError) {
      console.error("Failed to send batch emails:", batchError)
      return new Response("Email Batch Error", { status: 500 })
    }

    return Response.json({ success: true, emailsSent: emails.length })

  } catch (error) {
    console.error("Cron Job Error:", error)
    return new Response("Server Error", { status: 500 })
  }
}
