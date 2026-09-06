"use client"

import Link from "next/link"
import {
  Code2,
  LayoutDashboard,
  TrendingUp,
  GitBranch,
  Zap,
  ExternalLink,
} from "lucide-react"

const navSections = [
  {
    title: "OVERVIEW",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "#top" },
    ],
  },
  {
    title: "ANALYTICS",
    items: [
      { label: "Growth", icon: TrendingUp, href: "#growth" },
      { label: "Funnel", icon: GitBranch, href: "#funnel" },
      { label: "Features", icon: Zap, href: "#features" },
    ],
  },
  {
    title: "APP",
    items: [
      { label: "View App", icon: ExternalLink, href: "/" },
    ],
  },
]

export function AdminSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-56 flex-col border-r border-border bg-card lg:flex">
      {/* Brand */}
      <div className="flex h-16 flex-shrink-0 items-center gap-2.5 border-b border-border px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
          <Code2 size={14} className="text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">PatternFlow</p>
          <p className="font-mono text-[9px] text-muted-foreground/70">Admin Console</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {navSections.map((section) => (
          <div key={section.title} className="mb-6">
            <p className="mb-2 px-2 font-mono text-[9px] font-semibold tracking-widest text-[#d4cdc4]">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = item.href === "#top"
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <Icon size={13} />
                    <span className="font-mono text-xs">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-border px-5 py-4">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          <span className="font-mono text-[9px] text-muted-foreground/70">Live</span>
        </span>
      </div>
    </aside>
  )
}
