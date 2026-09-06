import { auth } from "@clerk/nextjs/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    // Unauthenticated — limit 0
    return Response.json({ plan: "free", limit: 0, used: 0, period: "month" })
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Get plan
  let plan = "free"
  try {
    const { data } = await sb
      .from("subscriptions")
      .select("plan, expires_at")
      .eq("user_id", userId)
      .eq("status", "active")
      .single()

    if (data) {
      const expired = data.expires_at && new Date(data.expires_at) < new Date()
      if (!expired) plan = data.plan as string
    }
  } catch {}

  // Set limits based on plan
  let limit = 0
  if (plan === "basic") limit = 4
  if (plan === "pro") limit = 10

  if (limit === 0) {
    return Response.json({ plan: "free", limit: 0, used: 0, period: "month" })
  }

  // Calculate usage over the last 30 days (rolling subscription window)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { count } = await sb
    .from("mock_interviews")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", thirtyDaysAgo.toISOString())

  return Response.json({ 
    plan, 
    limit, 
    used: count || 0, 
    period: "rolling_30_days" 
  })
}
