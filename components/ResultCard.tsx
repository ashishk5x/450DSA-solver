"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ConfidenceRating } from "@/components/ConfidenceRating"
import {
  Brain, Lightbulb, Eye, BookOpen, Clock,
  Target, Layers, GraduationCap, ChevronDown, HelpCircle, X,
  Timer, CheckCircle, XCircle, Send, Loader2, SkipForward,
  Volume2, VolumeX
} from "lucide-react"
import { analytics } from "@/lib/posthog-events"

export type SolveResult = {
  problem_summary: string
  difficulty: string
  pattern_name: string
  thinking_prompt: string
  hints: string[]
  pattern_reveal: {
    name: string
    why: string
    intuition: string
  }
  thinking_steps: string[]
  missing_concepts: {
    concept: string
    why_needed: string
    learn_query: string
  }[]
  memory_hook: string
  interview_recognition: string
  similar_problems: {
    name: string
    difficulty: string
    platform: string
    why_similar: string
  }[]
  solve_time: string
  quiz_questions?: {
    question: string
    expected_answer: string
  }[]
}

type ResultCardProps = {
  result: SolveResult
  plan?: "free" | "basic" | "pro"
  userId?: string | null
}

const headerClass = "mb-3 flex items-center gap-2"
const labelClass = "text-xs font-mono text-muted-foreground"

export function ResultCard({ result, plan = "free", userId }: ResultCardProps) {
  const isPaid = plan === "basic" || plan === "pro"

  // --- Existing state ---
  const [hintsUnlocked, setHintsUnlocked] = useState(0)
  const [showApproach, setShowApproach] = useState(false)
  const [showPattern, setShowPattern] = useState(false)
  const [showConcepts, setShowConcepts] = useState(false)
  const [userAnswer, setUserAnswer] = useState("")
  const [answerFeedback, setAnswerFeedback] = useState<"correct" | "wrong" | null>(null)
  const [showQuickCheck, setShowQuickCheck] = useState(false)
  const [currentFlashcard, setCurrentFlashcard] = useState(0)
  const [showFlashcards, setShowFlashcards] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  // --- Timer state ---
  const [timerActive, setTimerActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [timerStartedAt, setTimerStartedAt] = useState<number | null>(null)

  // --- Speech state ---
  const [speakingText, setSpeakingText] = useState<string | null>(null)

  const speakText = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    
    window.speechSynthesis.cancel()
    
    if (speakingText === text) {
      // Toggle off if clicking the same text's button
      setSpeakingText(null)
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95 // slightly slower for better comprehension
    
    // Try to pick a clearer, higher-quality English voice
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = 
      voices.find(v => v.name.includes("Google US English") || v.name.includes("Google UK English")) ||
      voices.find(v => v.name.includes("Samantha") || v.name.includes("Daniel") || v.name.includes("Karen")) ||
      voices.find(v => v.lang === "en-US" && v.name.includes("Premium")) ||
      voices.find(v => v.lang === "en-US") ||
      voices.find(v => v.lang.startsWith("en"))
      
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }
    
    utterance.onend = () => {
      setSpeakingText(null)
    }
    
    utterance.onerror = () => {
      setSpeakingText(null)
    }

    setSpeakingText(text)
    window.speechSynthesis.speak(utterance)
  }, [speakingText])

  // Stop speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Autoplay thinking prompt when ResultCard loads
  useEffect(() => {
    if (isPaid && result?.thinking_prompt) {
      speakText(result.thinking_prompt)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --- New Interview Flow state ---
  const [showTimerPrompt, setShowTimerPrompt] = useState(isPaid) // auto-show for paid users
  const [timerEnded, setTimerEnded] = useState(false)
  const [timerSkipped, setTimerSkipped] = useState(false)
  const [selfSolved, setSelfSolved] = useState<boolean | null>(null)

  // --- Quiz state (Phase 3) ---
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
  const [quizAnswer, setQuizAnswer] = useState("")
  const [quizFeedback, setQuizFeedback] = useState<{ correct: boolean; feedback: string } | null>(null)
  const [quizLoading, setQuizLoading] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)

  const diffColor =
    result.difficulty === "Easy" ? "text-green-600" :
    result.difficulty === "Hard" ? "text-red-500" :
    "text-amber-600"

  const flashcardQuestions = [
    {
      q: `When would you use ${result.pattern_reveal?.name || result.pattern_name}?`,
      a: result.pattern_reveal?.why || ""
    },
    {
      q: `What is the time complexity?`,
      a: result.solve_time || ""
    },
    {
      q: `What is the key insight for this problem?`,
      a: result.pattern_reveal?.intuition || ""
    },
    {
      q: `What signals in a problem suggest ${result.pattern_reveal?.name || result.pattern_name}?`,
      a: result.interview_recognition || "Look for patterns that require efficient lookups or traversals."
    },
    {
      q: `How would you remember this pattern in an interview?`,
      a: result.memory_hook || ""
    },
  ]

  const timeLimit = result.difficulty === "Easy" ? 10 : result.difficulty === "Hard" ? 35 : 20

  // --- Timer functions ---
  function startTimer() {
    setTimeLeft(timeLimit * 60)
    setTimerActive(true)
    setTimerStartedAt(Date.now())
    setShowTimerPrompt(false)
    setTimerEnded(false)
    setTimerSkipped(false)
  }

  const stopTimer = useCallback(() => {
    setTimerActive(false)
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  function skipTimer() {
    stopTimer()
    setTimeLeft(0)
    setTimerSkipped(true)
    setShowTimerPrompt(false)
    // Save that timer was skipped
    saveTimerResult(null, null, false)
  }

  // --- Save timer results ---
  const saveTimerResult = useCallback((solveTimeSeconds: number | null, solved: boolean | null, timerUsed: boolean) => {
    if (!userId) return
    fetch("/api/save-timer-result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        solveTimeSeconds: solveTimeSeconds,
        selfSolved: solved,
        timerUsed,
      }),
    }).catch(console.error)
  }, [userId])

  useEffect(() => {
    if (!timerActive || timeLeft <= 0) {
      if (timeLeft === 0 && timerActive) {
        // Timer just hit 0 — interview time is up
        setTimerActive(false)
        setTimerEnded(true)
        // Calculate solve time
        const elapsed = timerStartedAt ? Math.round((Date.now() - timerStartedAt) / 1000) : timeLimit * 60
        saveTimerResult(elapsed, null, true)
      }
      return
    }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [timerActive, timeLeft, timerStartedAt, timeLimit, stopTimer, saveTimerResult])

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, "0")}`
  }



  // --- Self-assessment handlers ---
  function handleSolvedYes() {
    setSelfSolved(true)
    const elapsed = timerStartedAt ? Math.round((Date.now() - timerStartedAt) / 1000) : null
    saveTimerResult(elapsed, true, true)
  }

  function handleSolvedNo() {
    setSelfSolved(false)
    saveTimerResult(
      timerStartedAt ? Math.round((Date.now() - timerStartedAt) / 1000) : null,
      false,
      true
    )
  }

  // --- "I finished early" handler ---
  function handleFinishedEarly() {
    stopTimer()
    setTimerEnded(true)
    const elapsed = timerStartedAt ? Math.round((Date.now() - timerStartedAt) / 1000) : null
    saveTimerResult(elapsed, null, true)
  }

  // --- Quick check answer ---
  function checkAnswer() {
    const ans = userAnswer.toLowerCase()
    const goodSignals = [
      "because", "since", "allows", "faster", "efficient",
      "store", "check", "find", "track", "avoid", "reduce",
      "o(1)", "o(n)", "o(log", "constant", "linear", "lookup",
      "search", "access", "insert", "space", "time", "complexity"
    ]
    const hasGoodReasoning = goodSignals.some(w => ans.includes(w))
    const hasLength = userAnswer.trim().split(" ").length >= 8
    setAnswerFeedback(hasGoodReasoning && hasLength ? "correct" : "wrong")
  }

  // --- AI Quiz evaluation (Phase 3) ---
  async function evaluateQuizAnswer() {
    if (!result.quiz_questions || !result.quiz_questions[currentQuizIndex]) return
    setQuizLoading(true)
    setQuizFeedback(null)

    try {
      const q = result.quiz_questions[currentQuizIndex]
      const res = await fetch("/api/evaluate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userId}`,
        },
        body: JSON.stringify({
          question: q.question,
          userAnswer: quizAnswer,
          expectedAnswer: q.expected_answer,
          patternName: result.pattern_reveal?.name || result.pattern_name,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setQuizFeedback({ correct: data.correct, feedback: data.feedback })
      } else {
        setQuizFeedback({ correct: false, feedback: data.error || "Could not evaluate. Try again." })
      }
    } catch {
      setQuizFeedback({ correct: false, feedback: "Network error. Try again." })
    } finally {
      setQuizLoading(false)
    }
  }

  function nextQuizQuestion() {
    if (!result.quiz_questions) return
    if (currentQuizIndex < result.quiz_questions.length - 1) {
      setCurrentQuizIndex(i => i + 1)
      setQuizAnswer("")
      setQuizFeedback(null)
    } else {
      setQuizCompleted(true)
    }
  }

  const timerColor = timeLeft < 60 ? "text-red-500" : timeLeft < 180 ? "text-amber-600" : "text-foreground"
  const timerBorder = timeLeft < 60 ? "border-red-200 bg-red-50" : timeLeft < 180 ? "border-amber-200 bg-amber-50" : "border-border bg-card"

  // Whether hints should be locked (timer is active)
  const hintsLocked = timerActive

  return (
    <>
      {/* Floating Sticky Timer */}
      {timerActive && (
        <div className={`fixed top-16 right-3 sm:right-6 z-50 border rounded-xl shadow-md p-3 flex items-center gap-2 sm:gap-3 transition-all ${timerBorder}`}
          style={{ minWidth: 0 }}
        >
          <Clock size={13} className={`flex-shrink-0 ${timerColor}`} />
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-mono text-muted-foreground leading-none mb-0.5 hidden sm:block">
              interview mode
            </span>
            <span className={`font-mono font-bold leading-none ${timerColor} text-base sm:text-xl`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <button
            onClick={handleFinishedEarly}
            className="flex-shrink-0 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors underline hidden sm:block"
          >
            Done
          </button>
          <button
            onClick={stopTimer}
            className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Stop timer"
          >
            <X size={12} />
          </button>
        </div>
      )}

      <section className="mt-10 space-y-5">

        {/* 1. Problem Summary */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className={headerClass}>
            <HelpCircle size={16} className="text-muted-foreground" />
            <span className={labelClass}>{"// problem understood"}</span>
            <span className={`ml-auto text-xs font-mono font-bold ${diffColor}`}>
              {result.difficulty}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-foreground">{result.problem_summary}</p>
        </div>

        {/* 2. Interview Timer Prompt (Paid users — auto-shown) */}
        {isPaid && showTimerPrompt && !timerActive && !timerEnded && !timerSkipped && (
          <div className="rounded-xl border-2 border-primary bg-primary p-6 text-primary-foreground">
            <div className={headerClass}>
              <Timer size={16} className="text-amber-400" />
              <span className="text-xs font-mono font-bold text-amber-400">{"// interview simulation"}</span>
            </div>
            <p className="text-sm leading-relaxed mb-1">
              Want to practice this under <span className="font-bold text-amber-400">real interview conditions</span>?
            </p>
            <p className="text-xs text-muted-foreground mb-5">
              Timer starts, hints are locked. See how you do under pressure.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                className="flex-1 bg-background text-foreground hover:bg-card font-mono text-sm font-bold"
                onClick={startTimer}
              >
                <Clock size={14} className="mr-2" />
                Start Timer ({timeLimit} min)
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-[#a89f96]/30 text-muted-foreground hover:text-primary-foreground hover:border-[#faf8f3] font-mono text-sm"
                onClick={skipTimer}
              >
                <SkipForward size={14} className="mr-2" />
                Skip — show breakdown
              </Button>
            </div>
          </div>
        )}

        {/* Interview Mode section for free users (paywall) */}
        {plan === "free" && (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className={headerClass}>
              <Timer size={16} className="text-muted-foreground" />
              <span className={labelClass}>{"// interview simulation"}</span>
            </div>
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                🔒 Practice under real interview conditions with timed challenges
              </p>
              <a href="/#pricing" className="text-xs font-mono text-foreground underline">
                Upgrade to Basic to unlock →
              </a>
            </div>
          </div>
        )}

        {/* 3. Think First */}
        <div className="rounded-xl border-2 border-primary bg-background p-6">
          <div className={headerClass}>
            <Brain size={16} className="text-foreground" />
            <span className="text-xs font-mono text-foreground font-bold">{"// think first"}</span>
            {isPaid && (
              <button 
                onClick={() => speakText(result.thinking_prompt)}
                className="ml-auto flex items-center justify-center w-6 h-6 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title={speakingText === result.thinking_prompt ? "Stop audio" : "Listen to prompt"}
              >
                {speakingText === result.thinking_prompt ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
            )}
          </div>
          <p className="text-foreground text-sm leading-relaxed font-medium mb-2">
            Before looking at hints — ask yourself:
          </p>
          <p className="text-foreground text-base leading-relaxed italic border-l-2 border-primary pl-4">
            {result.thinking_prompt}
          </p>
          <p className="text-xs text-muted-foreground font-mono mt-4">
            {timerActive
              ? `⏱ ${formatTime(timeLeft)} remaining — try to solve it before time runs out.`
              : "Try to think for 5-10 minutes. Then use hints below if stuck."}
          </p>
        </div>

        {/* 4. Progressive Hints (LOCKED during timer) */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className={headerClass}>
            <Lightbulb size={16} className="text-muted-foreground" />
            <span className={labelClass}>{"// hints (reveal one at a time)"}</span>
            {hintsLocked && (
              <span className="ml-auto text-[10px] font-mono text-amber-600 flex items-center gap-1">
                <Clock size={10} /> locked during timer
              </span>
            )}
          </div>

          {hintsLocked ? (
            // Hints locked during interview mode
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-center">
              <p className="text-sm text-amber-800 font-medium mb-1">
                ⏱ Hints are locked during interview mode
              </p>
              <p className="text-xs text-amber-600">
                Try solving the problem first. Hints will unlock when the timer ends.
              </p>
              <button
                onClick={handleFinishedEarly}
                className="mt-3 text-xs font-mono text-amber-800 underline hover:text-amber-900"
              >
                I finished — stop the timer
              </button>
            </div>
          ) : (
            // Normal hint reveal flow
            <>
              <div className="space-y-3">
                {result.hints.map((hint, i) => {
                  const isLocked = !isPaid && i>=2
                  if (isLocked && i <= hintsUnlocked) {
                    return (
                      <div key={i} className="rounded-lg bg-muted p-3 text-center">
                        <p className="text-xs text-muted-foreground mb-2">🔒 Hint {i + 1} locked</p>
                        <a 
                          href="/#pricing" 
                          className="text-xs font-mono text-foreground underline"
                          onClick={() => analytics.trackPaywallShown(`hint_${i + 1}`)}
                        >
                          Unlock next insight →
                        </a>
                      </div>
                    )
                  }
                  return(
                    <div key={i}>
                      {i < hintsUnlocked ? (
                        <div className="rounded-lg bg-muted p-3 border-l-2 border-primary">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-mono text-muted-foreground block">
                              hint {i + 1}
                            </span>
                            {isPaid && (
                              <button 
                                onClick={() => speakText(hint)}
                                className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
                                title={speakingText === hint ? "Stop audio" : "Listen to hint"}
                              >
                                {speakingText === hint ? <VolumeX size={14} /> : <Volume2 size={14} />}
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-foreground leading-relaxed">{hint}</p>
                        </div>
                      ) : i === hintsUnlocked ? (
                        <Button
                          variant="outline"
                          className="w-full border-dashed border-input text-muted-foreground hover:border-primary hover:text-foreground text-sm"
                          onClick={() => {
                            setHintsUnlocked(i + 1)
                            analytics.trackHintUnlocked(i + 1)
                            if (isPaid && result.hints[i]) {
                              speakText(result.hints[i])
                            }
                          }}
                        >
                          <Lightbulb size={14} className="mr-2" />
                          {i === 0 ? "Show hint" : "Show next hint"}
                        </Button>
                      ) : null}
                    </div>
                )})} 
              </div>

              {/* Free Paywall — after hint 2 */}
              {!isPaid && hintsUnlocked >= 2 && (
                <div className="mt-4 rounded-xl border-2 border-primary bg-background p-5 text-center">
                  <p className="text-xs font-mono text-muted-foreground mb-2">
                    2 hints used • You&apos;re close
                  </p>
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mx-auto mb-3">
                    <Lightbulb size={16} className="text-primary-foreground" />
                  </div>
                  <p className="font-mono text-sm font-bold text-foreground mb-1">
                      You&apos;re one insight away from solving this.
                  </p>
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                    Unlock how top candidates recognize this pattern instantly.
                  </p>
                  <div className="text-xs text-muted-foreground mb-4 space-y-1">
                    <p>• Final hint to unblock you</p>
                    <p>• Pattern breakdown + intuition</p>
                    <p>• Memory trick for interviews</p>
                    <p>• Similar problems to practice</p>
                  </div>
                  <a
                    href="/#pricing"
                    className="inline-block bg-primary text-primary-foreground font-mono text-sm px-5 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                    onClick={() => analytics.trackPaywallShown('progressive_hints')}
                  >
                    Unlock pattern →
                  </a>
                </div>
              )}

              {isPaid && hintsUnlocked >= 3 && !showApproach && (
                <div className="mt-4 space-y-3">
                  {!showQuickCheck ? (
                    <Button
                      variant="outline"
                      className="w-full border-primary text-foreground hover:bg-muted text-sm font-mono"
                      onClick={() => setShowQuickCheck(true)}
                    >
                      ✦ Test your understanding before the answer
                    </Button>
                  ) : (
                    <div className="rounded-xl border-2 border-primary bg-background p-4">
                      <p className="text-xs font-mono text-muted-foreground mb-1">{"// quick check"}</p>
                      <p className="text-sm font-medium text-foreground mb-3">
                        Explain in your own words — why does this problem need an efficient lookup? What happens if you don&apos;t have one?
                      </p>
                      {answerFeedback === null && (
                        <>
                          <textarea
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder="Write your answer here... (2-3 sentences is enough)"
                            className="w-full min-h-[80px] bg-card border border-border rounded-lg p-3 text-sm font-mono text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none mb-3"
                          />
                          <Button
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
                            disabled={userAnswer.trim().split(" ").length < 4}
                            onClick={checkAnswer}
                          >
                            Check my answer
                          </Button>
                        </>
                      )}
                      {answerFeedback === "correct" && (
                        <div className="space-y-3">
                          <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                            <p className="text-sm font-medium text-green-800 mb-1">✓ Good thinking!</p>
                            <p className="text-xs text-green-700 leading-relaxed">
                              You explained your reasoning clearly. That&apos;s exactly the skill interviewers look for.
                            </p>
                          </div>
                          <Button
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
                            onClick={() => { setShowApproach(true); setShowPattern(true) }}
                          >
                            <Eye size={14} className="mr-2" />
                            See the full approach
                          </Button>
                        </div>
                      )}
                      {answerFeedback === "wrong" && (
                        <div className="space-y-3">
                          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                            <p className="text-sm font-medium text-amber-800 mb-1">Almost — think deeper</p>
                            <p className="text-xs text-amber-700 leading-relaxed">
                              Think about time complexity — what happens without an efficient lookup?
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            className="w-full border-border text-muted-foreground text-sm"
                            onClick={() => { setUserAnswer(""); setAnswerFeedback(null) }}
                          >
                            Try again
                          </Button>
                          <Button
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
                            onClick={() => { setShowApproach(true); setShowPattern(true) }}
                          >
                            <Eye size={14} className="mr-2" />
                            Show me anyway
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  {!showQuickCheck && (
                    <Button
                      variant="outline"
                      className="w-full border-dashed border-input text-muted-foreground hover:border-primary hover:text-muted-foreground text-sm"
                      onClick={() => { setShowApproach(true); setShowPattern(true) }}
                    >
                      I give up — just show me
                    </Button>
                  )}
                </div>
              )}

              {hintsUnlocked === 0 && (
                <p className="text-xs text-muted-foreground font-mono mt-3 text-center">
                  Try solving first — hints are here when you need them
                </p>
              )}
            </>
          )}
        </div>

        {/* 5. "Did You Solve It?" — appears after timer ends */}
        {timerEnded && selfSolved === null && (
          <div className="rounded-xl border-2 border-primary bg-background p-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className={headerClass}>
              <Target size={16} className="text-foreground" />
              <span className="text-xs font-mono text-foreground font-bold">{"// time's up — how did you do?"}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              Were you able to solve the problem during the timed challenge?
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                className="flex-1 bg-green-600 text-white hover:bg-green-700 font-mono text-sm"
                onClick={handleSolvedYes}
              >
                <CheckCircle size={14} className="mr-2" />
                Yes, I solved it!
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-border text-muted-foreground hover:border-primary hover:text-foreground font-mono text-sm"
                onClick={handleSolvedNo}
              >
                <XCircle size={14} className="mr-2" />
                No, I need help
              </Button>
            </div>
          </div>
        )}

        {/* 6. AI Quiz — appears if user solved it AND is Pro AND quiz questions exist */}
        {selfSolved === true && plan === "pro" && result.quiz_questions && result.quiz_questions.length > 0 && !quizCompleted && (
          <div className="rounded-xl border-2 border-amber-200 bg-amber-50/50 p-6">
            <div className={headerClass}>
              <GraduationCap size={16} className="text-amber-600" />
              <span className="text-xs font-mono text-amber-600 font-bold">{"// verify your understanding"}</span>
              <span className="ml-auto text-[10px] font-mono text-amber-500">
                {currentQuizIndex + 1}/{result.quiz_questions.length}
              </span>
            </div>
            <p className="text-sm font-medium text-foreground mb-4">
              {result.quiz_questions[currentQuizIndex].question}
            </p>

            {quizFeedback === null ? (
              <>
                <textarea
                  value={quizAnswer}
                  onChange={(e) => setQuizAnswer(e.target.value)}
                  placeholder="Type your answer... (be specific)"
                  className="w-full min-h-[80px] bg-card border border-amber-200 rounded-lg p-3 text-sm font-mono text-foreground placeholder:text-muted-foreground outline-none focus:border-amber-400 resize-none mb-3"
                />
                <Button
                  className="w-full bg-amber-600 text-white hover:bg-amber-700 text-sm font-mono"
                  disabled={quizAnswer.trim().split(" ").length < 3 || quizLoading}
                  onClick={evaluateQuizAnswer}
                >
                  {quizLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      Evaluating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send size={14} />
                      Check Answer
                    </span>
                  )}
                </Button>
              </>
            ) : (
              <div className="space-y-3">
                <div className={`rounded-lg border p-3 ${
                  quizFeedback.correct
                    ? "bg-green-50 border-green-200"
                    : "bg-amber-50 border-amber-200"
                }`}>
                  <p className={`text-sm font-medium mb-1 ${
                    quizFeedback.correct ? "text-green-800" : "text-amber-800"
                  }`}>
                    {quizFeedback.correct ? "✓ Correct!" : "✗ Not quite"}
                  </p>
                  <p className={`text-xs leading-relaxed ${
                    quizFeedback.correct ? "text-green-700" : "text-amber-700"
                  }`}>
                    {quizFeedback.feedback}
                  </p>
                </div>
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-mono"
                  onClick={nextQuizQuestion}
                >
                  {currentQuizIndex < (result.quiz_questions?.length || 1) - 1
                    ? "Next Question →"
                    : "See Full Breakdown →"}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Quiz completed OR solved=yes for non-Pro → reveal pattern */}
        {selfSolved === true && (quizCompleted || plan !== "pro" || !result.quiz_questions?.length) && !showPattern && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-center">
            <p className="text-sm font-medium text-green-800 mb-3">
              🎉 {quizCompleted ? "Quiz complete!" : "Great job solving it!"} Here&apos;s the full pattern breakdown:
            </p>
            {plan !== "pro" && result.quiz_questions && (
              <p className="text-xs text-muted-foreground mb-3">
                <a href="/#pricing" className="underline">Upgrade to Pro</a> for AI-evaluated quizzes after each solve.
              </p>
            )}
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-mono"
              onClick={() => { setShowApproach(true); setShowPattern(true) }}
            >
              <Eye size={14} className="mr-2" />
              Reveal Pattern & Approach
            </Button>
          </div>
        )}

        {/* Solved = No → gentle message and auto-reveal hints */}
        {selfSolved === false && !showPattern && (
          <div className="rounded-xl border border-border bg-card p-5 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              No worries — that&apos;s how you learn. Use the hints above to work through it, or reveal the full approach:
            </p>
            <Button
              variant="outline"
              className="border-primary text-foreground hover:bg-muted text-sm font-mono"
              onClick={() => { setShowApproach(true); setShowPattern(true) }}
            >
              <Eye size={14} className="mr-2" />
              Show me the approach
            </Button>
          </div>
        )}

        {/* Pattern Reveal */}
        {showPattern && (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className={headerClass}>
              <Brain size={16} className="text-muted-foreground" />
              <span className={labelClass}>{"// pattern"}</span>
            </div>
            <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-start">
              <div className="rounded-lg bg-muted px-4 py-3 text-center sm:min-w-[140px]">
                <p className="font-mono text-lg font-bold text-foreground">
                  { isPaid ? result.pattern_reveal.name : "🔒 Hidden Pattern"}
                </p>
              </div>
              {isPaid ? (
                <div>
                    <p className="text-sm leading-relaxed text-muted-foreground mb-2">
                      {result.pattern_reveal.why}
                    </p>
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-xs font-mono text-muted-foreground mb-1">the aha moment</p>
                      <p className="text-sm font-medium text-foreground">
                        {result.pattern_reveal.intuition}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground font-mono mb-2">why this pattern fits</p>
                    <div className="rounded-lg bg-muted p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-2">🔒 Full explanation locked</p>
                      <a href="/#pricing" className="text-xs font-mono text-foreground underline">
                        Upgrade to Basic →
                      </a>
                    </div>
                  </div>
                )}
              </div>
          </div>
        )}

        {/* Thinking Steps */}
        {showApproach && (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className={headerClass}>
              <BookOpen size={16} className="text-muted-foreground" />
              <span className={labelClass}>{"// how to think through this"}</span>
            </div>
            <p className="text-xs text-muted-foreground font-mono mb-4">
              No code — just the thinking process
            </p>
            <ol className="space-y-4">
              {result.thinking_steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Memory Hook */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className={headerClass}>
            <Target size={16} className="text-muted-foreground" />
            <span className={labelClass}>{"// memory hook"}</span>
          </div>
          {!isPaid ? (
            <div className="relative">
              <p className="text-sm font-medium italic leading-relaxed text-foreground blur-sm select-none">
                &quot;{result.memory_hook}&quot;
              </p>
              <div className="absolute inset-0 flex items-center justify-center">
                <a href="/#pricing" className="text-xs font-mono text-foreground bg-muted px-3 py-1.5 rounded-lg border border-border hover:border-primary">
                  🔒 Upgrade to read →
                </a>
              </div>
            </div>
          ) : (
            <div className="border-l-2 border-primary pl-4">
              <p className="text-sm font-medium italic leading-relaxed text-foreground">
                &quot;{result.memory_hook}&quot;
              </p>
            </div>
          )}
        </div>

        {/* Interview Recognition */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className={headerClass}>
            <GraduationCap size={16} className="text-muted-foreground" />
            <span className={labelClass}>{"// spot this in interviews"}</span>
          </div>
          {plan === "free" ? (
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                🔒 Learn how to spot this pattern during interviews
              </p>
              <a href="/#pricing" className="text-xs font-mono text-foreground underline">
                Upgrade to Basic to unlock →
              </a>
            </div>
          ) : (
            <div className="bg-muted rounded-lg p-3">
              <p className="text-sm leading-relaxed text-foreground">
                {result.interview_recognition}
              </p>
            </div>
          )}
          <div className="flex items-center gap-3 mt-4">
            <p className="text-xs font-mono text-muted-foreground">time to solve</p>
            <span className="text-xs font-mono bg-muted text-foreground px-2 py-1 rounded">
              {result.solve_time}
            </span>
          </div>
        </div>

        {/* Missing Concepts */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className={headerClass}>
            <HelpCircle size={16} className="text-muted-foreground" />
            <span className={labelClass}>{"// concepts you need to know first"}</span>
          </div>
          {!isPaid ? (
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                🔒 See what prerequisite concepts you&apos;re missing
              </p>
              <a href="/#pricing" className="text-xs font-mono text-foreground underline">
                Upgrade to Basic to unlock →
              </a>
            </div>
          ) : !showConcepts ? (
            <Button
              variant="outline"
              className="w-full border-border text-muted-foreground hover:border-primary hover:text-foreground"
              onClick={() => setShowConcepts(true)}
            >
              <ChevronDown size={14} className="mr-2" />
              What concepts am I missing?
            </Button>
          ) : (
            <div className="space-y-3">
              {(result.missing_concepts || []).map((c, i) => (
                <div key={i} className="rounded-lg border border-border p-3">
                  <p className="text-sm font-medium text-foreground mb-1">{c.concept}</p>
                  <p className="text-xs text-muted-foreground mb-2">{c.why_needed}</p>
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(c.learn_query)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-foreground underline hover:opacity-70"
                  >
                    Search: &quot;{c.learn_query}&quot; →
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Similar Problems */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className={headerClass}>
            <Layers size={16} className="text-muted-foreground" />
            <span className={labelClass}>{"// practice these next"}</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(result.similar_problems || []).map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  if (!isPaid) return
                  window.scrollTo({ top: 0, behavior: "smooth" })
                  window.dispatchEvent(
                    new CustomEvent("patternflow:send-to-solver", { detail: p.name })
                  )
                }}
                className={`group rounded-lg border border-border bg-background p-3 text-left transition-all
                  ${isPaid ? "hover:border-primary hover:bg-card cursor-pointer" : "cursor-default opacity-70"}`}
              >
                <p className="text-sm font-medium text-foreground">{p.name}</p>
                <div className="mt-1 flex items-center gap-2 mb-2">
                  <span className={`text-xs font-mono ${
                    p.difficulty === "Easy" ? "text-green-600" :
                    p.difficulty === "Hard" ? "text-red-500" : "text-amber-600"
                  }`}>{p.difficulty}</span>
                  <span className="text-xs text-muted-foreground">{p.platform}</span>
                </div>
                {isPaid ? (
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.why_similar}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">🔒 Upgrade to see why</p>
                )}
              </button>
            ))}
          </div>
          {!isPaid && (
            <div className="mt-3 rounded-lg bg-muted p-3 text-center">
              <p className="text-xs text-muted-foreground font-mono">
                Full details + click-to-solve locked for free users
              </p>
              <a href="/#pricing" className="text-xs text-foreground underline font-mono">
                Upgrade to Basic →
              </a>
            </div>
          )}
        </div>

        {/* Pattern Flashcards — Pro only */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className={headerClass}>
            <Lightbulb size={16} className="text-muted-foreground" />
            <span className={labelClass}>{"// memorize this pattern"}</span>
          </div>
          {plan !== "pro" ? (
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                🔒 Interactive flashcards to master this pattern
              </p>
              <a href="/#pricing" className="text-xs font-mono text-foreground underline">
                Upgrade to Pro to unlock →
              </a>
            </div>
          ) : !showFlashcards ? (
            <Button
              variant="outline"
              className="w-full border-border text-muted-foreground hover:border-primary hover:text-foreground"
              onClick={() => { setShowFlashcards(true); setCurrentFlashcard(0); setShowAnswer(false) }}
            >
              <ChevronDown size={14} className="mr-2" />
              Start flashcard drill
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-5 min-h-[140px]">
                <p className="text-xs font-mono text-muted-foreground mb-3">
                  Card {currentFlashcard + 1} of {flashcardQuestions.length}
                </p>
                <p className="text-sm font-medium text-foreground mb-4">
                  Q: {flashcardQuestions[currentFlashcard].q}
                </p>
                {!showAnswer ? (
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => setShowAnswer(true)}
                  >
                    See answer
                  </Button>
                ) : (
                  <div className="border-t border-input pt-3 mt-2">
                    <p className="text-xs font-mono text-muted-foreground mb-1">Answer:</p>
                    <p className="text-sm text-foreground leading-relaxed">
                      {flashcardQuestions[currentFlashcard].a}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentFlashcard === 0}
                  onClick={() => { setCurrentFlashcard(c => c - 1); setShowAnswer(false) }}
                >
                  ← Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentFlashcard === flashcardQuestions.length - 1}
                  onClick={() => { setCurrentFlashcard(c => c + 1); setShowAnswer(false) }}
                >
                  Next →
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setShowFlashcards(false); setCurrentFlashcard(0); setShowAnswer(false) }}
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Confidence Self-Rating */}
        <ConfidenceRating
          patternName={result.pattern_reveal?.name || result.pattern_name}
          onRate={async (confidence) => {
            if (!userId) return
            const res = await fetch("/api/update-confidence", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                confidence,
                userId,
                patternName: result.pattern_reveal?.name || result.pattern_name,
              }),
            })
            if (!res.ok) throw new Error("Failed to save confidence")
          }}
        />

      </section>
    </>
  )
}