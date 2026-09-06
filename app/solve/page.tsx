"use client";

import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Eye,
  FlaskConical,
  Layers,
  RotateCcw,
  Target,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResultCard, type SolveResult } from "@/components/ResultCard";
import { EXAMPLE_PROBLEMS } from "@/lib/problems";
import { useAuth, useClerk } from "@clerk/nextjs";
import { analytics } from "@/lib/posthog-events";

const LOADING_LINES = [
  "> Parsing problem statement...",
  "> Extracting core task...",
  "> Detecting algorithmic pattern...",
  "> Generating visualization...",
  "> Finding similar problems...",
  "> Building memory hook...",
];

export default function SolvePage() {
  const [problem, setProblem] = useState<string>(EXAMPLE_PROBLEMS["two-sum"].content);
  const [result, setResult] = useState<SolveResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [solvesUsed, setSolvesUsed] = useState(0);
  const [solveLimit, setSolveLimit] = useState(3);
  const [lineIndex, setLineIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [userPlan, setUserPlan] = useState<"free" | "basic" | "pro">("free");
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const solveKeyRef = useRef("");
  const { userId } = useAuth();
  const { openSignUp } = useClerk();

  // Load persisted data on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");

    if (query) {
      if (query.includes("leetcode.com/problems/") || query.includes("geeksforgeeks.org/problems/")) {
        const platform = query.includes("leetcode.com") ? "LeetCode" : "GeeksForGeeks";
        setProblem(`Fetching problem from ${platform}...`);
        
        fetch("/api/fetch-problem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: query }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.problem) {
              setProblem(data.problem);
            } else {
              setProblem(query);
            }
          })
          .catch(() => setProblem(query));
      } else {
        setProblem(query);
      }
      
      // Clean up the URL so the query string doesn't stay there forever
      window.history.replaceState({}, '', '/solve');
    } else {
      const savedProblem = localStorage.getItem("patternflow_last_problem");
      const savedResult = localStorage.getItem("patternflow_last_result");
      if (savedProblem) setProblem(savedProblem);
      if (savedResult) {
        try {
          setResult(JSON.parse(savedResult));
        } catch (e) {
          console.error("Failed to parse saved result", e);
        }
      }
    }
  }, []);

  // Fetch plan + usage on mount
  useEffect(() => {
    fetch("/api/user-plan")
      .then(r => r.json())
      .then(d => setUserPlan(d.plan || "free"))
      .catch(() => setUserPlan("free"))

    if (userId) {
      // Authenticated: use server-side usage tracking
      fetch("/api/solve-limit")
        .then(r => r.json())
        .then(d => {
          setSolvesUsed(d.used || 0);
          setSolveLimit(d.limit > 0 ? d.limit : -1);
          setSolveLimit(d.limit > 0 ? d.limit : -1);
        })
        .catch(() => {});
    } else {
      // Unauthenticated: fallback to localStorage
      const key = `patternflow_solves_${new Date().toDateString()}`;
      solveKeyRef.current = key;
      const stored = Number.parseInt(localStorage.getItem(key) ?? "0", 10);
      setSolvesUsed(Number.isNaN(stored) ? 0 : Math.min(3, stored));
      setSolveLimit(3);
      setSolveLimit(3);
    }
  }, [userId]);

  useEffect(() => {
    const handleSendToSolver = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      if (customEvent.detail) {
        setProblem(customEvent.detail);
        textAreaRef.current?.focus();
      }
    };
    window.addEventListener("patternflow:send-to-solver", handleSendToSolver);
    return () => window.removeEventListener("patternflow:send-to-solver", handleSendToSolver);
  }, []);

  useEffect(() => {
    if (!loading) return;
    if (lineIndex >= LOADING_LINES.length) return;
    const timer = window.setTimeout(() => setLineIndex((prev) => prev + 1), 700);
    return () => window.clearTimeout(timer);
  }, [loading, lineIndex]);

  const handleReset = () => {
    setProblem("");
    setResult(null);
    setError("");
    setLineIndex(0);
    localStorage.removeItem("patternflow_last_result");
    localStorage.removeItem("patternflow_last_problem");
  };

  const handleCopy = async () => {
    if (!problem.trim()) return;
    await navigator.clipboard.writeText(problem);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const handleSolve = async () => {
    if (!problem.trim()) return;

    if (!userId) {
      // Force signup if not logged in
      openSignUp({
        fallbackRedirectUrl: "/solve"
      });
      return;
    }

    // Client-side limit check (server enforces too)
    if (solveLimit > 0 && solvesUsed >= solveLimit) {
      const msg = userPlan === "basic"
        ? "Monthly solve limit reached (100/month). Upgrade to Pro for unlimited."
        : "Daily free limit reached. Come back tomorrow or upgrade to Basic.";
      setError(msg);
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    setLineIndex(0);
    localStorage.removeItem("patternflow_last_result");
    analytics.trackSolveClicked();

    try {
      const response = await fetch("/api/solve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "authorization": `Bearer ${userId}`,
        },
        body: JSON.stringify({ problem }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to analyze. Try again.");
        return;
      }
      setResult(data as SolveResult);
      // Persist result and problem
      localStorage.setItem("patternflow_last_result", JSON.stringify(data));
      localStorage.setItem("patternflow_last_problem", problem);
      // Update usage count locally
      if(!data._meta?.cacheHit){
        setSolvesUsed( prev => {
          const updated = prev + 1;
          if (!userId) {
            // localStorage fallback for unauthenticated
            const nextCount = Math.min(3, updated);
            localStorage.setItem(solveKeyRef.current, String(nextCount));
          }
          return updated;
        });
      }    
    } catch {
      setError("Failed to analyze. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8 pt-24 sm:px-6 sm:py-12 sm:pt-24">
        <div className="mb-8">
          <p className="mb-1 font-mono text-sm text-muted-foreground/70">{"// ai pattern solver"}</p>
          <h1 className="mb-1 text-2xl font-bold text-foreground sm:text-3xl">Paste your problem</h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Works with LeetCode, GFG, Codeforces — paste the full thing, noise included.
          </p>
          <Badge
            variant="outline"
            className="border-border bg-card font-mono text-xs text-muted-foreground hover:bg-card"
          >
            <Brain size={14} className="mr-2 text-muted-foreground/70" />
            Pattern detection + memory hooks
          </Badge>
        </div>

        <div className="mb-4 flex items-center gap-2">
          {userPlan === "free" && (
            <div className="flex gap-1">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className={`h-1.5 w-6 rounded-full ${n <= solvesUsed ? "bg-primary" : "bg-[#e8e2d9]"}`}
                />
              ))}
            </div>
          )}
          {userPlan === "basic" && (
            <div className="flex gap-1">
              <div
                className="h-1.5 rounded-full bg-[#e8e2d9] overflow-hidden"
                style={{ width: "120px" }}
              >
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(100, (solvesUsed / 100) * 100)}%` }}
                />
              </div>
            </div>
          )}
          <span className="font-mono text-xs text-muted-foreground/70">
            {userPlan === "pro"
              ? "Pro plan · unlimited solves"
              : userPlan === "basic"
              ? `${Math.max(0, 100 - solvesUsed)} of 100 solves remaining this month`
              : `${Math.max(0, 3 - solvesUsed)} of 3 free solves remaining today`}
          </span>
        </div>

        <textarea
          ref={textAreaRef}
          value={problem}
          onChange={(event) => setProblem(event.target.value)}
          className="min-h-[200px] w-full resize-none rounded-xl border border-border bg-card p-4 font-mono text-sm leading-relaxed text-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:ring-1 focus:ring-[#1a1814]"
          placeholder="Paste any DSA problem here..."
        />

        <div className="mt-3 flex flex-wrap gap-2">
          {Object.keys(EXAMPLE_PROBLEMS).map((label) => (
            <button
              key={label}
              onClick={() => setProblem(EXAMPLE_PROBLEMS[label as keyof typeof EXAMPLE_PROBLEMS].content)}
              className="rounded-full border border-border bg-card px-3 py-1.5 font-mono text-xs text-muted-foreground transition-all hover:border-primary hover:text-foreground"
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            {error ? (
              <p className="animate-in fade-in zoom-in text-sm font-medium text-red-500 duration-300">
                {error}
              </p>
            ) : null}
            {!error && result ? (
              <span className="inline-flex items-center gap-1 text-sm text-green-600">
                <CheckCircle2 size={14} />
                Analysis Complete
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              type="button"
              variant="outline"
              onClick={handleCopy}
              disabled={!problem.trim() || loading}
              className="border-border bg-card px-3 font-mono text-muted-foreground hover:border-primary hover:text-foreground"
            >
              {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={loading}
              className="border-border bg-card px-3 font-mono text-muted-foreground hover:border-primary hover:text-foreground"
            >
              <RotateCcw size={14} />
            </Button>
            <Button
              onClick={handleSolve}
              disabled={loading || !problem.trim()}
              className="w-full bg-primary px-6 font-mono text-primary-foreground hover:bg-primary/90 disabled:opacity-70 sm:w-auto sm:min-w-[140px]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin text-[#86efac]" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Zap size={16} /> Solve
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* LOADING & RESULT CONTAINER (Layout Stable) */}
        <div className="mt-8 min-h-[400px]">
          {loading ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="rounded-xl bg-primary p-6 font-mono text-sm shadow-2xl ring-1 ring-white/10">
                <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
                  <span className="ml-2 text-[10px] uppercase tracking-[0.2em] text-card-foreground/30">patternflow-engine.log</span>
                </div>
                
                <div className="space-y-1.5">
                  {LOADING_LINES.slice(0, lineIndex).map((line) => (
                    <p key={line} className="text-[#86efac]">
                      {line}
                    </p>
                  ))}
                  <p className="flex items-center gap-1.5 text-[#86efac]">
                    <span className="flex h-1.5 w-1.5 animate-pulse rounded-full bg-[#86efac]" />
                    {LOADING_LINES[lineIndex] || "Finishing analysis..."}
                  </p>
                </div>
              </div>
            </div>
          ) : result ? (
            <div className="animate-in fade-in duration-700">
              <ResultCard result={result} plan={userPlan} userId={userId} />
            </div>
          ) : null}
        </div>

        <div className="mt-10 flex items-center justify-center gap-5 text-muted-foreground/70">
          <ChevronRight size={16} />
          <Eye size={16} />
          <Target size={16} />
          <BookOpen size={16} />
          <Clock size={16} />
          <Layers size={16} />
          <FlaskConical size={16} />
        </div>
      </main>
    </div>
  );
}