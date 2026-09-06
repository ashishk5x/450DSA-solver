import { AdminStats } from "@/lib/admin-queries"
import { TrendingUp, Zap, AlertCircle } from "lucide-react"

type InsightsPanelProps = {
  stats: AdminStats
  days: number
}

type Insight = {
  type: "good" | "warn" | "info"
  text: string
}

export function InsightsPanel({ stats, days }: InsightsPanelProps) {
  const insights: Insight[] = []

  // Conversion insight
  if (stats.conversionRate >= 5) {
    insights.push({
      type: "good",
      text: `Conversion rate is strong at ${stats.conversionRate}% — above the SaaS average of 2–4%.`,
    })
  } else if (stats.conversionRate > 0) {
    insights.push({
      type: "warn",
      text: `Conversion rate is ${stats.conversionRate}%. SaaS average is 2–4%. Consider a stronger upgrade prompt.`,
    })
  } else {
    insights.push({
      type: "warn",
      text: "No paid conversions yet. Review your pricing page and upgrade CTAs.",
    })
  }

  // Funnel drop-off
  const { totalUsers, solveClicked, paidUsers } = stats.funnelData
  if (totalUsers > 0 && solveClicked < totalUsers * 0.5) {
    const pct = Math.round((solveClicked / totalUsers) * 100)
    insights.push({
      type: "warn",
      text: `Only ${pct}% of users solved a problem. Most drop-off is before the first solve — improve onboarding.`,
    })
  } else if (totalUsers > 0 && solveClicked >= totalUsers * 0.5) {
    const pct = Math.round((solveClicked / totalUsers) * 100)
    insights.push({
      type: "good",
      text: `${pct}% of users engaged with a solve — healthy activation rate.`,
    })
  }

  // Paid vs solvers
  if (solveClicked > 0 && paidUsers < solveClicked * 0.03) {
    insights.push({
      type: "warn",
      text: "Few active solvers are converting to paid. Paywall may be hitting too late or too gently.",
    })
  }

  // Activity in range
  if (stats.totalSolves === 0) {
    insights.push({
      type: "info",
      text: `No solves recorded in the last ${days} days. Try a shorter or longer time range.`,
    })
  } else if (stats.activeUsers > 0) {
    const solvesPerUser = (stats.totalSolves / stats.activeUsers).toFixed(1)
    insights.push({
      type: "info",
      text: `Active users solved an avg of ${solvesPerUser} problems in the last ${days} days.`,
    })
  }

  // Feature usage
  if (stats.featureUsage.hints > stats.totalSolves * 0.5) {
    insights.push({
      type: "good",
      text: "Hints are popular — users rely on them. This is a strong paywall lever.",
    })
  }

  if (insights.length === 0) {
    insights.push({
      type: "info",
      text: "Not enough data yet to generate insights. Keep growing!",
    })
  }

  return (
    <div className="space-y-3">
      {insights.map((ins, i) => (
        <div
          key={i}
          className={`flex gap-3 rounded-lg p-4 ${
            ins.type === "good"
              ? "bg-[#f0fdf4] border border-[#d1fae5]"
              : ins.type === "warn"
              ? "bg-[#fffbeb] border border-[#fde68a]"
              : "bg-background border border-border"
          }`}
        >
          <div className="mt-0.5 flex-shrink-0">
            {ins.type === "good" && <TrendingUp size={14} className="text-green-600" />}
            {ins.type === "warn" && <AlertCircle size={14} className="text-amber-500" />}
            {ins.type === "info" && <Zap size={14} className="text-muted-foreground/70" />}
          </div>
          <p className="text-xs leading-relaxed text-foreground">{ins.text}</p>
        </div>
      ))}
    </div>
  )
}
