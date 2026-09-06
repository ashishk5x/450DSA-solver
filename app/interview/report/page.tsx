"use client"

import { useEffect, useState, Suspense, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { ArrowLeft, Loader2, Target, Trophy, AlertTriangle, TrendingUp, CheckCircle, XCircle, Sparkles } from "lucide-react"
import Link from "next/link"
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Code2 } from "lucide-react"

type ReportData = {
  hire_probability: number
  feedback_summary: string
  strengths: string[]
  weaknesses: string[]
  action_plan: string
  optimal_code_language?: string
  optimal_solution_code?: string
}

function ReportContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get("id")
  
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [pattern, setPattern] = useState("")
  const hasRequestedRef = useRef(false)

  useEffect(() => {
    const fetchOrGenerateReport = async () => {
      try {
        // If we have an ID, fetch from DB
        if (id) {
          const res = await fetch(`/api/interview/report?id=${id}`)
          if (!res.ok) throw new Error("Failed to load past report")
          const data = await res.json()
          setPattern(data.pattern)
          setReport(data)
          return // Done
        }

        // Guard against React Strict Mode double-fetching
        if (hasRequestedRef.current) return
        hasRequestedRef.current = true

        // Otherwise generate a new one
        const storedTranscript = localStorage.getItem("mock_interview_transcript")
        const storedPattern = localStorage.getItem("mock_interview_pattern") || "Data Structures"
        const storedCode = localStorage.getItem("mock_interview_code") || ""
        const storedLanguage = localStorage.getItem("mock_interview_language") || "python"
        
        setPattern(storedPattern)

        if (!storedTranscript) {
          setError("No interview transcript found.")
          setLoading(false)
          return
        }

        const transcript = JSON.parse(storedTranscript)

        const res = await fetch("/api/interview/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            pattern: storedPattern, 
            transcript,
            code: storedCode,
            language: storedLanguage
          })
        })

        if (!res.ok) throw new Error("Failed to generate report")
        
        const data = await res.json()
        setReport(data)
        
        // Trigger confetti if score is decent
        if (data.hire_probability >= 70) {
          setTimeout(() => {
            confetti({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#f59e0b', '#f97316', '#22c55e'] // Amber, Orange, Green
            })
          }, 500)
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
        // Clean up
        localStorage.removeItem("mock_interview_transcript")
        localStorage.removeItem("mock_interview_pattern")
        localStorage.removeItem("mock_interview_code")
        localStorage.removeItem("mock_interview_language")
      }
    }

    fetchOrGenerateReport()
  }, [id])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] flex flex-col transition-colors duration-500">
      <Navbar />
      
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 pt-28 sm:px-6 sm:pt-32">
        
        <div className="flex items-center mb-10">
          <Link href="/dashboard" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative flex h-24 w-24 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-muted border-t-amber-600 animate-spin" />
              <Target size={32} className="text-amber-600 animate-pulse" />
            </div>
            <h2 className="mt-8 text-2xl font-black">Generating Report Card...</h2>
            <p className="text-muted-foreground mt-2">Analyzing your communication and logic.</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
            <p className="text-muted-foreground">{error}</p>
            <Link href="/dashboard" className="mt-8 inline-block rounded-full bg-foreground px-8 py-3 text-background font-bold">
              Return Home
            </Link>
          </div>
        ) : report ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            
            {/* Header section */}
            <motion.div variants={itemVariants} className="text-center max-w-2xl mx-auto mb-12 relative">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/10 dark:bg-amber-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />
              <h1 className="text-5xl font-black tracking-tight mb-4 dark:text-white">Interview Results</h1>
              <p className="text-xl text-muted-foreground">Pattern: <span className="font-bold text-foreground dark:text-amber-400">{pattern}</span></p>
            </motion.div>

            {/* Score & Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Score Card */}
              <motion.div variants={itemVariants} className="col-span-1 bg-background border border-border rounded-xl p-6 relative shadow-sm overflow-hidden flex flex-col justify-between h-full">
                {/* Ambient background glow based on score */}
                <div className={`absolute -top-20 -right-20 w-48 h-48 rounded-full blur-[60px] opacity-10 pointer-events-none ${report.hire_probability >= 70 ? 'bg-green-500' : report.hire_probability >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} />

                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-1">
                    <Target size={16} /> Hire Probability
                  </h3>
                  <p className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-widest">FAANG Standard Evaluation</p>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center py-8">
                  <div className="h-44 w-44 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart 
                        cx="50%" cy="50%" 
                        innerRadius="75%" outerRadius="100%" 
                        barSize={14} 
                        data={[{ name: "Score", value: report.hire_probability, fill: report.hire_probability >= 70 ? '#22c55e' : report.hire_probability >= 40 ? '#f59e0b' : '#ef4444' }]}
                        startAngle={90} endAngle={-270}
                      >
                        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                        <RadialBar dataKey="value" cornerRadius={10} background={{ fill: 'rgba(150, 150, 150, 0.1)' }} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center drop-shadow-sm">
                      <span className="text-5xl font-black tracking-tighter">{report.hire_probability}%</span>
                    </div>
                  </div>
                </div>
                
                <div className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-bold text-sm border ${report.hire_probability >= 70 ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-500' : report.hire_probability >= 40 ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-500' : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-500'}`}>
                  {report.hire_probability >= 70 ? <CheckCircle size={16} /> : report.hire_probability >= 40 ? <AlertTriangle size={16} /> : <XCircle size={16} />}
                  {report.hire_probability >= 70 ? "Strong Performance" : report.hire_probability >= 40 ? "Needs Practice" : "Not Ready"}
                </div>
              </motion.div>

              {/* Summary & Action Plan */}
              <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 space-y-6">
                <div className="bg-background border border-border rounded-xl p-8 md:p-10 shadow-sm h-full flex flex-col justify-between">
                  <div>
                    <h3 className="flex items-center gap-3 text-xl font-bold mb-4">
                      <Sparkles className="text-amber-500" size={24} />
                      Manager&apos;s Feedback & Communication Evaluation
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-lg mb-8">
                      {report.feedback_summary}
                    </p>
                  </div>
                  
                  <div className="bg-muted border border-border rounded-lg p-6">
                    <h4 className="flex items-center gap-2 font-bold mb-2">
                      <TrendingUp size={18} className="text-amber-600" />
                      Action Plan
                    </h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {report.action_plan}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Strengths and Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div variants={itemVariants} className="bg-background border border-border rounded-xl p-8 shadow-sm">
                <h3 className="flex items-center gap-2 text-xl font-bold mb-6 text-green-600 dark:text-green-500">
                  <Trophy size={24} />
                  What you did well
                </h3>
                <ul className="space-y-4">
                  {report.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle size={18} className="text-green-500 mt-1 shrink-0" />
                      <span className="text-sm text-muted-foreground leading-relaxed">{strength}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-background border border-border rounded-xl p-8 shadow-sm">
                <h3 className="flex items-center gap-2 text-xl font-bold mb-6 text-red-600 dark:text-red-500">
                  <AlertTriangle size={24} />
                  What you are missing & Need to know
                </h3>
                <ul className="space-y-4">
                  {report.weaknesses.map((weakness, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <XCircle size={18} className="text-red-500 mt-1 shrink-0" />
                      <span className="text-sm text-muted-foreground leading-relaxed">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Optimal Code Solution */}
            {report.optimal_solution_code && (
              <motion.div variants={itemVariants} className="bg-[#1e1e1e] border border-border rounded-xl shadow-2xl overflow-hidden mt-8 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
                <div className="bg-black/40 px-6 py-4 border-b border-white/10 flex items-center gap-3 relative z-10">
                  <Code2 className="text-amber-500" size={24} />
                  <div>
                    <h3 className="text-lg font-bold text-white">The Optimal Solution</h3>
                    <p className="text-xs text-white/50">Perfectly crafted code for the specific scenario you were asked</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                     <span className="text-xs font-mono font-bold bg-white/10 text-white/80 px-3 py-1.5 rounded-md border border-white/10 uppercase tracking-wider">
                       {report.optimal_code_language || "python"}
                     </span>
                  </div>
                </div>
                <div className="p-0 overflow-x-auto text-[15px] relative z-10">
                  <SyntaxHighlighter 
                    language={(report.optimal_code_language || 'python').toLowerCase()} 
                    style={vscDarkPlus}
                    customStyle={{ margin: 0, padding: '2rem', background: 'transparent' }}
                  >
                    {report.optimal_solution_code}
                  </SyntaxHighlighter>
                </div>
              </motion.div>
            )}

          </motion.div>
        ) : null}
      </main>
    </div>
  )
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] flex items-center justify-center"><Loader2 size={32} className="animate-spin text-amber-500" /></div>}>
      <ReportContent />
    </Suspense>
  )
}
