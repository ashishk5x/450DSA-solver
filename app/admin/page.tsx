/* eslint-disable */
import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient"
import { fetchAdminStats } from "@/lib/admin-queries"
import { RANGE_DAYS, Range } from "@/components/admin/RangeSelector"

const ADMIN_EMAIL = "theanubhav333@gmail.com"
const DEFAULT_RANGE: Range = "7D"
async function getStats(days: number) {
  "use server"
  try {
    return await fetchAdminStats(days)
  } catch {
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalSolves: 0,
      paidUsers: 0,
      conversionRate: 0,
      revenue: 0,
      growthChart: [],
      featureUsage: { hints: 0, patternUnlocks: 0 },
      recentActivity: [],
      funnelData: { totalUsers: 0, solveClicked: 0, paidUsers: 0 },
    }
  }
}

export default async function AdminPage() {
  const { userId } = await auth()
  if (!userId) redirect("/")

  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress ?? ""
  if (email !== ADMIN_EMAIL) redirect("/")

  const initialStats = await getStats(RANGE_DAYS[DEFAULT_RANGE])
  const initial = email.charAt(0).toUpperCase()

  return (
    <div className="flex min-h-screen bg-background">
      {/* Fixed left sidebar */}
      <AdminSidebar />

      {/* Main area — offset for sidebar on lg */}
      <div className="flex flex-1 flex-col lg:pl-56">

        {/* Sticky top header */}
        <header className="sticky top-0 z-40 flex h-14 flex-shrink-0 items-center justify-between border-b border-border bg-background/90 px-6 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {/* Mobile: show logo since sidebar is hidden */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
                <span className="font-mono text-[10px] font-bold text-primary-foreground">PF</span>
              </div>
              <span className="text-sm font-bold text-foreground">Admin</span>
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-semibold text-foreground">Founder Dashboard</p>
              <p className="font-mono text-[10px] text-muted-foreground/70">PatternFlow · Private</p>
            </div>
          </div>

          {/* Right: user avatar */}
          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-xs text-muted-foreground/70 md:block">{email}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <span className="font-mono text-xs font-bold text-primary-foreground">{initial}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto px-6 py-8 lg:px-8">
          <AdminDashboardClient
            initialStats={initialStats}
            initialRange={DEFAULT_RANGE}
            fetchStats={getStats}
          />
        </main>
      </div>
    </div>
  )
}
