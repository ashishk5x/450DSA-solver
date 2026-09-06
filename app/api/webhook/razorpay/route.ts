import crypto from "crypto"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const bodyText = await request.text()
    const signature = request.headers.get("x-razorpay-signature")
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET

    if (!signature || !secret) {
      return Response.json({ error: "Missing signature or secret" }, { status: 400 })
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(bodyText)
      .digest("hex")

    if (expectedSignature !== signature) {
      return Response.json({ error: "Invalid signature" }, { status: 400 })
    }

    const payload = JSON.parse(bodyText)

    // We only care about payment captured events
    if (payload.event === "payment.captured") {
      const paymentEntity = payload.payload.payment.entity
      const { plan, userId } = paymentEntity.notes || {}

      if (!plan || !userId) {
        console.warn("Webhook received payment without plan or userId in notes:", paymentEntity.id)
        return Response.json({ status: "ignored" })
      }

      // Initialize Supabase admin client to bypass RLS
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Upsert the subscription
      const { error } = await sb.from("subscriptions").upsert({
        user_id: userId,
        plan,
        razorpay_order_id: paymentEntity.order_id,
        razorpay_payment_id: paymentEntity.id,
        status: "active",
        started_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })

      if (error) {
        console.error("Webhook Supabase error:", error)
        return Response.json({ error: "Database error" }, { status: 500 })
      }

      console.log(`Webhook successfully granted ${plan} access to user ${userId}`)
    }

    // Always return 200 OK so Razorpay doesn't retry
    return Response.json({ status: "ok" })
  } catch (err) {
    console.error("Webhook error:", err)
    return Response.json({ error: "Internal error" }, { status: 500 })
  }
}
