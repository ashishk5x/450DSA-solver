"use client"

import { useState } from "react"

type ConfidenceLevel = 1 | 2 | 3 | 4

const levels: { value: ConfidenceLevel; emoji: string; label: string; color: string }[] = [
  { value: 1, emoji: "😰", label: "Not at all", color: "border-red-200 bg-red-50 hover:border-red-400" },
  { value: 2, emoji: "😐", label: "Somewhat", color: "border-amber-200 bg-amber-50 hover:border-amber-400" },
  { value: 3, emoji: "😊", label: "Good", color: "border-green-200 bg-green-50 hover:border-green-400" },
  { value: 4, emoji: "💪", label: "Nailed it", color: "border-primary bg-muted hover:bg-[#e8e2d9]" },
]

type Props = {
  patternName: string
  onRate: (confidence: ConfidenceLevel) => Promise<void>
}

export function ConfidenceRating({ patternName, onRate }: Props) {
  const [selected, setSelected] = useState<ConfidenceLevel | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)

  const handleSelect = async (level: ConfidenceLevel) => {
    if (submitted || saving) return
    setSelected(level)
    setSaving(true)
    setError(false)
    try {
      await onRate(level)
      setSubmitted(true)
    } catch {
      setError(true)
    } finally {
      setSaving(false)
    }
  }

  const handleReRate = () => {
    setSubmitted(false)
    setSelected(null)
    setError(false)
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
        <p className="text-sm font-medium text-green-800">
          ✓ Confidence recorded for {patternName}
        </p>
        <p className="mt-1 text-xs text-green-600">
          This helps track your pattern mastery on the dashboard.
        </p>
        <button
          onClick={handleReRate}
          className="mt-2 text-xs font-mono text-green-700 underline hover:text-green-900 transition-colors"
        >
          Change my rating
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border-2 border-border bg-background p-5">
      <p className="font-mono text-xs text-muted-foreground/70 mb-1">{"// self-check"}</p>
      <p className="text-sm font-medium text-foreground mb-1">
        How confident are you with <span className="font-bold">{patternName}</span>?
      </p>
      <p className="text-xs text-muted-foreground/70 mb-4">
        Be honest — this helps identify your weak patterns.
      </p>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-2 mb-3 text-center">
          <p className="text-xs text-red-600">
            Failed to save — please try again.
          </p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {levels.map((level) => (
          <button
            key={level.value}
            onClick={() => handleSelect(level.value)}
            disabled={saving}
            className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all ${level.color} ${
              selected === level.value ? "ring-2 ring-[#1a1814] ring-offset-1" : ""
            } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span className="text-2xl">{level.emoji}</span>
            <span className="font-mono text-[11px] text-foreground">{level.label}</span>
          </button>
        ))}
      </div>
      {saving && (
        <p className="text-xs font-mono text-muted-foreground/70 mt-3 text-center animate-pulse">
          Saving...
        </p>
      )}
    </div>
  )
}
