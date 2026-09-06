import crypto from "crypto"

export async function POST(request: Request) {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    plan,
    userId,
  } = await request.json()

  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keySecret || keySecret.includes("placeholder")) {
    return Response.json({ error: "payments_not_configured" }, { status: 503 })
  }

  try {
    // Verify signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex")

    if (expectedSignature !== razorpay_signature) {
      return Response.json({ error: "Invalid payment signature" }, { status: 400 })
    }

    // Save to Supabase
    const { createClient } = await import("@supabase/supabase-js")
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error } = await sb.from("subscriptions").upsert({
      user_id: userId,
      plan,
      razorpay_order_id,
      razorpay_payment_id,
      status: "active",
      started_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })

    if (error) {
      console.error("Supabase upsert error:", error);
      throw new Error("Database insertion failed");
    }

    return Response.json({ success: true, plan })
  } catch (err) {
    console.error("Verify error:", err)
    return Response.json({ error: "Verification failed" }, { status: 500 })
  }
}