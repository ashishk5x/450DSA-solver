import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { BookOpen, Brain, Clock, TrendingUp, ChevronRight, Shield, Target, AlertCircle, Zap, Sparkles, History, ArrowRight, CheckCircle2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { DashboardNotifications } from "@/components/DashboardNotifications";
import { ALL_PATTERN_NAMES, PATTERNS } from "@/lib/patterns";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

async function getUserSolves(userId: string, plan: string = "free") {
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Free: no history (return empty), Basic: 30 days, Pro: full history
    let query = sb
      .from("solves")
      .select("id, problem_summary, pattern_name, difficulty, created_at, confidence, solve_time_seconds, self_solved, timer_used")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (plan === "free") {
      // Free users see no history
      return []
    } else if (plan === "basic") {
      // Basic users see last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      query = query.gte("created_at", thirtyDaysAgo.toISOString())
    }
    // Pro users see everything (no filter needed)

    const { data, error } = await query.limit(100)

    if (error) return []
    return data || []
  } catch {
    return []
  }
}

async function getUserPlan(userId: string): Promise<{ plan: string; expiresAt: string | null }> {
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await sb
      .from("subscriptions")
      .select("plan, status, expires_at")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("started_at", { ascending: false })
      .limit(1)
      .single()

    if (!data) return { plan: "free", expiresAt: null }
    const expired = data.expires_at && new Date(data.expires_at) < new Date()
    if (expired) return { plan: "free", expiresAt: null }
    return { plan: data.plan as string, expiresAt: data.expires_at || null }
  } catch {
    return { plan: "free", expiresAt: null }
  }
}

// Lightweight stats query — works for ALL plans (used for streak, patterns, readiness score)
async function getUserStats(userId: string) {
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data, error } = await sb
      .from("solves")
      .select("pattern_name, difficulty, created_at, confidence")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(500)

    if (error) return []
    return data || []
  } catch {
    return []
  }
}

function getStreak(solves: { created_at: string }[]) {
  if (!solves.length) return 0
  const dates = [...new Set(solves.map(s => new Date(s.created_at).toDateString()))]
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (dates.includes(d.toDateString())) {
      streak++
    } else if (i > 0) {
      break
    }
  }
  return streak
}

async function getPastInterviews(userId: string) {
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data, error } = await sb
      .from("mock_interviews")
      .select("id, pattern, hire_probability, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5)

    if (error) return []
    return data || []
  } catch {
    return []
  }
}

async function getInterviewUsage(userId: string) {
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count } = await sb
      .from("mock_interviews")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", thirtyDaysAgo.toISOString())

    return count || 0
  } catch {
    return 0
  }
}

function getDiffColor(difficulty: string) {
  if (difficulty === "Easy") return "text-green-600"
  if (difficulty === "Hard") return "text-red-500"
  return "text-amber-600"
}

function timeAgo(dateStr: string) {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return "just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams?: { payment?: string }
}) {
  const { userId } = await auth()
  if (!userId) redirect("/")

  const user = await currentUser()
  const name = user?.firstName || "there"

  const { plan, expiresAt } = await getUserPlan(userId)
  const solves = await getUserSolves(userId, plan) // History (plan-filtered)
  const allStats = await getUserStats(userId) // Stats (all solves, all plans)
  const pastInterviews = await getPastInterviews(userId)
  
  const interviewUsage = await getInterviewUsage(userId)
  const interviewLimit = plan === "pro" ? 10 : plan === "basic" ? 4 : 0
  const canInterview = interviewUsage < interviewLimit

  const solvedToday = allStats.filter(s => {
    const d = new Date(s.created_at)
    const today = new Date()
    return d.toDateString() === today.toDateString()
  }).length

  const totalSolves = allStats.length
  const uniquePatterns = new Set(allStats.map(s => s.pattern_name).filter(Boolean)).size
  const streak = getStreak(allStats)
  const isPaid = plan === "basic" || plan === "pro"

  // Calculate days until expiry for notifications
  let daysUntilExpiry: number | null = null
  if (expiresAt && isPaid) {
    const diff = new Date(expiresAt).getTime() - Date.now()
    daysUntilExpiry = Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  // Pattern analysis — build weakness map (using allStats for all users)
  const patternStats = new Map<string, { count: number; totalConfidence: number; lastPracticed: string }>()
  for (const s of allStats) {
    if (!s.pattern_name) continue
    const existing = patternStats.get(s.pattern_name)
    if (existing) {
      existing.count++
      existing.totalConfidence += (s.confidence || 0)
      if (s.created_at > existing.lastPracticed) existing.lastPracticed = s.created_at
    } else {
      patternStats.set(s.pattern_name, {
        count: 1,
        totalConfidence: s.confidence || 0,
        lastPracticed: s.created_at,
      })
    }
  }

  // Compute mastery levels
  type PatternAnalysis = {
    name: string
    count: number
    avgConfidence: number
    mastery: "Not started" | "Seen" | "Familiar" | "Confident" | "Mastered"
    lastPracticed: string | null
  }

  const patternAnalysis: (PatternAnalysis & { masteryPercent: number; nextMilestone: number; hint: string })[] = ALL_PATTERN_NAMES.map((name) => {
    const stats = patternStats.get(name)
    if (!stats) {
      return {
        name, count: 0, avgConfidence: 0, mastery: "Not started" as const, lastPracticed: null,
        masteryPercent: 0, nextMilestone: 3, hint: "Start now"
      }
    }
    const avg = stats.totalConfidence > 0 ? stats.totalConfidence / stats.count : 0
    let mastery: PatternAnalysis["mastery"] = "Seen"

    // Mastery thresholds: 3 (Familiar), 6 (Confident), 10 (Mastered)
    if (stats.count >= 10 && avg >= 3.5) mastery = "Mastered"
    else if (stats.count >= 6 && avg >= 3) mastery = "Confident"
    else if (stats.count >= 3 && avg >= 2) mastery = "Familiar"
    else mastery = "Seen"

    const masteryPercent = Math.min(100, Math.round((stats.count / 10) * 100))
    const nextMilestone = stats.count < 3 ? 3 : stats.count < 6 ? 6 : stats.count < 10 ? 10 : 10
    const problemsNeeded = nextMilestone - stats.count
    const hint = stats.count >= 10 ? "Concept Mastered" : `Solve ${problemsNeeded} more to level up`

    return { name, count: stats.count, avgConfidence: avg, mastery, lastPracticed: stats.lastPracticed, masteryPercent, nextMilestone, hint }
  })

  // Sort: weak patterns first, then not started, then strong
  const masteryOrder = { "Not started": 0, "Seen": 1, "Familiar": 2, "Confident": 3, "Mastered": 4 }
  const sortedPatterns = [...patternAnalysis].sort((a, b) => masteryOrder[a.mastery] - masteryOrder[b.mastery])

  // Recommendations: patterns that need attention
  const weakPatterns = patternAnalysis.filter(p => p.mastery === "Seen" || p.mastery === "Not started")
  const recommendations = weakPatterns.slice(0, 3)

  // ── DSA Readiness Score (0-100) ──
  const totalPatterns = ALL_PATTERN_NAMES.length
  const patternsAttempted = patternAnalysis.filter(p => p.count > 0).length
  const patternsMastered = patternAnalysis.filter(p => p.mastery === "Mastered" || p.mastery === "Confident").length
  const patternsFamiliar = patternAnalysis.filter(p => p.mastery === "Familiar").length

  // Score breakdown: coverage (40%) + mastery depth (40%) + consistency (20%)
  const coverageScore = (patternsAttempted / totalPatterns) * 40
  const masteryScore = ((patternsMastered * 4 + patternsFamiliar * 2) / (totalPatterns * 4)) * 40
  const consistencyScore = Math.min(20, (streak * 2) + Math.min(10, totalSolves / 5))
  const readinessScore = Math.round(Math.min(100, coverageScore + masteryScore + consistencyScore))

  const readinessLabel =
    readinessScore >= 80 ? "Interview Ready" :
      readinessScore >= 60 ? "Getting Strong" :
        readinessScore >= 40 ? "Building Up" :
          readinessScore >= 20 ? "Getting Started" : "Just Beginning"

  const readinessColor =
    readinessScore >= 80 ? "text-green-600" :
      readinessScore >= 60 ? "text-green-500" :
        readinessScore >= 40 ? "text-amber-500" :
          readinessScore >= 20 ? "text-amber-400" : "text-muted-foreground"

  // ── Daily Challenge ──
  // Pick a problem from the weakest pattern, deterministic per day+user
  const today = new Date().toDateString()
  const daySeed = today.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)

  let dailyChallenge: { patternName: string; problem: { name: string; platform: string; difficulty: string } } | null = null
  // Prioritize: weakest practiced patterns first, then not started
  const challengeCandidates = [...patternAnalysis]
    .filter(p => p.mastery !== "Mastered")
    .sort((a, b) => {
      // Prioritize "Seen" > "Not started" > "Familiar" > "Confident"
      const order = { "Seen": 0, "Not started": 1, "Familiar": 2, "Confident": 3, "Mastered": 4 }
      return (order[a.mastery] || 4) - (order[b.mastery] || 4)
    })

  if (challengeCandidates.length > 0) {
    // Pick pattern based on day seed
    const selectedPattern = challengeCandidates[daySeed % Math.min(3, challengeCandidates.length)]
    const patternData = PATTERNS.find(p => p.name === selectedPattern.name)
    if (patternData && patternData.practiceProblems.length > 0) {
      const problemIndex = daySeed % patternData.practiceProblems.length
      dailyChallenge = {
        patternName: selectedPattern.name,
        problem: patternData.practiceProblems[problemIndex],
      }
    }
  }

  // ── Smart Insights ──
  const topPattern = [...patternAnalysis].sort((a, b) => b.count - a.count)[0]

  const smartInsight = topPattern && topPattern.count > 0
    ? `You're mastering ${topPattern.name} — ${topPattern.count} solves already!`
    : "Start solving to see your pattern mastery grow."

  const userPercentile = Math.min(99, Math.max(10, (totalSolves * 2) + (streak * 5)))

  // ── Weekly Mock Interview Logic ──
  const last7DaysSolves = allStats.filter(s => {
    const d = new Date(s.created_at)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return d > weekAgo
  })
  
  const weeklyPatternStats = new Map<string, { count: number; totalConfidence: number }>()
  for (const s of last7DaysSolves) {
    if (!s.pattern_name) continue
    const existing = weeklyPatternStats.get(s.pattern_name)
    if (existing) {
      existing.count++
      existing.totalConfidence += (s.confidence || 0)
    } else {
      weeklyPatternStats.set(s.pattern_name, { count: 1, totalConfidence: s.confidence || 0 })
    }
  }
  
  let weakestWeeklyPattern: string | null = null
  let lowestAvgConfidence = 999
  
  weeklyPatternStats.forEach((stats, patternName) => {
    const avg = stats.count > 0 ? stats.totalConfidence / stats.count : 0
    if (avg < lowestAvgConfidence) {
      lowestAvgConfidence = avg
      weakestWeeklyPattern = patternName
    }
  })
  
  // Fallback to absolute weakest if no solves in 7 days
  if (!weakestWeeklyPattern && weakPatterns.length > 0) {
    weakestWeeklyPattern = weakPatterns[0].name
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 pt-28 sm:px-6 sm:py-12 sm:pt-32">

        {/* Client-side toast notifications */}
        <DashboardNotifications
          plan={plan}
          daysUntilExpiry={daysUntilExpiry}
          paymentSuccess={searchParams?.payment === "success"}
        />

        {/* Payment success banner */}
        {searchParams?.payment === "success" && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-800">
              ✓ Payment successful! Your {plan} plan is now active.
            </p>
          </div>
        )}

        {/* Plan expiry warning banner */}
        {daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0 && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-800">
                ⏳ Your {plan} plan expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Renew to keep your features and solve history
              </p>
            </div>
            <Link
              href="/#pricing"
              className="flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-2 font-mono text-xs text-card-foreground hover:bg-amber-700 transition-colors"
            >
              Renew <ChevronRight size={12} />
            </Link>
          </div>
        )}

        {/* ── Hero Section ── */}
        <div className="relative mb-6 overflow-hidden rounded-2xl bg-card p-5 text-card-foreground shadow-md sm:p-6">
          {/* Subtle yellow gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent" />
          
          {/* Background glows */}
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-amber-50 dark:bg-amber-900/200/5 blur-[100px]" />

          <div className="relative flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
            <div className="space-y-1.5">
              <div className="relative inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 dark:bg-amber-400/10 px-2.5 py-0.5 backdrop-blur-md overflow-hidden group cursor-default">
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <TrendingUp size={12} className="text-amber-600 dark:text-amber-400" />
                <span className="font-mono text-[8px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 relative z-10">{streak} Day Streak</span>
              </div>
              <h1 className="text-xl font-black tracking-tight sm:text-2xl text-amber-600 dark:text-amber-400">
                {streak > 0 ? `Keep it up, ${name}! 🚀` : `Ready, ${name}?`}
              </h1>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium text-foreground/80">
                  {smartInsight}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-500 dark:text-emerald-400">
                   <Target size={10} />
                   <span>Ahead of {userPercentile}% of users this week</span>
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <Link
                href="/solve"
                className="group relative flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-mono text-xs font-black text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                <Zap size={14} fill="currentColor" className="transition-transform group-hover:rotate-12" />
                Continue Solving
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* ── Left Column: Main Content ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-amber-200 hover:shadow-[0_0_20px_rgba(245,158,11,0.05)] hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-3">
                  <BookOpen size={16} className="text-muted-foreground group-hover:text-amber-500 transition-colors" />
                  {solvedToday > 0 && (
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-[9px] font-bold text-green-600">+{solvedToday} today</span>
                  )}
                </div>
                <p className="font-mono text-2xl font-black text-foreground">{totalSolves}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Solved</p>
              </div>
              <div className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-amber-200 hover:shadow-[0_0_20px_rgba(245,158,11,0.05)] hover:-translate-y-0.5">
                <Brain size={16} className="mb-3 text-muted-foreground group-hover:text-amber-500 transition-colors" />
                <p className="font-mono text-2xl font-black text-foreground">{uniquePatterns}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Patterns</p>
              </div>
              <div className={`group relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:-translate-y-0.5 ${streak > 0 ? "border-amber-500/30 bg-amber-500/10 backdrop-blur-xl dark:bg-amber-400/10" : "border-border bg-card hover:border-amber-200"}`}>
                {streak > 0 && (
                  <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/40 via-transparent to-amber-500/20 dark:from-white/10 dark:to-amber-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                )}
                <TrendingUp size={16} className={`mb-3 relative z-10 ${streak > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground group-hover:text-amber-500 transition-colors"}`} />
                <p className="font-mono text-2xl font-black text-foreground relative z-10">{streak}d</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground relative z-10">Streak</p>
              </div>
              <div className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-amber-200 hover:shadow-[0_0_20px_rgba(245,158,11,0.05)] hover:-translate-y-0.5 relative flex flex-col justify-between">
                <Target size={16} className="mb-3 text-muted-foreground group-hover:text-amber-500 transition-colors" />
                <div>
                  <p className="font-mono text-2xl font-black text-foreground">
                    {patternAnalysis.filter(p => p.mastery === "Mastered" || p.mastery === "Confident").length}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Mastered</p>
                </div>
                {/* Tooltip */}
                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bottom-full mb-2 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10 font-mono">
                  Requires 6+ solves per pattern
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground"></div>
                </div>
              </div>
            </div>

            {/* Recommendations & Daily Challenge */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Personalized Path</h2>
                  <Link href="/patterns" className="text-[10px] font-bold text-foreground hover:underline">
                    View Library →
                  </Link>
                </div>
                <div className="space-y-3">
                  {recommendations.length > 0 ? (
                    recommendations.map((p) => (
                      <Link
                        key={p.name}
                        href={`/patterns`}
                        className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary hover:shadow-md"
                      >
                        <div className="absolute left-0 top-0 h-full w-1 bg-amber-400 opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-2 mb-1">
                             <span className={`rounded px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider ${p.mastery === "Not started" ? "bg-gray-100 text-gray-500" : "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400"}`}>
                               {p.mastery === "Not started" ? "New" : p.mastery}
                             </span>
                          </div>
                          <p className="text-base font-bold text-foreground">{p.name}</p>
                          <p className="font-mono text-[10px] text-muted-foreground mt-1">{p.hint}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="mb-1 text-[10px] font-bold text-foreground">{p.masteryPercent}%</div>
                          <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
                             <div className="h-full bg-primary transition-all" style={{ width: `${p.masteryPercent}%` }} />
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-card/50">
                      <p className="text-xs font-medium text-muted-foreground">Mastery achieved! Pick a new concept. 🎉</p>
                    </div>
                  )}
                </div>
              </div>

              {dailyChallenge ? (
                <div className="group relative flex flex-col overflow-hidden rounded-[2rem] border-2 border-amber-100/50 bg-gradient-to-b from-amber-50/50 to-white p-8 text-foreground shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:scale-[1.01] hover:shadow-[0_8px_30px_rgb(245,158,11,0.08)] dark:border-border dark:bg-card dark:bg-none dark:shadow-xl dark:hover:shadow-[0_0_30px_rgba(245,158,11,0.05)]">
                  {/* Frosted Chocolate Geometric Corner Accents */}
                  <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-900/10 backdrop-blur-3xl transition-transform duration-1000 ease-in-out group-hover:scale-[20] dark:bg-amber-900/20" />
                  <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-amber-900/20 backdrop-blur-2xl transition-transform delay-75 duration-1000 ease-in-out group-hover:scale-[25] dark:bg-amber-900/40" />
                  
                  <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-amber-900/10 backdrop-blur-3xl transition-transform duration-1000 ease-in-out group-hover:scale-[20] dark:bg-amber-900/20" />
                  <div className="pointer-events-none absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-amber-900/20 backdrop-blur-2xl transition-transform delay-75 duration-1000 ease-in-out group-hover:scale-[25] dark:bg-amber-900/40" />
                  
                  <div className="relative flex items-center justify-between mb-6 z-10">
                    <div className="flex items-center gap-2">
                      <Zap size={18} className="text-amber-700 fill-amber-700 dark:text-amber-400 dark:fill-amber-400 transition-colors" />
                      <span className="font-mono text-xs font-black uppercase tracking-widest text-amber-700 dark:text-amber-400 transition-colors">Daily Challenge</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-card/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                       <Clock size={12} />
                       <span>~15 min</span>
                    </div>
                  </div>
                  <div className="mb-8 relative z-10">
                    <h3 className="text-2xl font-black mb-2 leading-tight">{dailyChallenge.patternName}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Paste any <span className="font-bold text-foreground">{dailyChallenge.patternName}</span> problem from LeetCode, GFG, or any platform. This is your weakest pattern — solving one will level up your mastery.
                    </p>
                  </div>
                  <Link
                    href="/solve"
                    className="relative z-10 mt-auto flex w-full items-center justify-center gap-3 rounded-2xl bg-[#f8f6f0] py-4 font-mono text-base font-black text-foreground shadow-sm transition-all hover:scale-[1.02] hover:bg-amber-100/50 active:scale-95 dark:bg-background dark:shadow-[0_10px_30px_rgba(250,248,243,0.1)] dark:hover:bg-card"
                  >
                    Start Challenge <ArrowRight size={18} />
                  </Link>
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-card p-6 flex items-center justify-center">
                  <p className="text-xs font-medium text-muted-foreground">Check back tomorrow for your next goal!</p>
                </div>
              )}
            </div>

            {/* ── Weekly AI Mock Interview (PRO ONLY) ── */}
            <div className={`relative overflow-hidden rounded-[2rem] border-2 p-8 shadow-sm transition-all mt-6 ${plan === "pro" ? "border-amber-200 bg-gradient-to-br from-amber-50/50 to-white dark:border-amber-900/30 dark:bg-card dark:bg-none" : "border-border bg-card"}`}>
              {/* Decorative elements */}
              {plan === "pro" && (
                <>
                  <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
                  <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
                </>
              )}
              
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
                      <Brain size={20} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="font-mono text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Weekly Event</span>
                    {plan !== "pro" && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase text-amber-700">Pro Feature</span>
                    )}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black mb-3 text-foreground">AI Voice Mock Interview</h3>
                  <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                    Based on your performance this week, your weakest area is <span className="font-bold text-foreground">{weakestWeeklyPattern || "General Concepts"}</span>. 
                    Practice a real-time, voice-to-voice interview with our friendly AI to build confidence before real FAANG interviews.
                  </p>
                </div>
                
                <div className="shrink-0 w-full md:w-auto flex flex-col gap-2 items-center">
                  {plan === "pro" || plan === "basic" ? (
                    canInterview ? (
                      <Link
                        href={`/interview?pattern=${encodeURIComponent(weakestWeeklyPattern || "General")}`}
                        className="flex w-full md:w-auto items-center justify-center gap-2 rounded-2xl bg-amber-600 px-8 py-4 font-mono text-sm font-black text-white hover:bg-amber-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/25"
                      >
                        Start Interview
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="flex w-full md:w-auto items-center justify-center gap-2 rounded-2xl bg-zinc-400 dark:bg-zinc-800 px-8 py-4 font-mono text-sm font-black text-white cursor-not-allowed opacity-50"
                      >
                        Limit Reached
                      </button>
                    )
                  ) : (
                    <Link
                      href="/#pricing"
                      className="flex w-full md:w-auto items-center justify-center gap-2 rounded-2xl bg-muted px-8 py-4 font-mono text-sm font-black text-foreground hover:bg-muted/80 transition-all"
                    >
                      Upgrade to Pro <ArrowRight size={16} />
                    </Link>
                  )}
                  {(plan === "pro" || plan === "basic") && (
                    <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">{interviewUsage} / {interviewLimit} this month</span>
                  )}
                </div>
              </div>
            </div>

            {/* Past Interviews History */}
            {plan === "pro" && pastInterviews.length > 0 && (
              <div className="space-y-4 mt-8 relative">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Past Interviews</h2>
                  <span className="text-[10px] text-muted-foreground hidden sm:inline-block">Swipe to view more →</span>
                </div>
                
                {/* Horizontal Swipe Carousel */}
                <div 
                  className="flex overflow-x-auto snap-x snap-mandatory pb-6 scroll-smooth"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <style dangerouslySetInnerHTML={{ __html: `
                    .flex::-webkit-scrollbar { display: none; }
                  `}} />
                  
                  {pastInterviews.map((interview) => (
                    <div key={interview.id} className="w-full shrink-0 snap-center snap-always px-2 py-2">
                      <Link
                        href={`/interview/report?id=${interview.id}`}
                        className="block w-full max-w-[320px] mx-auto group flex flex-col justify-between rounded-[1.5rem] border border-border bg-card p-5 transition-all hover:border-amber-400 hover:shadow-[0_8px_30px_rgba(245,158,11,0.12)] hover:-translate-y-1 relative overflow-hidden"
                      >
                        {/* Decorative background glow on hover */}
                        <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-amber-500/10 rounded-full blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        
                        <div className="flex items-start justify-between relative z-10 mb-6">
                          <div className="min-w-0 pr-3">
                            <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                              {new Date(interview.created_at).toLocaleDateString()}
                            </p>
                            <p className="truncate text-lg font-black text-foreground">
                              {interview.pattern}
                            </p>
                          </div>
                          <div className="shrink-0 text-center bg-background border border-border rounded-xl px-3 py-2 shadow-sm group-hover:border-amber-200 transition-colors">
                            <div className={`text-xl font-black ${interview.hire_probability >= 70 ? 'text-green-600' : interview.hire_probability >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                              {interview.hire_probability}%
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between border-t border-border/60 pt-4 mt-auto relative z-10">
                          <span className="text-xs font-bold text-muted-foreground group-hover:text-amber-600 transition-colors">View full report</span>
                          <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40 transition-colors">
                            <ArrowRight size={14} className="text-amber-600 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Learning History (Recent Preview) */}
            <div className="space-y-4 mt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Recent Activity</h2>
                {isPaid && solves.length > 0 && (
                  <Link href="/history" className="text-[10px] font-bold text-foreground hover:text-amber-600 transition-colors">
                    View full history →
                  </Link>
                )}
              </div>

              {solves.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center shadow-sm">
                  {plan === "free" ? (
                    <div className="space-y-4">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/20 transition-transform group-hover:scale-110">
                        <History size={24} className="text-amber-600" />
                      </div>
                      <h3 className="text-lg font-extrabold text-foreground">Unlock Your Solve History</h3>
                      <div className="space-y-2 py-2">
                         <div className="flex items-center gap-2 text-[11px] text-muted-foreground justify-center">
                           <CheckCircle2 size={12} className="text-green-600" /> Review past solutions anytime
                         </div>
                         <div className="flex items-center gap-2 text-[11px] text-muted-foreground justify-center">
                           <CheckCircle2 size={12} className="text-green-600" /> Track pattern mastery over months
                         </div>
                         <div className="flex items-center gap-2 text-[11px] text-muted-foreground justify-center">
                           <CheckCircle2 size={12} className="text-green-600" /> Unlimited pattern analysis
                         </div>
                      </div>
                      <Link
                        href="/#pricing"
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 font-mono text-xs font-black text-primary-foreground transition-all hover:scale-105 hover:shadow-lg active:scale-95"
                      >
                        Upgrade to Premium <ArrowRight size={14} />
                      </Link>
                    </div>
                  ) : (
                    <p className="text-xs font-medium text-muted-foreground">No solves recorded yet. Your history will appear here.</p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {solves.slice(0, 2).map((solve) => (
                    <div
                      key={solve.id}
                      className="group flex items-start justify-between rounded-xl border border-border bg-card p-3 transition-all hover:border-border/80 hover:shadow-sm"
                    >
                      <div className="mr-3 min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-mono text-[9px] text-muted-foreground">
                            {timeAgo(solve.created_at)}
                          </span>
                          <span className={`font-mono text-[9px] font-bold ${getDiffColor(solve.difficulty)}`}>
                            {solve.difficulty.toUpperCase()}
                          </span>
                          {solve.timer_used && solve.solve_time_seconds != null && (
                            <span className="font-mono text-[9px] text-[#6b6560] flex items-center gap-0.5">
                              <Clock size={8} />
                              {Math.floor(solve.solve_time_seconds / 60)}m {solve.solve_time_seconds % 60}s
                            </span>
                          )}
                          {solve.self_solved === true && (
                            <span className="rounded-full bg-green-50 px-1.5 py-0.5 text-[8px] font-bold text-green-600">✓ solved</span>
                          )}
                          {solve.self_solved === false && (
                            <span className="rounded-full bg-red-50 px-1.5 py-0.5 text-[8px] font-bold text-red-500">✗ needed help</span>
                          )}
                        </div>
                        <p className="truncate text-xs font-medium text-foreground">
                          {solve.problem_summary || "Problem solved"}
                        </p>
                        <p className="mt-1 font-mono text-[9px] text-muted-foreground">{solve.pattern_name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right Column: Sidebar Analysis ── */}
          <div className="space-y-8">

            {/* Readiness Score */}
            <div className="group rounded-3xl border-2 border-border bg-card p-6 shadow-sm transition-all hover:border-primary">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Readiness Score</h2>
                <div className="group/info relative">
                  <AlertCircle size={14} className="text-[#e8e2d9] cursor-help transition-colors group-hover/info:text-muted-foreground" />
                  <div className="absolute bottom-full right-0 mb-2 w-48 rounded-lg bg-primary p-3 text-[10px] text-primary-foreground opacity-0 transition-opacity group-hover/info:opacity-100 shadow-xl pointer-events-none">
                    A composite score based on pattern coverage, mastery depth, and consistency.
                  </div>
                </div>
              </div>
              <div className="flex flex-col xl:flex-row items-center gap-6">
                <div className="relative shrink-0">
                  <svg width="120" height="120" viewBox="0 0 100 100" className="-rotate-90 drop-shadow-md">
                    <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" className="text-muted/50" strokeWidth="10" />
                    <circle cx="50" cy="50" r="44" fill="none" stroke="#3b82f6" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(coverageScore/100)*276.46} 276.46`} className="transition-all duration-1000 ease-out" />
                    <circle cx="50" cy="50" r="44" fill="none" stroke="#8b5cf6" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(masteryScore/100)*276.46} 276.46`} strokeDashoffset={`-${(coverageScore/100)*276.46}`} className="transition-all duration-1000 ease-out" />
                    <circle cx="50" cy="50" r="44" fill="none" stroke="#10b981" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(consistencyScore/100)*276.46} 276.46`} strokeDashoffset={`-${((coverageScore+masteryScore)/100)*276.46}`} className="transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`font-mono text-3xl font-black ${readinessColor}`}>{readinessScore}%</span>
                  </div>
                </div>
                
                <div className="flex w-full flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-sm bg-blue-500" />
                      <span className="text-xs font-semibold text-muted-foreground">Coverage</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-foreground">{Math.round(coverageScore)}/40</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-sm bg-violet-500" />
                      <span className="text-xs font-semibold text-muted-foreground">Mastery</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-foreground">{Math.round(masteryScore)}/40</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-sm bg-emerald-500" />
                      <span className="text-xs font-semibold text-muted-foreground">Consistency</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-foreground">{Math.round(consistencyScore)}/20</span>
                  </div>
                </div>
              </div>

              <div className="w-full space-y-4 pt-6">
                <div className="flex flex-col items-center gap-1">
                  <span className={`text-xs font-black uppercase tracking-widest ${readinessColor}`}>{readinessLabel}</span>
                  <p className="text-center text-[10px] text-muted-foreground">How ready you are for technical interviews.</p>
                </div>
              </div>
            </div>

            {/* Pattern Mastery (Simplified) */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Pattern Mastery</h2>
              <div className="space-y-3">
                {sortedPatterns.filter(p => p.count > 0).slice(0, 5).map((p) => {
                  const barWidth = Math.min(100, (p.count / 10) * 100)
                  return (
                    <div key={p.name} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[10px] text-foreground truncate">{p.name}</span>
                        <span className="text-[9px] text-muted-foreground">{p.mastery}</span>
                      </div>
                      <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary transition-all" style={{ width: `${barWidth}%` }} />
                      </div>
                    </div>
                  )
                })}
                <Link href="/patterns" className="block pt-2 text-center font-mono text-[9px] text-muted-foreground hover:text-foreground">
                  View all mastery details →
                </Link>
              </div>
            </div>

              {plan === "free" && (
              <div className="group relative overflow-hidden rounded-2xl bg-card border-2 border-amber-100 dark:border-amber-900/50 p-6 shadow-md transition-all hover:shadow-[0_10px_40px_rgba(245,158,11,0.15)] hover:border-amber-300">
                <div className="absolute -left-6 -top-6 h-20 w-20 rounded-full bg-amber-50 dark:bg-amber-900/20 transition-transform group-hover:scale-150" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <Sparkles size={24} className="text-amber-500 fill-amber-50" />
                    <span className="rounded-full bg-amber-100 dark:bg-amber-900/40 px-2.5 py-1 text-[9px] font-black uppercase text-amber-700 dark:text-amber-400 tracking-wider animate-pulse">Limited Offer</span>
                  </div>
                  <h3 className="text-base font-black text-foreground">Upgrade to Pro</h3>
                  <p className="text-xs text-muted-foreground mt-1.5 mb-6 leading-relaxed">
                    You&apos;re missing <span className="font-bold text-foreground">Missing Concept Detection</span> and full solve analysis. Master patterns 2x faster.
                  </p>
                  <Link
                    href="/#pricing"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-mono text-xs font-black text-primary-foreground hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-95 shadow-xl"
                  >
                    Go Pro Now <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )}

            {/* Priority Support */}
            {plan === "pro" && (
              <div className="rounded-2xl border-2 border-primary bg-primary p-5 text-primary-foreground">
                <Shield size={16} className="text-amber-400 mb-3" />
                <h3 className="text-sm font-bold">Priority Support</h3>
                <p className="text-[10px] text-muted-foreground mt-1 mb-4">Get faster responses as a Pro member.</p>
                <a href="mailto:support@patternflow.in" className="flex items-center justify-center gap-2 rounded-lg bg-background py-2 font-mono text-[10px] font-bold text-foreground">
                  Email Support
                </a>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  )
}
