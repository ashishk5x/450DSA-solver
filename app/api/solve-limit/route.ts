import { auth } from "@clerk/nextjs/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    // Unauthenticated — can't track server-side
    return Response.json({ plan: "free", limit: 3, used: 0, period: "day" })
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

  // Pro — unlimited
  if (plan === "pro") {
    return Response.json({ plan: "pro", limit: -1, used: 0, period: "unlimited" })
  }

  // Basic — 100/month
  if (plan === "basic") {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count } = await sb
      .from("solves")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", startOfMonth.toISOString())

    return Response.json({ plan: "basic", limit: 100, used: count || 0, period: "month" })
  }

  // Free — 3/day
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const { count } = await sb
    .from("solves")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfDay.toISOString())

  return Response.json({ plan: "free", limit: 3, used: count || 0, period: "day" })
}
