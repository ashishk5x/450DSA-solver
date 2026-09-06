import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { ResultCard } from "@/components/ResultCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function SolveDetailsPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // First, verify plan to prevent Free users from bypassing the lock by guessing IDs
  const { data: subData } = await sb
    .from("subscriptions")
    .select("plan, expires_at")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  let plan = "free";
  if (subData) {
    const expired = subData.expires_at && new Date(subData.expires_at) < new Date();
    if (!expired) plan = subData.plan as string;
  }

  if (plan === "free") {
    redirect("/history");
  }

  // Fetch the specific solve
  const { data: solve, error } = await sb
    .from("solves")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", userId)
    .single();

  if (error || !solve) {
    return (
      <div className="min-h-screen bg-background font-sans">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <h2 className="text-2xl font-bold mb-4">Solve not found</h2>
          <p className="text-muted-foreground mb-8">This problem doesn&apos;t exist or you don&apos;t have access to it.</p>
          <Link href="/history">
            <Button>Return to History</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20 selection:text-primary">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <Link href="/history" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to History
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            {solve.problem_summary}
          </h1>
          <p className="text-muted-foreground mt-2 font-mono text-sm">
            Analyzed on {new Date(solve.created_at).toLocaleString()}
          </p>
        </div>

        {/* Reusing the ResultCard component to display the saved result perfectly! */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-4 md:p-8">
          <ResultCard result={solve.full_result} plan={plan as "free" | "basic" | "pro"} />
        </div>
      </main>
    </div>
  );
}
