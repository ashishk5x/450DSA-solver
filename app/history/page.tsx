"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Navbar } from "@/components/Navbar";
import { HistoryCard, SolveHistoryItem } from "@/components/HistoryCard";
import { PaymentButton } from "@/components/PaymentButton";
import { Lock, History, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { isLoaded, userId } = useAuth();
  const [history, setHistory] = useState<SolveHistoryItem[]>([]);
  const [plan, setPlan] = useState<"free" | "basic" | "pro">("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !userId) return;

    fetch("/api/history")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setHistory(data.history || []);
          setPlan(data.plan || "free");
        }
      })
      .catch((err) => console.error("Error fetching history:", err))
      .finally(() => setLoading(false));
  }, [isLoaded, userId]);

  if (!isLoaded) return null;

  if (!userId) {
    return (
      <div className="min-h-screen bg-background font-sans">
        <Navbar />
        <div className="flex h-[80vh] flex-col items-center justify-center">
          <p className="text-muted-foreground mb-4">Please sign in to view your dashboard.</p>
          <Link href="/sign-in">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20 selection:text-primary">
      <Navbar />

      <main className="container mx-auto px-4 py-12 md:py-20 max-w-6xl">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <History className="text-primary h-8 w-8" />
              Solve History
            </h1>
            <p className="text-muted-foreground mt-2">
              {plan === "free" 
                ? "Upgrade to view and review your past solves."
                : plan === "basic"
                ? "Your problem solving history for the last 30 days."
                : "Your complete problem solving history."}
            </p>
          </div>
          
          {plan === "free" && (
            <PaymentButton plan="basic">
              <Sparkles className="mr-2 h-4 w-4" />
              Upgrade to Unlock
            </PaymentButton>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 rounded-xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-card/30 border border-border/50 rounded-2xl border-dashed">
            <History className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground">No solves yet</h3>
            <p className="text-muted-foreground mt-1 mb-6 max-w-sm">
              You haven&apos;t analyzed any problems yet. Head over to the Solve page to get started!
            </p>
            <Link href="/solve">
              <Button>Start Solving</Button>
            </Link>
          </div>
        ) : (
          <div className="relative">
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${plan === "free" ? "max-h-[600px] overflow-hidden" : ""}`}>
              {history.map((item, i) => (
                <HistoryCard 
                  key={item.id} 
                  item={item} 
                  isBlurred={plan === "free" && i > 0} 
                />
              ))}
            </div>

            {/* Paywall Overlay for Free Users */}
            {plan === "free" && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-2xl border border-border/50 mt-20">
                <div className="bg-card p-8 rounded-2xl border border-primary/20 shadow-2xl max-w-md text-center flex flex-col items-center">
                  <div className="bg-primary/10 p-4 rounded-full mb-6 text-primary">
                    <Lock className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">History Locked</h3>
                  <p className="text-muted-foreground mb-8">
                    Your past solves are saved securely, but viewing them requires a Basic or Pro subscription. Upgrade now to unlock your full study history.
                  </p>
                  <PaymentButton plan="basic" className="w-full mb-3 text-lg py-6">
                    Unlock History
                  </PaymentButton>
                  <p className="text-xs text-muted-foreground">
                    Basic unlocks 30-day history. Pro unlocks full history.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
