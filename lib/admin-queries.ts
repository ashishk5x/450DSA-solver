import { createClient } from "@supabase/supabase-js"

function getSb() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key
  )
}

export type AdminStats = {
  totalUsers: number
  activeUsers: number
  totalSolves: number
  paidUsers: number
  conversionRate: number
  revenue: number
  growthChart: { date: string; count: number }[]
  featureUsage: { hints: number; patternUnlocks: number }
  recentActivity: { email: string; action: string; timestamp: string }[]
  funnelData: {
    totalUsers: number
    solveClicked: number
    paidUsers: number
  }
}

// Plan prices in INR (matching route.ts: basic=9900 paise, pro=19900 paise)
const PLAN_PRICES: Record<string, number> = { basic: 99, pro: 199 }

export async function fetchAdminStats(days: number): Promise<AdminStats> {
  const sb = getSb()

  // Run all queries in parallel against the 4 existing tables:
  // solves, subscriptions, usage_log, problem_cache
  const [
    solvesCountResult,
    paidResult,
    subscriptionsResult,
    growthResult,
    recentSolvesResult,
    allSolversResult,
    activeSolversResult,
  ] = await Promise.all([
    // Problems solved in date range
    sb
      .from("solves")
      .select("id", { count: "exact", head: true })
      .gte("created_at", daysAgo(days)),

    // Paid users — count active subscriptions
    sb
      .from("subscriptions")
      .select("user_id", { count: "exact", head: true })
      .eq("status", "active"),

    // All active subscriptions with plan — for revenue calculation
    sb
      .from("subscriptions")
      .select("plan")
      .eq("status", "active"),

    // Growth chart: solves per day in range
    sb
      .from("solves")
      .select("created_at")
      .gte("created_at", daysAgo(days))
      .order("created_at", { ascending: true }),

    // Recent activity: last 10 solves
    sb
      .from("solves")
      .select("user_id, pattern_name, created_at")
      .order("created_at", { ascending: false })
      .limit(10),

    // All-time distinct solvers — for Total Users
    sb.from("solves").select("user_id"),

    // Distinct solvers in date range — for Active Users
    sb
      .from("solves")
      .select("user_id")
      .gte("created_at", daysAgo(days)),
  ])

  // Total users = distinct user_ids across all solves (all time)
  const totalUsers = new Set(
    (allSolversResult.data ?? []).map((r) => r.user_id)
  ).size

  // Active users = distinct user_ids who solved in the selected range
  const activeUsers = new Set(
    (activeSolversResult.data ?? []).map((r) => r.user_id)
  ).size

  const totalSolves = solvesCountResult.count ?? 0
  const paidUsers = paidResult.count ?? 0
  const conversionRate =
    totalUsers > 0 ? Math.round((paidUsers / totalUsers) * 100) : 0

  // Revenue = sum of plan prices for all active subscriptions
  const revenue = (subscriptionsResult.data ?? []).reduce(
    (sum, s) => sum + (PLAN_PRICES[s.plan] ?? 0),
    0
  )

  // Group solves by date for the growth chart
  const grouped: Record<string, number> = {}
  for (const s of growthResult.data ?? []) {
    const d = new Date(s.created_at).toISOString().split("T")[0]
    grouped[d] = (grouped[d] ?? 0) + 1
  }
  const growthChart = Object.entries(grouped).map(([date, count]) => ({
    date,
    count,
  }))

  // Recent activity feed
  const recentActivity = (recentSolvesResult.data ?? []).map((r) => ({
    email: r.user_id ? `${r.user_id.slice(0, 8)}…` : "anonymous",
    action: r.pattern_name ? `Solved: ${r.pattern_name}` : "Problem solved",
    timestamp: r.created_at,
  }))

  return {
    totalUsers,
    activeUsers,
    totalSolves,
    paidUsers,
    conversionRate,
    revenue,
    growthChart,
    featureUsage: {
      hints: totalSolves, // solves used as proxy for feature usage
      patternUnlocks: paidUsers,
    },
    recentActivity,
    funnelData: {
      totalUsers,
      solveClicked: totalSolves,
      paidUsers,
    },
  }
}

function daysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}
