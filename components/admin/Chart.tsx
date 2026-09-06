"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

type ChartProps = {
  data: { date: string; count: number }[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md">
      <p className="font-mono text-[10px] text-muted-foreground/70">{label}</p>
      <p className="font-mono text-sm font-bold text-foreground">
        {payload[0].value} solve{payload[0].value !== 1 ? "s" : ""}
      </p>
    </div>
  )
}

export function Chart({ data }: ChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-lg bg-background">
        <p className="font-mono text-xs text-muted-foreground/70">No data for this period</p>
      </div>
    )
  }

  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={formatted} margin={{ top: 8, right: 4, left: -28, bottom: 0 }}>
        <defs>
          <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1a1814" stopOpacity={0.08} />
            <stop offset="95%" stopColor="#1a1814" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#f0ede6"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "#a89f96" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "#a89f96" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#e8e2d9", strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#1a1814"
          strokeWidth={2}
          fill="url(#fillGradient)"
          dot={false}
          activeDot={{ r: 4, fill: "#1a1814", strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
