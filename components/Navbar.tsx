"use client"
import Link from "next/link"
import Image from "next/image"
import iconPng from "@/app/icon.png"
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs"
import { LayoutDashboard, Menu, X, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { ModeToggle } from "@/components/mode-toggle"

export function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? ""
  const clerkEnabled = clerkKey.startsWith("pk_") && !clerkKey.includes("placeholder")

  return (
    <header className="fixed inset-x-0 top-0 z-50 pt-4 px-4 pointer-events-none">
      <nav className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between pointer-events-auto">
        <Link href="/" className="flex items-center gap-2 rounded-full bg-background/50 px-3 py-2 backdrop-blur-sm transition-colors hover:bg-background/80">
          <Image src={iconPng} alt="PatternFlow Icon" width={24} height={24} className="rounded-sm object-contain" />
          <span className="text-[17px] font-bold text-foreground tracking-tight">PatternFlow</span>
        </Link>

        {/* Desktop Links (Floating Pill) */}
        <div className="hidden items-center gap-1 rounded-full border border-border/60 bg-background/80 p-1 shadow-sm backdrop-blur-md md:flex">
          <a
            href="/#how-it-works"
            className="rounded-full px-4 py-1.5 font-mono text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            How it works
          </a>
          <Link
            href="/patterns"
            className={`rounded-full px-4 py-1.5 font-mono text-sm font-medium transition ${pathname === "/patterns"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
          >
            Patterns
          </Link>
          <a
            href="/#pricing"
            className="rounded-full px-4 py-1.5 font-mono text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            Pricing
          </a>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3">
            {clerkEnabled ? <ClerkAuthButtons /> : <FallbackAuthButtons />}
            <ModeToggle />
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <ModeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur-md hover:bg-background border border-border/60"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto mt-2 mx-4 rounded-2xl border border-border bg-background/95 p-6 shadow-xl backdrop-blur-md animate-in slide-in-from-top-2 md:hidden">
          <div className="flex flex-col gap-5">
            <a
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-3 py-2 font-mono text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              How it works
            </a>
            <Link
              href="/patterns"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-xl px-3 py-2 font-mono text-sm font-medium transition ${pathname === "/patterns"
                ? "bg-primary/5 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              Patterns
            </Link>
            <a
              href="/#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-3 py-2 font-mono text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Pricing
            </a>
            <Separator className="bg-border" />
            <div className="flex flex-col gap-3">
              {clerkEnabled ? (
                <ClerkAuthButtons mobile onAction={() => setMobileMenuOpen(false)} />
              ) : (
                <FallbackAuthButtons />
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

function ClerkAuthButtons({ mobile, onAction }: { mobile?: boolean; onAction?: () => void }) {
  const { isSignedIn } = useAuth()
  const pathname = usePathname()

  if (isSignedIn) {
    return (
      <div className={`flex items-center gap-3 ${mobile ? "flex-col items-start" : ""}`}>
        <Link
          href="/history"
          onClick={onAction}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 font-mono text-sm font-medium transition ${pathname === "/history"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "bg-background/80 text-muted-foreground shadow-sm backdrop-blur-md hover:bg-background hover:text-foreground border border-border/60"
            } ${!mobile && "hidden md:flex"}`}
        >
          <History size={14} />
          History
        </Link>
        <Link
          href="/dashboard"
          onClick={onAction}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 font-mono text-sm font-medium transition ${pathname === "/dashboard"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "bg-background/80 text-muted-foreground shadow-sm backdrop-blur-md hover:bg-background hover:text-foreground border border-border/60"
            } ${!mobile && "hidden md:flex"}`}
        >
          <LayoutDashboard size={14} />
          Dashboard
        </Link>
        <Link
          href="/solve"
          onClick={onAction}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 font-mono text-sm font-medium transition ${pathname === "/solve"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "bg-background/80 text-muted-foreground shadow-sm backdrop-blur-md hover:bg-background hover:text-foreground border border-border/60"
            } ${!mobile && "hidden md:inline-flex"}`}
        >
          Solve
        </Link>
        {!mobile && (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-background/80 shadow-sm backdrop-blur-md hover:bg-background border border-border/60">
            <UserButton afterSignOutUrl="/" />
          </div>
        )}
        {mobile && <UserButton afterSignOutUrl="/" />}
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${mobile ? "flex-col items-stretch" : ""}`}>
      <SignInButton mode="modal">
        <Button variant="ghost" size="sm" className="rounded-full px-4 text-sm font-medium text-muted-foreground hover:bg-background hover:text-foreground">
          Sign in
        </Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button size="sm" className="rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-md hover:bg-primary/90">
          Launch App
        </Button>
      </SignUpButton>
    </div>
  )
}

function FallbackAuthButtons() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" className="rounded-full px-4 text-sm font-medium text-muted-foreground hover:bg-background hover:text-foreground">
        Sign in
      </Button>
      <Button size="sm" className="rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-md hover:bg-primary/90">
        Launch App
      </Button>
    </div>
  )
}

export default Navbar