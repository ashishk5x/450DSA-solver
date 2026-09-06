"use client"

export type Range = "7D" | "30D" | "90D" | "1Y"

export const RANGE_DAYS: Record<Range, number> = {
  "7D": 7,
  "30D": 30,
  "90D": 90,
  "1Y": 365,
}

type RangeSelectorProps = {
  selected: Range
  onChange: (r: Range) => void
}

const RANGES: Range[] = ["7D", "30D", "90D", "1Y"]

export function RangeSelector({ selected, onChange }: RangeSelectorProps) {
  return (
    <div className="flex gap-1 rounded-lg border border-border bg-secondary p-1">
      {RANGES.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`rounded-md px-3 py-1.5 font-mono text-xs transition-all ${
            selected === r
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  )
}
