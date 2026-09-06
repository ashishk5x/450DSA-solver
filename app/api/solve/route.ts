import { createClient } from "@supabase/supabase-js"

function normalizeProblem(problem: string) {
  return problem
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
}

function simpleHash(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return hash.toString()
}

export async function POST(request: Request) {
  const { problem } = await request.json()
  if (!problem || problem.trim().length < 20) {
    return Response.json({ error: "Problem too short" }, { status: 400 })
  }

  const authHeader = request.headers.get("authorization")
  const userId = authHeader ? authHeader.replace("Bearer ", "") : null
  
  if (!userId) {
    return Response.json(
      { error: "Please login to use this feature" },
      { status: 401 }
    )
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // ── 1. Cache Check (Sequential Short-circuit) ──
  const normalized = normalizeProblem(problem)
  const problemHash = simpleHash(normalized)

  const { data: cached } = await sb
    .from("problem_cache")
    .select("result")
    .eq("problem_hash", problemHash)
    .maybeSingle()

  if (cached?.result) {
    return Response.json({
      ...cached.result,
      _meta: { cacheHit: true }
    })
  }

  // ── 2. Parallel User Validation ──
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString()
  const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0)
  const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0)

  // Run all validation queries in parallel to minimize round-trips
  const [subRes, minuteRes, dayRes, monthRes, usageRes] = await Promise.all([
    sb.from("subscriptions").select("plan, expires_at").eq("user_id", userId).eq("status", "active").maybeSingle(),
    sb.from("solves").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", oneMinuteAgo),
    sb.from("solves").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", startOfDay.toISOString()),
    sb.from("solves").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", startOfMonth.toISOString()),
    sb.from("usage_log").select("tokens_used").eq("user_id", userId).gte("created_at", startOfMonth.toISOString())
  ])

  // Resolve user plan
  let userPlan = "free"
  if (subRes.data) {
    const expired = subRes.data.expires_at && new Date(subRes.data.expires_at) < new Date()
    if (!expired) userPlan = subRes.data.plan as string
  }

  // Validate per-minute limit
  const recentCount = minuteRes.count || 0
  const perMinLimit = userPlan === "pro" ? 10 : userPlan === "basic" ? 5 : 3
  if (recentCount >= perMinLimit) {
    return Response.json({ error: "Too many requests. Please wait a moment." }, { status: 429 })
  }

  // Validate quota (Free/Basic)
  if (userPlan !== "pro") {
    const solveCount = userPlan === "basic" ? (monthRes.count || 0) : (dayRes.count || 0)
    const limit = userPlan === "basic" ? 100 : 3
    if (solveCount >= limit) {
      const msg = userPlan === "basic"
        ? "Monthly solve limit reached (100/month). Upgrade to Pro for unlimited solves."
        : "Daily solve limit reached (3/day). Upgrade to Basic for 100 solves/month."
      return Response.json({ error: msg }, { status: 429 })
    }
  }

  // Validate fair usage (Pro)
  if (userPlan === "pro") {
    const totalTokens = usageRes.data?.reduce((sum, u) => sum + u.tokens_used, 0) || 0
    if (totalTokens > 1000000) {
      return Response.json({ error: "Fair usage limit reached. Contact support if needed." }, { status: 429 })
    }
  }

  // ── 3. AI Generation ──
  const systemPrompt = `You are a DSA interview coach. Your goal is NOT to give solutions — your goal is to help students THINK and develop problem-solving intuition.

The user pastes a raw DSA problem. Extract the core problem ignoring noise.

Respond ONLY with valid JSON, no markdown fences:
{
  "problem_summary": "One sentence: what does this problem actually ask?",
  "difficulty": "Easy | Medium | Hard",
  "pattern_name": "Pattern name only — do not explain yet",
  "thinking_prompt": "One powerful question that makes the student think in the right direction WITHOUT revealing the pattern. Like a Socratic question. Example: 'If you had to check whether a number exists in a collection millions of times, what property would you want that collection to have?'",
  "hints": [
    "Hint 1 — very vague, just a nudge. Mention a property or constraint in the problem they should notice.",
    "Hint 2 — slightly more specific. Point toward the data structure or technique category.",
    "Hint 3 — almost there. Describe the core operation needed without naming the algorithm."
  ],
  "pattern_reveal": {
    "name": "Pattern name",
    "why": "Now explain why this pattern fits — 2 sentences connecting problem structure to pattern.",
    "intuition": "The key insight in one sentence — the 'aha moment' a student needs to have."
  },
  "thinking_steps": [
    "Step 1: What to observe in the problem (not what to code)",
    "Step 2: What question to ask yourself",
    "Step 3: How to arrive at the approach",
    "Step 4: How to verify your thinking is correct"
  ],
  "missing_concepts": [
    {
      "concept": "Concept name they need to know",
      "why_needed": "One sentence why this concept is prerequisite",
      "learn_query": "Search query to learn this — e.g. 'HashMap time complexity explained'"
    }
  ],
  "memory_hook": "A vivid analogy that makes this pattern stick forever. Something they will remember in a stressful interview.",
  "interview_recognition": "Exact phrases or constraints in problem statements that signal this pattern. Start with: Look for...",
  "similar_problems": [
    {"name": "Problem Name", "difficulty": "Easy", "platform": "LC", "why_similar": "One line — same pattern, different surface"},
    {"name": "Problem Name", "difficulty": "Medium", "platform": "LC", "why_similar": "One line"},
    {"name": "Problem Name", "difficulty": "Hard", "platform": "LC", "why_similar": "One line"}
  ],
  "solve_time": "Easy: 10 min | Medium: 20 min | Hard: 35 min",
  "quiz_questions": [
    {
      "question": "A specific question about edge cases, time complexity, or why this approach works for THIS problem. Not generic.",
      "expected_answer": "Key concepts/keywords a correct answer should contain"
    },
    {
      "question": "A deeper question testing whether the student truly understands the pattern — e.g., what happens if input changes, or how to optimize further.",
      "expected_answer": "Key concepts/keywords a correct answer should contain"
    }
  ]
}`

  try {
    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: problem }],
        max_tokens: userPlan === "free" ? 1500 : 2500,
      }),
    })

    let aiData;
    try {
      aiData = await aiResponse.json();
    } catch (e) {
      console.error("Failed to parse OpenRouter JSON:", e);
      return Response.json({ error: "AI response format error" }, { status: 500 });
    }

    if (!aiResponse.ok) {
      console.error("OpenRouter API Error:", aiData);
      return Response.json({ error: `AI API error: ${aiData?.error?.message || 'Unknown error'}` }, { status: 500 });
    }

    const tokens = aiData?.usage?.total_tokens || 0
    const rawText = aiData.choices?.[0]?.message?.content || ""
    const clean = rawText.replace(/```json|```/g, "").trim()
    let result;
    try {
      result = JSON.parse(clean)
    } catch {
      console.error("Solve JSON Parse Error. Raw output:", clean)
      throw new Error("Invalid JSON from AI")
    }

    // ── 4. Async Finalization (Parallel saves) ──
    try {
      const updateStreak = async () => {
        const { data: profile } = await sb.from("profiles").select("current_streak, last_solve_date").eq("user_id", userId).single()
        if (profile) {
          const todayStr = new Date().toISOString().split('T')[0]
          const lastSolveStr = profile.last_solve_date ? new Date(profile.last_solve_date).toISOString().split('T')[0] : null
          
          if (lastSolveStr === todayStr) return // Already solved today
          
          let newStreak = 1
          if (lastSolveStr) {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            const yesterdayStr = yesterday.toISOString().split('T')[0]
            if (lastSolveStr === yesterdayStr) {
              newStreak = (profile.current_streak || 0) + 1
            }
          }
          
          await sb.from("profiles").update({ 
            current_streak: newStreak, 
            last_solve_date: new Date().toISOString() 
          }).eq("user_id", userId)
        }
      }

      await Promise.all([
        sb.from("solves").insert({
          user_id: userId,
          problem_summary: result.problem_summary,
          pattern_name: result.pattern_reveal?.name || result.pattern_name,
          difficulty: result.difficulty,
          full_result: result,
        }).then(res => { if (res.error) console.error("Solves insert error:", res.error) }),
        
        tokens > 0 
          ? sb.from("usage_log").insert({ user_id: userId, tokens_used: tokens }).then(res => { if (res.error) console.error("Usage logs error:", res.error) })
          : Promise.resolve(),
          
        sb.from("problem_cache").insert({ problem_hash: problemHash, normalized_problem: normalized, result: result }),
        
        updateStreak().catch(e => console.error("Streak update error:", e))
      ])
    } catch (saveErr) {
      console.error("Background save failed (non-blocking):", saveErr);
      // We don't return 500 here because the user already has their result
    }

    return Response.json({ ...result, _meta: { cacheHit: false } })
  } catch {
    return Response.json({ error: "Failed to analyze. Try again." }, { status: 500 })
  }
}