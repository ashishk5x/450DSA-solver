"use client"

import { useState, useMemo, memo } from "react"
import { Navbar } from "@/components/Navbar"
import { PATTERNS, type Pattern } from "@/lib/patterns"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  ChevronDown,
  AlertTriangle,
  Lightbulb,
  Search,
  Target,
  Sparkles,
  Hash,
  Box,
  Network,
  Share2,
  Zap,
  RefreshCw,
  Divide
} from "lucide-react"

const DIFF_COLOR = {
  Beginner: "bg-green-100 text-green-700",
  Intermediate: "bg-amber-100 text-amber-700",
  Advanced: "bg-red-100 text-red-700",
}

const CATEGORIES = ["All", ...Array.from(new Set(PATTERNS.map((p) => p.category)))]

export default function PatternsPage() {
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null)
  const [filter, setFilter] = useState("All")
  const [search, setSearch] = useState("")

  // Memoize the filtered list to prevent expensive recalculations on every keystroke
  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase()
    return PATTERNS.filter((p) => {
      const matchesCategory = filter === "All" || p.category === filter
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(searchLower) ||
        p.keySignals.some((s) => s.toLowerCase().includes(searchLower))
      return matchesCategory && matchesSearch
    })
  }, [filter, search])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 pt-24 sm:px-6 sm:py-12">
        <div className="mb-8">
          <p className="mb-1 font-mono text-sm text-muted-foreground/70">{"// pattern library"}</p>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Learn the Patterns</h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-lg">
            Master these core algorithm patterns. Each one has signals to recognize it,
            step-by-step thinking, common mistakes, and practice problems.
          </p>
        </div>

        {/* Search + Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patterns or keywords..."
              className="w-full rounded-xl border border-border bg-card px-4 py-3 pl-11 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-primary focus:ring-1 focus:ring-[#1a1814]"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`rounded-full border px-3 py-1.5 font-mono text-xs transition-all ${
                  filter === cat
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Pattern count */}
        <p className="mb-4 font-mono text-xs text-muted-foreground/70">
          {filtered.length} pattern{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* Pattern Cards */}
        <div className="space-y-3">
          {filtered.map((pattern) => (
            <PatternCard
              key={pattern.slug}
              pattern={pattern}
              isExpanded={expandedSlug === pattern.slug}
              onToggle={() =>
                setExpandedSlug(expandedSlug === pattern.slug ? null : pattern.slug)
              }
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Search size={32} className="mx-auto mb-3 text-[#e8e2d9]" />
            <p className="text-sm text-muted-foreground/70">No patterns found. Try a different search.</p>
          </div>
        )}
      </main>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CATEGORY_ICONS: Record<string, any> = {
  "Array": Hash,
  "Search": Search,
  "Data Structure": Box,
  "Tree": Network,
  "Graph": Share2,
  "Optimization": Zap,
  "Exhaustive Search": RefreshCw,
  "Math": Divide,
}

// Memoized Card component to prevent re-rendering 25+ cards on every keystroke
const PatternCard = memo(({
  pattern,
  isExpanded,
  onToggle,
}: {
  pattern: Pattern
  isExpanded: boolean
  onToggle: () => void
}) => {
  const Icon = CATEGORY_ICONS[pattern.category] || Box

  return (
    <div className="rounded-xl border border-border bg-card transition-all hover:border-border/80">
      {/* Header — always visible */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary sm:h-12 sm:w-12">
            <Icon size={20} className="text-primary-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <h3 className="font-mono text-xs font-bold text-foreground truncate sm:text-sm">{pattern.name}</h3>
              <Badge
                className={`text-[9px] font-mono px-1.5 py-0 sm:text-[10px] sm:px-2 ${
                  DIFF_COLOR[pattern.difficulty]
                }`}
              >
                {pattern.difficulty}
              </Badge>
              <span className="font-mono text-[9px] text-muted-foreground/70 sm:text-[10px]">{pattern.category}</span>
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-1 sm:mt-1 sm:text-xs">{pattern.description}</p>
          </div>
        </div>
        <ChevronDown
          size={16}
          className={`flex-shrink-0 text-muted-foreground/70 transition-transform duration-200 ml-4 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Expanded Content — Optimized with grid and conditional mounting */}
      <div
        className={`grid transition-all duration-200 ease-in-out ${
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          {isExpanded && (
            <div className="border-t border-border px-5 pb-5 pt-4 space-y-5">
              {/* When to use */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target size={14} className="text-foreground" />
                  <span className="font-mono text-xs font-bold text-foreground">When to use</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{pattern.whenToUse}</p>
              </div>

              {/* Key Signals */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-foreground" />
                  <span className="font-mono text-xs font-bold text-foreground">
                    Spot it in problems
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pattern.keySignals.map((signal) => (
                    <span
                      key={signal}
                      className="rounded-full bg-muted px-3 py-1 font-mono text-xs text-foreground"
                    >
                      {signal}
                    </span>
                  ))}
                </div>
              </div>

              {/* How to Think */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={14} className="text-foreground" />
                  <span className="font-mono text-xs font-bold text-foreground">How to think</span>
                </div>
                <ol className="space-y-2">
                  {pattern.howToThink.map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {i + 1}
                      </span>
                      <span className="text-sm text-muted-foreground leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Common Mistakes */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={14} className="text-amber-500" />
                  <span className="font-mono text-xs font-bold text-foreground">
                    Common mistakes
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {pattern.commonMistakes.map((mistake, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                      {mistake}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Practice Problems */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={14} className="text-foreground" />
                  <span className="font-mono text-xs font-bold text-foreground">Practice these</span>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {pattern.practiceProblems.map((prob) => (
                    <div
                      key={prob.name}
                      className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2"
                    >
                      <div>
                        <p className="text-xs font-medium text-foreground">{prob.name}</p>
                        <p className="font-mono text-[10px] text-muted-foreground/70">{prob.platform}</p>
                      </div>
                      <span
                        className={`font-mono text-[10px] ${
                          prob.difficulty === "Easy"
                            ? "text-green-600"
                            : prob.difficulty === "Hard"
                            ? "text-red-500"
                            : "text-amber-600"
                        }`}
                      >
                        {prob.difficulty}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

PatternCard.displayName = "PatternCard"
