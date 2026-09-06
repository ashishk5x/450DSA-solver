"use client"

import { useState, useTransition } from "react"
import { AdminStats } from "@/lib/admin-queries"
import { RangeSelector, Range, RANGE_DAYS } from "@/components/admin/RangeSelector"
import { StatsCard, Trend } from "@/components/admin/StatsCard"
import { Chart } from "@/components/admin/Chart"
import { Funnel } from "@/components/admin/Funnel"
import { InsightsPanel } from "@/components/admin/InsightsPanel"
import { Users, Activity, Code2, TrendingUp, DollarSign, Lightbulb, BookOpen, Brain } from "lucide-react"

type Props = {
  initialStats: AdminStats
  initialRange: Range
  fetchStats: (days: number) => Promise<AdminStats>
}

function computeTrends(stats: AdminStats, days: number) {
  const activePct =
    stats.totalUsers > 0
      ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
      : 0

  const usersTrend: Trend = { label: "all time", direction: "neutral" }

  const activeTrend: Trend = {
    label: `${activePct}% of total users`,
    direction: activePct >= 20 ? "up" : activePct > 0 ? "neutral" : "neutral",
  }

  const solvesTrend: Trend = {
    label: stats.totalSolves > 0 ? `in last ${days}d` : "no activity",
    direction: stats.totalSolves > 0 ? "up" : "neutral",
  }

  const conversionTrend: Trend = {
    label:
      stats.conversionRate >= 5
        ? "above SaaS avg"
        : stats.conversionRate >= 2
        ? "near average"
        : "below average",
    direction:
      stats.conversionRate >= 5
        ? "up"
        : stats.conversionRate < 2
        ? "down"
        : "neutral",
  }

  const revenueTrend: Trend = {
    label: stats.paidUsers > 0 ? `${stats.paidUsers} paid users` : "no paid users",
    direction: stats.paidUsers > 0 ? "up" : "neutral",
  }

  return { usersTrend, activeTrend, solvesTrend, conversionTrend, revenueTrend }
}

export function AdminDashboardClient({ initialStats, initialRange, fetchStats }: Props) {
  const [range, setRange] = useState<Range>(initialRange)
  const [stats, setStats] = useState<AdminStats>(initialStats)
  const [isPending, startTransition] = useTransition()

  function handleRangeChange(r: Range) {
    setRange(r)
    startTransition(async () => {
      const fresh = await fetchStats(RANGE_DAYS[r])
      setStats(fresh)
    })
  }

  const days = RANGE_DAYS[range]
  const revenue = stats.revenue > 0 ? `₹${stats.revenue.toLocaleString("en-IN")}` : "₹0"
  const trends = computeTrends(stats, days)
  const maxFeature = Math.max(stats.totalSolves, stats.featureUsage.hints, 1)

  const features = [
    { icon: Brain, label: "Memory hooks shown", value: stats.totalSolves },
    { icon: Lightbulb, label: "Hints used", value: stats.featureUsage.hints },
    { icon: BookOpen, label: "Pattern unlocks", value: stats.featureUsage.patternUnlocks },
  ]

  return (
    <div
      id="top"
      className={isPending ? "opacity-60 transition-opacity" : "transition-opacity"}
    >
      {/* ── Range Selector Row ── */}
      <div className="mb-8 flex items-center justify-between">
        <p className="font-mono text-xs text-muted-foreground/70">
          Showing last {days} days
        </p>
        <RangeSelector selected={range} onChange={handleRangeChange} />
      </div>

      {/* ── Section 1: 4 Stat Cards ── */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          icon={Users}
          value={stats.totalUsers.toLocaleString()}
          label="Total Users"
          trend={trends.usersTrend}
        />
        <StatsCard
          icon={Activity}
          value={stats.activeUsers.toLocaleString()}
          label="Active Users"
          trend={trends.activeTrend}
        />
        <StatsCard
          icon={Code2}
          value={stats.totalSolves.toLocaleString()}
          label="Problems Solved"
          trend={trends.solvesTrend}
        />
        <StatsCard
          icon={TrendingUp}
          value={`${stats.conversionRate}%`}
          label="Conversion"
          trend={trends.conversionTrend}
        />
      </div>

      {/* ── Section 2: Revenue Banner + Chart ── */}
      <div id="growth" className="mb-8 rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Revenue header — Stripe-style */}
        <div className="flex flex-col gap-4 border-b border-[#f0ede6] px-4 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div>
            <p className="font-mono text-[10px] text-muted-foreground/70 sm:text-xs">{"// revenue"}</p>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">Total Revenue</p>
            <p className="mt-1 font-mono text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {revenue}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatsCard
              icon={DollarSign}
              value={`${stats.paidUsers}`}
              label="Paid users"
              trend={trends.revenueTrend}
            />
          </div>
        </div>

        {/* Chart */}
        <div className="px-4 pb-6 pt-5 sm:px-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Solves over time</p>
              <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/70 sm:text-xs">
                Problems solved · last {days} days
              </p>
            </div>
            <span className="w-fit rounded-full border border-border px-2 py-0.5 font-mono text-[9px] text-muted-foreground/70 sm:px-2.5 sm:py-1 sm:text-[10px]">
              {range}
            </span>
          </div>
          <Chart data={stats.growthChart} />
        </div>
      </div>

      {/* ── Section 3: Funnel + Insights ── */}
      <div id="funnel" className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <p className="mb-1 font-mono text-xs text-muted-foreground/70">{"// funnel"}</p>
          <p className="mb-5 text-sm font-medium text-foreground">Conversion steps</p>
          <Funnel
            totalUsers={stats.funnelData.totalUsers}
            solveClicked={stats.funnelData.solveClicked}
            paidUsers={stats.funnelData.paidUsers}
          />
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <p className="mb-1 font-mono text-xs text-muted-foreground/70">{"// insights"}</p>
          <p className="mb-5 text-sm font-medium text-foreground">Smart observations</p>
          <InsightsPanel stats={stats} days={days} />
        </div>
      </div>

      {/* ── Section 4: Feature Usage ── */}
      <div id="features" className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <p className="mb-1 font-mono text-xs text-muted-foreground/70">{"// features"}</p>
        <p className="mb-6 text-sm font-medium text-foreground">What users rely on most</p>
        <div className="space-y-5">
          {features.map(({ icon: Icon, label, value }) => {
            const pct = Math.round((value / maxFeature) * 100)
            return (
              <div key={label}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-md bg-secondary p-1.5">
                      <Icon size={11} className="text-muted-foreground" />
                    </div>
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-foreground">
                    {value.toLocaleString()}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
