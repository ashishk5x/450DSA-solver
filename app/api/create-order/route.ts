export async function POST(request: Request) {
  const { plan, userId } = await request.json()

  const PLANS = {
    basic: { amount: 14900, name: "PatternFlow Basic" },
    pro: { amount: 29900, name: "PatternFlow Pro" },
  }

  const selected = PLANS[plan as keyof typeof PLANS]
  if (!selected) {
    return Response.json({ error: "Invalid plan" }, { status: 400 })
  }

  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || keyId.includes("placeholder")) {
    return Response.json({ error: "payments_not_configured" }, { status: 503 })
  }

  try {
    const credentials = Buffer.from(`${keyId}:${keySecret}`).toString("base64")

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: selected.amount,
        currency: "INR",
        receipt: `patternflow_${plan}_${Date.now()}`,
        notes: { plan, userId },
      }),
    })

    const order = await response.json()

    if (!response.ok) {
      console.error("Razorpay error:", order)
      return Response.json({ error: "Failed to create order" }, { status: 500 })
    }

    return Response.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      planName: selected.name,
      plan,
    })
  } catch (err) {
    console.error("Order error:", err)
    return Response.json({ error: "Failed to create order" }, { status: 500 })
  }
}