"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import iconPng from "@/app/icon.png";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/Navbar";
import StickyQuotes from "@/components/StickyQuotes";
import { PaymentButton } from "@/components/PaymentButton";
import { CursorCat } from "@/components/CursorCat";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardPaste,
  Clock,
  Fingerprint,
  HelpCircle,
  Layers,
  Lightbulb,
  Sparkles,
  Target,
  Timer,
  X,
  Link2,
  Users
} from "lucide-react";

// Dynamic Timer Component
function DynamicTimer() {
  const [timeLeft, setTimeLeft] = useState(18 * 60 + 42); // 18:42

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return <span className="font-mono text-[32px] font-bold leading-none text-primary-foreground">{display}</span>;
}

export default function LandingPage() {
  const router = useRouter();
  const [urlInput, setUrlInput] = useState("");

  const handleAnalyze = () => {
    if (urlInput.trim()) {
      router.push(`/solve?q=${encodeURIComponent(urlInput.trim())}`);
    } else {
      router.push("/solve");
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20 selection:text-primary">
      <CursorCat />
      <Navbar />

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 pt-24 sm:px-6">
        
        {/* Animated Background Glows */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[10%] left-[20%] h-[500px] w-[500px] rounded-full bg-amber-400/20 dark:bg-amber-500/10 blur-[100px]"
          />
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-[20%] right-[10%] h-[400px] w-[400px] rounded-full bg-orange-500/20 dark:bg-orange-600/10 blur-[100px]"
          />
        </div>

        {/* Tech Grid Pattern */}
        <div 
          className="absolute inset-0 z-0 opacity-60 bg-[radial-gradient(#d4d4d8_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" 
          style={{ 
            WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)", 
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)" 
          }}
        />

        {/* Floating DSA Symbols */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
          {[
            { symbol: "{ }", left: "15%", top: "25%", delay: 0 },
            { symbol: "</>", left: "80%", top: "20%", delay: 1.5 },
            { symbol: "O(n)", left: "20%", top: "65%", delay: 3 },
            { symbol: "[ ]", left: "75%", top: "75%", delay: 4.5 },
            { symbol: "=>", left: "85%", top: "45%", delay: 6 },
            { symbol: "⌘", left: "10%", top: "45%", delay: 7.5 },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: [0, 0.8, 0.8, 0],
                y: [-10, -80],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 10, 
                repeat: Infinity, 
                delay: item.delay,
                ease: "linear"
              }}
              className="absolute text-4xl font-mono font-bold text-amber-500/20 dark:text-amber-500/10"
              style={{ left: item.left, top: item.top }}
            >
              {item.symbol}
            </motion.div>
          ))}
        </div>

        <FloatingPatternBlock />
        <FloatingTreeBlock />

        <div className="relative z-10 mx-auto max-w-[720px] text-center px-4 w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Badge
              variant="outline"
              className="gap-1.5 border-amber-200/50 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-900/10 px-3 py-1 font-mono text-[11px] text-amber-700 dark:text-amber-400 shadow-sm backdrop-blur-sm"
            >
              <Sparkles size={12} className="text-amber-600 dark:text-amber-400 animate-pulse" />
              AI-Powered Pattern Recognition
            </Badge>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-8 font-mono text-[40px] leading-[1.1] tracking-[-1px] text-foreground md:text-[60px]"
          >
            Understand DSA.
            <br />
            <span className="font-black bg-gradient-to-r from-amber-600 to-orange-500 dark:from-amber-400 dark:to-orange-300 bg-clip-text text-transparent">Not memorize it.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-[500px] text-[18px] text-muted-foreground leading-relaxed"
          >
            Paste any problem. Get pattern detection, memory hooks, and similar problems — instantly.
          </motion.p>
          
          {/* Interactive Input Box */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 mx-auto max-w-lg flex items-center p-1.5 bg-background dark:bg-black/80 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-xl shadow-amber-500/10 backdrop-blur-sm relative z-20"
          >
            <div className="pl-4 pr-3 text-muted-foreground">
              <Link2 className="h-5 w-5 opacity-50" />
            </div>
            <input 
              type="text" 
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              placeholder="Paste LeetCode URL or problem text..." 
              className="flex-1 bg-transparent border-none outline-none text-sm font-mono placeholder:text-muted-foreground/50 text-foreground w-full"
            />
            <Button
              onClick={handleAnalyze}
              className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-6 h-11 border-none shadow-[0_0_20px_-5px_rgba(245,158,11,0.5)] transition-all hover:scale-105"
            >
              Analyze
            </Button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            {/* Social Proof Avatars */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="h-6 w-6 rounded-full border-2 border-background bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden"><Users className="h-3 w-3 text-zinc-400" /></div>
                <div className="h-6 w-6 rounded-full border-2 border-background bg-zinc-300 dark:bg-zinc-700 flex items-center justify-center overflow-hidden"><Users className="h-3 w-3 text-zinc-500" /></div>
                <div className="h-6 w-6 rounded-full border-2 border-background bg-amber-500/20 flex items-center justify-center font-mono text-[8px] text-amber-600 font-bold">+500</div>
              </div>
              <p className="font-mono text-xs text-muted-foreground/80">
                Join <span className="font-bold text-foreground">500+</span> developers
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sticky Quotes */}
      <section id="quotes" className="bg-background py-12 md:py-16">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-6xl px-6"
        >
          <h2 className="mb-2 text-center text-3xl font-bold text-foreground">
            A little motivation goes a long way
          </h2>
          <p className="mb-16 text-center font-mono text-sm text-muted-foreground/70">
            quotes change every day · come back tomorrow
          </p>
          <StickyQuotes />
        </motion.div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-[#fcf8f3] dark:bg-black py-12 md:py-16 border-y border-[#f0e6d2] dark:border-zinc-900 transition-colors duration-300">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="mt-2 font-mono text-3xl text-foreground dark:text-white md:text-[32px]">Three steps to clarity</h2>
          </motion.div>
          
          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                icon: ClipboardPaste,
                num: "01",
                title: "Paste anything",
                desc: "Full LeetCode page, GFG problem, random question — paste it raw. We extract what matters.",
                delay: 0
              },
              {
                icon: Brain,
                num: "02",
                title: "Think, don't memorize",
                desc: "AI guides you to think — hints, Socratic questions, pattern reveal only when you're ready.",
                delay: 0.2
              },
              {
                icon: Target,
                num: "03",
                title: "Remember it",
                desc: "Memory hook, interview recognition tips, similar problems — everything to make it stick.",
                delay: 0.4
              }
            ].map((step, idx) => (
              <motion.article 
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: step.delay }}
                className="group relative overflow-hidden rounded-2xl border border-border dark:border-zinc-800 bg-card dark:bg-zinc-950 p-8 transition-all duration-500 hover:-translate-y-2 hover:border-amber-500/50 hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.15)]"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/5 dark:via-white/5 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-[200%]" />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between">
                    <div className="inline-flex rounded-xl bg-muted dark:bg-zinc-900 p-3 transition-colors duration-500 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30">
                      <step.icon className="h-6 w-6 text-muted-foreground dark:text-zinc-400 transition-colors duration-500 group-hover:text-amber-600 dark:group-hover:text-amber-400" />
                    </div>
                    <p className="font-mono text-[40px] leading-none font-black text-muted-foreground/20 dark:text-zinc-800 transition-all duration-500 group-hover:text-amber-500/40 dark:group-hover:text-amber-500/20 group-hover:-translate-x-2">{step.num}</p>
                  </div>
                  <div className="mt-16">
                    <h3 className="font-mono text-lg font-bold text-foreground dark:text-white transition-colors duration-500 group-hover:text-amber-600 dark:group-hover:text-amber-400">{step.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground dark:text-zinc-400 transition-colors duration-500 group-hover:text-foreground dark:group-hover:text-zinc-300">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get — Feature Showcase */}
      <section className="bg-background py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="mt-2 font-mono text-3xl text-foreground md:text-[32px]">Every solve gives you this</h2>
            <p className="mt-2 text-base text-muted-foreground">Not just an answer — a full learning breakdown.</p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Brain, title: "Think First Prompts", desc: "Before hints, get a Socratic question designed to push you toward the right thinking direction." },
              { icon: Fingerprint, title: "Pattern Detection", desc: "AI identifies the core algorithm pattern — Sliding Window, Two Pointers, BFS, DP, and 15+ more." },
              { icon: Lightbulb, title: "Progressive Hints", desc: "Three-level hint system. Reveal one at a time — only when you're truly stuck. No spoilers." },
              { icon: Target, title: "Memory Hooks", desc: "A memorable one-liner that anchors the pattern in your brain. Recall it during interviews instantly." },
              { icon: Layers, title: "Similar Problems", desc: "Get 3 related problems to reinforce the pattern. Click-to-solve for paid users — instant practice." },
              { icon: HelpCircle, title: "Quick Check Quiz", desc: "Test your understanding before seeing the full approach. Explains your reasoning like an interviewer." }
            ].map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="group relative rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/50 hover:shadow-[0_8px_30px_rgb(245,158,11,0.12)]"
              >
                <div className="mb-4 inline-flex rounded-lg bg-amber-100 dark:bg-amber-900/30 p-2.5 transition-colors group-hover:bg-amber-200 dark:group-hover:bg-amber-800/50">
                  <f.icon className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                </div>
                <h3 className="font-mono text-sm font-bold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-background py-8">
        <div className="mx-auto flex max-w-4xl flex-wrap justify-around gap-8 px-6">
          {[
            { stat: "25+", label: "algorithm patterns" },
            { stat: "5 sec", label: "average solve time" },
            { stat: "100%", label: "free to start" }
          ].map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="text-center"
            >
              <p className="font-mono text-4xl text-foreground">{s.stat}</p>
              <p className="font-mono text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Interview Mode Showcase */}
      <section className="bg-[#fcf8f3] dark:bg-black py-12 md:py-16 border-y border-[#f0e6d2] dark:border-zinc-900 transition-colors duration-300">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-col items-center gap-10 md:flex-row md:gap-16">
            {/* Visual */}
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex-shrink-0"
            >
              <div className="relative w-full max-w-[220px] rounded-2xl border-2 border-primary bg-primary p-6 shadow-lg">
                <p className="font-mono text-[10px] text-primary-foreground/70 dark:text-zinc-400 mb-1">interview mode</p>
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="h-5 w-5 text-amber-200 dark:text-amber-400" />
                  <DynamicTimer />
                </div>
                <div className="h-1.5 w-full rounded-full bg-black/20 dark:bg-black/40 overflow-hidden">
                  <motion.div 
                    initial={{ width: "100%" }}
                    animate={{ width: "62%" }}
                    transition={{ duration: 20, ease: "linear" }}
                    className="h-full rounded-full bg-white transition-all" 
                  />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="font-mono text-[11px] text-primary-foreground/80 dark:text-zinc-300">timer active</span>
                </div>
                {/* Decorative glow */}
                <div className="absolute -inset-1 -z-10 rounded-2xl bg-primary/20 blur-lg" />
              </div>
            </motion.div>
            
            {/* Text */}
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-md text-center md:text-left"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-border dark:border-zinc-800 bg-card dark:bg-zinc-900 px-3 py-1 mb-4">
                <Timer className="h-3.5 w-3.5 text-foreground dark:text-white" />
                <span className="font-mono text-[11px] text-muted-foreground dark:text-zinc-400">Available on Basic & Pro</span>
              </div>
              <h2 className="font-mono text-2xl text-foreground dark:text-white md:text-[28px] leading-tight">
                Practice under real
                <br />
                <span className="font-bold">interview pressure</span>
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground dark:text-zinc-400">
                Real interviews have time limits — so does Interview Mode. Get a timed challenge based on problem difficulty (Easy: 10 min, Medium: 20 min, Hard: 35 min) with a floating countdown timer. Build speed and confidence before the real thing.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing — 3 plans */}
      <section id="pricing" className="bg-background py-12 md:py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-6xl px-6"
        >
          <h2 className="mt-2 font-mono text-3xl text-foreground md:text-[32px]">Simple, honest pricing</h2>
          <p className="mt-2 text-base text-muted-foreground">Start free. Upgrade when you&apos;re ready.</p>

          <div className="mt-12 flex flex-col items-center gap-5 sm:flex-row sm:flex-wrap sm:justify-center">

            {/* FREE */}
            <article className="w-full max-w-xs rounded-xl border border-border bg-card p-7">
              <Badge className="bg-muted font-mono text-muted-foreground hover:bg-muted">Free</Badge>
              <div className="mt-5 flex items-end gap-2">
                <p className="font-mono text-[36px] leading-none text-foreground">₹0</p>
                <p className="pb-1 text-sm text-muted-foreground">/forever</p>
              </div>
              <Separator className="my-5 bg-[#e8e2d9]" />
              <ul className="space-y-2.5">
                {[
                  "3 solves per day",
                  "Think First + hints",
                  "Pattern detection",
                  "Memory hooks",
                  "Quick check quiz",
                  "Streak tracking",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-foreground" />
                    {f}
                  </li>
                ))}
                {["Live AI Mock Interviews", "Similar problems", "Missing concepts", "Solve history"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground/70">
                    <X className="h-3.5 w-3.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                onClick={() => router.push("/solve")}
                className="mt-6 w-full border-border bg-transparent font-mono text-sm text-muted-foreground hover:border-primary hover:text-foreground"
              >
                Start Free
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </article>

            {/* BASIC */}
            <article className="w-full max-w-xs rounded-xl border border-border bg-card p-7">
              <Badge className="bg-muted font-mono text-muted-foreground hover:bg-muted">Basic</Badge>
              <div className="mt-5 flex items-end gap-2">
                <p className="font-mono text-[36px] leading-none text-foreground">₹149</p>
                <p className="pb-1 text-sm text-muted-foreground">/month</p>
              </div>
              <p className="mt-1 font-mono text-xs text-muted-foreground/70">~100 solves/month</p>
              <Separator className="my-5 bg-[#e8e2d9]" />
              <ul className="space-y-2.5">
                {[
                  "100 solves per month",
                  "Everything in Free",
                  "Detailed AI explanations",
                  "Similar problems (full)",
                  "Solve history (30 days)",
                  "4 AI Mock Interviews / mo",
                  "Streak tracking",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-foreground" />
                    {f}
                  </li>
                ))}
                {["Unlimited solves", "Sunday Gauntlet Assessments"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground/70">
                    <X className="h-3.5 w-3.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <PaymentButton
                plan="basic"
                className="mt-6 w-full border border-primary bg-transparent font-mono text-sm text-foreground hover:bg-muted"
              >
                Get Basic
                <ChevronRight className="ml-1 h-4 w-4" />
              </PaymentButton>
            </article>

            {/* PRO */}
            <article className="relative w-full max-w-xs rounded-xl border-2 border-primary dark:border-amber-500/50 bg-primary dark:bg-zinc-950 p-7 dark:shadow-[0_0_30px_-5px_rgba(245,158,11,0.25)] transition-all hover:dark:shadow-[0_0_40px_-5px_rgba(245,158,11,0.4)] dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-zinc-900 dark:to-zinc-950">

              <Badge className="absolute -top-3 right-4 bg-background dark:bg-amber-500 font-mono text-[11px] text-foreground dark:text-zinc-950 hover:bg-background dark:hover:bg-amber-400 font-bold border border-border dark:border-amber-500">
                Most popular
              </Badge>
              <Badge
                variant="outline"
                className="border-[#faf8f3]/40 dark:border-amber-500/40 bg-transparent font-mono text-primary-foreground dark:text-amber-500 hover:bg-transparent"
              >
                Pro
              </Badge>
              <div className="mt-5 flex items-end gap-2">
                <p className="font-mono text-[36px] leading-none text-primary-foreground dark:text-white">₹299</p>
                <p className="pb-1 text-sm text-primary-foreground/70 dark:text-zinc-400">/month</p>
              </div>
              <p className="mt-1 font-mono text-xs text-muted-foreground/70 dark:text-zinc-500">~$2.4 · less than a coffee</p>
              <Separator className="my-5 bg-background/20 dark:bg-zinc-800" />
              <ul className="space-y-2.5">
                {[
                  "Unlimited solves",
                  "Everything in Basic",
                  "Full solve history",
                  "Pattern flashcards",
                  "6 Custom AI Mock Interviews",
                  "4 Weekly Sunday Gauntlets",
                  "Priority support (anubhav@patternflowdsa.in)",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground/70 dark:text-zinc-300">
                    <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-primary-foreground dark:text-amber-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <PaymentButton
                plan="pro"
                className="mt-6 w-full bg-background dark:bg-amber-500 font-mono font-bold text-sm text-foreground dark:text-zinc-950 hover:bg-muted dark:hover:bg-amber-400"
              >
                Get Pro
                <ChevronRight className="ml-1 h-4 w-4" />
              </PaymentButton>
            </article>

          </div>
        </motion.div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-[#fcf8f3] dark:bg-black py-12 md:py-16 border-y border-[#f0e6d2] dark:border-zinc-900 transition-colors duration-300">
        <div className="mx-auto max-w-3xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mt-2 font-mono text-3xl text-foreground dark:text-white md:text-[32px]">Common questions</h2>
            <p className="mt-2 text-base text-muted-foreground dark:text-zinc-400">Things people usually ask before trying.</p>
          </motion.div>

          <div className="mt-12 flex flex-col divide-y divide-[#e8e2d9] dark:divide-zinc-800 border-y border-[#e8e2d9] dark:border-zinc-800">
            {[
              {
                q: "How is this different from just using AI Platform?",
                a: "That gives you the answer. PatternFlow teaches you to think. We use a structured Socratic method — Think First prompts, progressive hints, quick-check quizzes — designed so you actually learn the pattern, not just copy-paste a solution.",
              },
              {
                q: "What patterns does PatternFlow detect?",
                a: "25+ core algorithm patterns including Sliding Window, Two Pointers, Binary Search, BFS/DFS, Dynamic Programming, Greedy, Backtracking, Union-Find, Topological Sort, Monotonic Stack, and more. The AI identifies the best-fit pattern for each problem.",
              },
              {
                q: "Do I need to sign up to use it?",
                a: "Yes. for testing you get 3 free solves per day after signup. Just paste a problem and go.",
              },
              {
                q: "What kind of problems can I paste?",
                a: "Anything — full LeetCode problem pages, GeeksforGeeks questions, raw problem text, even screenshots of a problem statement. We extract and understand the problem from whatever you give us.",
              },
              {
                q: "Is this useful for interview prep?",
                a: "Absolutely. The Interview Mode gives you timed practice under real conditions. Interview recognition tips teach you to spot patterns from problem descriptions — the exact skill interviewers test for.",
              },
              {
                q: "Can I cancel my subscription anytime?",
                a: "Yes, no lock-in. Your plan just won't renew next month. You keep access until the current billing period ends.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <FaqItem question={item.q} answer={item.a} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-6 py-12">
          {/* ... existing footer code ... */}
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Image src={iconPng} alt="PatternFlow Icon" width={24} height={24} className="rounded-sm object-contain" />
                <span className="font-mono text-lg font-bold text-foreground">PatternFlow</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                AI-powered DSA pattern trainer. Stop memorizing solutions — start building intuition that lasts.
              </p>
              <div className="flex items-center gap-3 mt-5">
                <a
                  href="https://x.com/Dev_code_04"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-mono text-muted-foreground hover:border-primary hover:text-foreground transition-all"
                >
                  <X className="h-3.5 w-3.5" />
                  Twitter / X
                </a>
              </div>
            </div>
            <div>
              <p className="font-mono text-xs text-muted-foreground/70 mb-4 uppercase tracking-wider">Product</p>
              <ul className="space-y-3">
                {[
                  { label: "Solve a problem", href: "/solve" },
                  { label: "How it works", href: "/#how-it-works" },
                  { label: "Pricing", href: "/#pricing" },
                  { label: "Dashboard", href: "/dashboard" },
                ].map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-xs text-muted-foreground/70 mb-4 uppercase tracking-wider">Legal</p>
              <ul className="space-y-3">
                {[
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms of Service", href: "/terms" },
                  { label: "Refund Policy", href: "/refund" },
                ].map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="py-5">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 text-left group"
      >
        <h3 className="font-mono text-sm font-medium text-foreground dark:text-white transition-colors group-hover:text-amber-600 dark:group-hover:text-amber-400">{question}</h3>
        <motion.div animate={{ rotate: open ? 180 : 0 }}>
          <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground dark:text-zinc-500 transition-colors group-hover:text-amber-600 dark:group-hover:text-amber-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground dark:text-zinc-400">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FloatingPatternBlock() {
  return (
    <motion.div
      animate={{ y: [0, -20, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="hidden xl:block absolute right-8 2xl:right-24 top-[15%] w-[260px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-black/60 backdrop-blur-md p-5 shadow-2xl shadow-amber-500/5 text-left z-0 pointer-events-none"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">AI Analysis</span>
      </div>
      
      {/* Skeleton of a LeetCode problem */}
      <div className="space-y-3 mb-6 opacity-60">
        <div className="h-2 w-1/3 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
        <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full" />
        <div className="h-1.5 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
        <div className="h-1.5 w-4/5 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
      </div>

      <div className="relative">
        <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg blur-sm" />
        <div className="relative rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50/80 dark:bg-amber-900/20 p-3 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400">Extracted Pattern</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="font-mono text-sm font-bold text-foreground">Two Pointers</p>
        </div>
      </div>
    </motion.div>
  );
}

function FloatingTreeBlock() {
  return (
    <motion.div
      animate={{ y: [0, 20, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      className="hidden xl:flex absolute left-8 2xl:left-24 top-[35%] flex-col items-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-black/60 backdrop-blur-md p-6 shadow-2xl shadow-amber-500/5 z-0 pointer-events-none"
    >
      <div className="font-mono text-[10px] text-muted-foreground mb-3 uppercase tracking-widest">Binary Tree</div>
      <div className="h-10 w-10 rounded-full border-2 border-amber-500 bg-amber-500/10 flex items-center justify-center font-mono text-sm font-bold text-foreground">5</div>
      <div className="flex gap-6 mt-4 relative">
        <svg className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-16 h-8 -z-10 overflow-visible">
          <path d="M 32 0 L 0 20" stroke="currentColor" strokeWidth="1.5" className="text-zinc-300 dark:text-zinc-700" fill="none" />
          <path d="M 32 0 L 64 20" stroke="currentColor" strokeWidth="1.5" className="text-zinc-300 dark:text-zinc-700" fill="none" />
        </svg>
        <div className="h-10 w-10 rounded-full border-2 border-border bg-background flex items-center justify-center font-mono text-sm text-muted-foreground">3</div>
        <div className="h-10 w-10 rounded-full border-2 border-border bg-background flex items-center justify-center font-mono text-sm text-muted-foreground">8</div>
      </div>
    </motion.div>
  );
}