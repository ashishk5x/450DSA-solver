"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { Mic, Brain, ArrowLeft, Loader2, StopCircle, Clock, BarChart, Sparkles } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import Editor from "@monaco-editor/react"
import { ALL_PATTERN_NAMES } from "@/lib/patterns"

type Message = {
  role: "user" | "assistant"
  content: string
}

export default function InterviewPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [pattern, setPattern] = useState(searchParams.get("pattern") || "General Data Structures")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isAiThinking, setIsAiThinking] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  
  const snippets = {
    python: 'def solve():\n    # Write your solution here\n    pass',
    javascript: 'function solve() {\n  // Write your solution here\n}',
    java: 'class Solution {\n    public void solve() {\n        // Write your solution here\n    }\n}',
    cpp: 'class Solution {\npublic:\n    void solve() {\n        // Write your solution here\n    }\n};'
  };

  // Code Editor State
  const [language, setLanguage] = useState("python")
  const [code, setCode] = useState(snippets.python)
  
  // Configuration State
  const [difficulty, setDifficulty] = useState("Medium")
  const [duration, setDuration] = useState(10)
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const transcriptRef = useRef("")
  const messagesRef = useRef<Message[]>([])

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, transcript])

  // Countdown Timer
  useEffect(() => {
    if (!interviewStarted) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [interviewStarted])

  // Auto-end interview when time runs out
  useEffect(() => {
    if (interviewStarted && timeLeft === 0) {
      endInterview()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewStarted, timeLeft])

  const startListening = () => {
    if (typeof window === "undefined") return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition. Please use Chrome.")
      return
    }

    window.speechSynthesis.cancel() // Stop AI if it's talking
    setIsSpeaking(false)
    setTranscript("")
    transcriptRef.current = ""

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let currentTranscript = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript
      }
      setTranscript(currentTranscript)
      transcriptRef.current = currentTranscript
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)
      
      // Let's show the exact error so we know why it's failing
      if (event.error !== "aborted" && event.error !== "no-speech") {
        alert(`Microphone Error: ${event.error}. Please check console or try typing your answer instead.`)
      }
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      if (transcriptRef.current.trim()) {
        handleUserSubmit(transcriptRef.current)
      }
    }

    try {
      recognition.start()
      recognitionRef.current = recognition
      setIsListening(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error("Failed to start speech recognition:", e)
      alert("Failed to start microphone: " + e.message)
      setIsListening(false)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    // The onend event will handle submitting the transcript
  }

  const startInterview = async () => {
    setInterviewStarted(true)
    setIsAiThinking(true)
    setTimeLeft(duration * 60)
    
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pattern,
          difficulty,
          duration,
          messages: [], // Initial message
        })
      })
      
      const data = await res.json()
      if (data.reply) {
        setMessages([{ role: "assistant", content: data.reply }])
        speakAI(data.reply)
      }
    } catch (error) {
      console.error("Failed to start interview", error)
    } finally {
      setIsAiThinking(false)
    }
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const handleUserSubmit = async (userText: string) => {
    if (!userText.trim()) return

    const newMessages: Message[] = [...messagesRef.current, { role: "user", content: userText.trim() }]
    setMessages(newMessages)
    setTranscript("")
    transcriptRef.current = ""
    setFallbackInput("")
    setIsAiThinking(true)

    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pattern,
          difficulty,
          duration,
          timeLeft,
          code, // Pass the live code to the AI
          messages: newMessages,
        })
      })
      
      const data = await res.json()
      if (data.reply) {
        setMessages([...newMessages, { role: "assistant", content: data.reply }])
        speakAI(data.reply)
      }
    } catch (error) {
      console.error("Failed to get AI reply", error)
    } finally {
      setIsAiThinking(false)
    }
  }

  const endInterview = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_interview_transcript", JSON.stringify(messagesRef.current))
      localStorage.setItem("mock_interview_pattern", pattern)
      localStorage.setItem("mock_interview_code", code)
      localStorage.setItem("mock_interview_language", language)
      router.push("/interview/report")
    }
  }

  const speakAI = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    
    window.speechSynthesis.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95
    
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = 
      voices.find(v => v.name.includes("Google US English") || v.name.includes("Google UK English")) ||
      voices.find(v => v.name.includes("Samantha") || v.name.includes("Daniel") || v.name.includes("Karen")) ||
      voices.find(v => v.lang === "en-US" && v.name.includes("Premium")) ||
      voices.find(v => v.lang === "en-US") ||
      voices.find(v => v.lang.startsWith("en"))
      
    if (preferredVoice) utterance.voice = preferredVoice
    
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }, [])

  const [fallbackInput, setFallbackInput] = useState("")

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className={`flex-1 flex flex-col mx-auto w-full ${interviewStarted ? 'max-w-7xl' : 'max-w-4xl'} px-4 py-8 pt-24 sm:px-6 sm:pt-28 min-h-0`}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16} className="mr-2" />
            Exit Interview
          </Link>
          <div className="flex items-center gap-4">
            {interviewStarted && (
              <div className={`font-mono text-lg font-black tracking-widest ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-foreground'}`}>
                {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">Live Session</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {!interviewStarted ? (
            <motion.div 
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full relative z-10"
            >
              {/* Background ambient glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 dark:bg-amber-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />

              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/5 dark:from-amber-900/40 dark:to-amber-900/10 mb-8 border border-amber-500/20 shadow-[0_0_40px_rgba(168,85,247,0.2)]"
              >
                <Brain size={48} className="text-amber-600 dark:text-amber-400" />
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border border-amber-500/30 border-t-amber-500 border-r-transparent"
                />
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-2xl md:text-3xl font-semibold mb-4 text-center tracking-tight text-slate-800 dark:text-slate-200"
              >
                Deep Dive: <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400">{pattern}</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="text-lg text-muted-foreground mb-10 text-center max-w-xl"
              >
                Configure your AI interviewer settings before we begin the live session.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="w-full bg-white/50 dark:bg-card/50 backdrop-blur-xl border border-white/20 dark:border-border rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-amber-500/5 mb-10"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {/* Topic Selection */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <Brain size={20} />
                      </div>
                      <h3 className="font-bold text-lg">Topic</h3>
                    </div>
                    <div className="flex flex-col gap-3 relative">
                      <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full relative flex items-center justify-between border-2 border-amber-600 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:border-amber-500 dark:text-amber-300 rounded-2xl px-4 py-4 font-bold text-left transition-all shadow-lg shadow-amber-500/10 cursor-pointer h-[60px]"
                      >
                        <span className="truncate pr-4">{pattern}</span>
                        <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }}>
                          <svg className="h-5 w-5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </motion.div>
                      </button>

                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-[68px] left-0 w-full z-50 bg-white dark:bg-zinc-900 border border-border rounded-2xl shadow-2xl max-h-[240px] overflow-y-auto"
                          >
                            <div className="flex flex-col p-2">
                              {["General Data Structures", ...ALL_PATTERN_NAMES].map((p) => (
                                <button
                                  key={p}
                                  onClick={() => { setPattern(p); setIsDropdownOpen(false); }}
                                  className={`px-4 py-3 text-left rounded-xl text-sm font-semibold transition-colors ${
                                    pattern === p 
                                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400" 
                                      : "text-foreground hover:bg-muted"
                                  }`}
                                >
                                  {p}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <p className="text-xs text-muted-foreground mt-2 px-1">
                        Select the specific algorithmic pattern you want the AI to test you on.
                      </p>
                    </div>
                  </div>

                  {/* Difficulty Selection */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <BarChart size={20} />
                      </div>
                      <h3 className="font-bold text-lg">Difficulty</h3>
                    </div>
                    <div className="flex flex-col gap-3">
                      {["Easy", "Medium", "Hard"].map((lvl) => (
                        <motion.button
                          key={lvl}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setDifficulty(lvl)}
                          className={`relative overflow-hidden py-4 px-6 rounded-2xl font-bold text-left transition-all border-2 ${
                            difficulty === lvl 
                              ? "border-amber-600 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:border-amber-500 dark:text-amber-300 shadow-lg shadow-amber-500/10" 
                              : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {difficulty === lvl && (
                            <motion.div layoutId="difficulty-glow" className="absolute inset-0 bg-gradient-to-r from-amber-600/10 to-transparent pointer-events-none" />
                          )}
                          <span className="relative z-10">{lvl} {lvl === "Hard" && "🔥"}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Duration Selection */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <Clock size={20} />
                      </div>
                      <h3 className="font-bold text-lg">Duration</h3>
                    </div>
                    <div className="flex flex-col gap-3">
                      {[5, 10, 15].map((mins) => (
                        <motion.button
                          key={mins}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setDuration(mins)}
                          className={`relative overflow-hidden py-4 px-6 rounded-2xl font-bold text-left transition-all border-2 ${
                            duration === mins 
                              ? "border-orange-600 bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:border-orange-500 dark:text-orange-300 shadow-lg shadow-orange-500/10" 
                              : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {duration === mins && (
                            <motion.div layoutId="duration-glow" className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-transparent pointer-events-none" />
                          )}
                          <span className="relative z-10">{mins} Minutes</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startInterview}
                className="group relative flex w-full md:w-auto items-center justify-center gap-2 rounded-full bg-foreground px-8 py-3.5 font-sans text-lg font-bold text-background transition-all shadow-lg hover:shadow-xl hover:shadow-amber-500/20 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Sparkles size={18} className="relative z-10 group-hover:animate-pulse group-hover:text-white" />
                <span className="relative z-10 group-hover:text-white">Start {duration}-Min Interview</span>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div 
              key="interview"
              initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[500px] h-[600px] lg:h-[calc(100vh-220px)]"
            >
            
            {/* Code Editor Pane */}
            <div className="lg:col-span-3 flex flex-col bg-[#1e1e1e] border border-border rounded-3xl shadow-2xl overflow-hidden relative">
              <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                <div className="flex items-center gap-2 text-white">
                  <span className="font-bold">Live Editor</span>
                </div>
                <select 
                  value={language} 
                  onChange={e => {
                    const newLang = e.target.value
                    setLanguage(newLang)
                    setCode(snippets[newLang as keyof typeof snippets])
                  }} 
                  className="bg-white/10 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="python" className="bg-zinc-800 text-white">Python</option>
                  <option value="javascript" className="bg-zinc-800 text-white">JavaScript</option>
                  <option value="java" className="bg-zinc-800 text-white">Java</option>
                  <option value="cpp" className="bg-zinc-800 text-white">C++</option>
                </select>
              </div>
              <div className="flex-1 pt-4">
                <Editor
                  height="100%"
                  language={language}
                  theme="vs-dark"
                  value={code}
                  onChange={(val) => setCode(val || "")}
                  options={{ 
                    minimap: { enabled: false }, 
                    fontSize: 15,
                    padding: { top: 10 },
                    scrollBeyondLastLine: false,
                    smoothScrolling: true
                  }}
                />
              </div>
            </div>

            {/* Chat & Controls Pane */}
            <div className="lg:col-span-2 flex flex-col bg-card/80 backdrop-blur-xl border border-border rounded-3xl shadow-2xl overflow-hidden relative">
            
            {/* Transcript Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl p-4 ${
                    m.role === "user" 
                      ? "bg-primary text-primary-foreground rounded-br-sm" 
                      : "bg-muted text-foreground border border-border rounded-bl-sm"
                  }`}>
                    <p className="text-sm leading-relaxed">{m.content}</p>
                  </div>
                </div>
              ))}
              
              {/* Live Transcript Preview */}
              {isListening && transcript && (
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl p-4 bg-primary/20 text-foreground border border-primary/30 rounded-br-sm">
                    <p className="text-sm leading-relaxed opacity-70 italic">{transcript}</p>
                  </div>
                </div>
              )}
              
              {isAiThinking && (
                <div className="flex justify-start">
                  <div className="bg-muted text-foreground border border-border rounded-2xl rounded-bl-sm p-4 flex items-center gap-3">
                    <Loader2 size={16} className="animate-spin text-muted-foreground" />
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">AI is thinking...</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Controls */}
            <div className="p-6 border-t border-border bg-background/50 backdrop-blur flex flex-col items-center justify-center">
              
              <div className="mb-4 h-6 flex items-center justify-center">
                {isSpeaking ? (
                  <div className="flex items-center gap-2 text-amber-600">
                    <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span></span>
                    <span className="text-xs font-bold uppercase tracking-widest">AI is Speaking</span>
                  </div>
                ) : isListening ? (
                  <div className="flex items-center gap-2 text-red-500">
                    <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>
                    <span className="text-xs font-bold uppercase tracking-widest">Listening... Click to stop</span>
                  </div>
                ) : (
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Click microphone to speak</span>
                )}
              </div>

              <button
                onClick={toggleListening}
                disabled={isAiThinking}
                className={`relative flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300 shadow-xl ${
                  isListening 
                    ? "bg-red-500 text-white scale-110 shadow-red-500/30" 
                    : isAiThinking
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-foreground text-background hover:scale-105"
                }`}
              >
                {isListening ? <StopCircle size={32} /> : <Mic size={32} />}
                
                {/* Listening Pulse effect */}
                {isListening && (
                  <div className="absolute inset-0 -z-10 rounded-full border-4 border-red-500/50 animate-ping" />
                )}
              </button>
              
              {/* Fallback Input */}
              {!isListening && (
                <div className="mt-6 w-full max-w-md flex items-center gap-2">
                  <input 
                    type="text" 
                    value={fallbackInput}
                    onChange={(e) => setFallbackInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUserSubmit(fallbackInput)
                    }}
                    disabled={isAiThinking || isSpeaking}
                    placeholder="Or type your answer here..."
                    className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:border-primary disabled:opacity-50"
                  />
                  <button 
                    onClick={() => handleUserSubmit(fallbackInput)}
                    disabled={!fallbackInput.trim() || isAiThinking || isSpeaking}
                    className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              )}
            </div>

            </div>
            </motion.div>
        )}
        </AnimatePresence>
      </main>
    </div>
  )
}
