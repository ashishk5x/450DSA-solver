type FunnelProps = {
  totalUsers: number
  solveClicked: number
  paidUsers: number
}

type Step = {
  label: string
  sublabel: string
  count: number
}

export function Funnel({ totalUsers, solveClicked, paidUsers }: FunnelProps) {
  const max = Math.max(totalUsers, 1)

  const steps: Step[] = [
    { label: "Signed Up", sublabel: "Total users", count: totalUsers },
    { label: "Solved a Problem", sublabel: "Engaged users", count: solveClicked },
    { label: "Converted", sublabel: "Paid users", count: paidUsers },
  ]

  return (
    <div className="space-y-1">
      {steps.map((step, i) => {
        const pct = Math.round((step.count / max) * 100)
        const dropPct =
          i > 0 && steps[i - 1].count > 0
            ? Math.round((1 - step.count / steps[i - 1].count) * 100)
            : null

        return (
          <div key={step.label}>
            {/* Drop-off indicator between steps */}
            {dropPct !== null && (
              <div className="flex items-center gap-2 py-1.5 pl-3">
                <div className="h-4 w-px bg-[#e8e2d9]" />
                <span className="font-mono text-[10px] text-muted-foreground/70">
                  {dropPct}% dropped off
                </span>
              </div>
            )}

            {/* Step block */}
            <div className="overflow-hidden rounded-lg border border-border bg-background">
              {/* Progress bar at top */}
              <div className="h-1 w-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{step.label}</p>
                  <p className="font-mono text-[10px] text-muted-foreground/70">{step.sublabel}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-lg font-bold text-foreground">
                    {step.count.toLocaleString()}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground/70">{pct}%</p>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
