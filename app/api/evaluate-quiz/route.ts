export async function POST(request: Request) {
  const { question, userAnswer, expectedAnswer, patternName } = await request.json()

  if (!question || !userAnswer) {
    return Response.json({ error: "Missing fields" }, { status: 400 })
  }

  // Verify user has Pro plan
  const authHeader = request.headers.get("authorization")
  const userId = authHeader ? authHeader.replace("Bearer ", "") : null

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { createClient } = await import("@supabase/supabase-js")
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Check user plan
    const { data: sub } = await sb
      .from("subscriptions")
      .select("plan, expires_at")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle()

    if (!sub || sub.plan !== "pro" || (sub.expires_at && new Date(sub.expires_at) < new Date())) {
      return Response.json({ error: "Pro plan required" }, { status: 403 })
    }

    // Use AI to evaluate the answer — lightweight call (~100 tokens)
    const evaluationPrompt = `You are evaluating a DSA student's answer. Be encouraging but honest.

Pattern: ${patternName}
Question: ${question}
Expected concepts in answer: ${expectedAnswer}
Student's answer: ${userAnswer}

Respond ONLY with valid JSON, no markdown fences:
{
  "correct": true/false,
  "feedback": "1-2 sentence feedback. If correct: acknowledge what they got right. If wrong: hint at what they missed without giving the full answer."
}`

    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: evaluationPrompt }],
        max_tokens: 150,
      }),
    })

    const aiData = await aiResponse.json()

    if (!aiResponse.ok) {
      console.error("Quiz eval AI error:", aiData)
      return Response.json({ error: "Evaluation failed" }, { status: 500 })
    }

    const rawText = aiData.choices?.[0]?.message?.content || ""
    const clean = rawText.replace(/```json|```/g, "").trim()
    let evaluation;
    try {
      evaluation = JSON.parse(clean)
    } catch {
      console.error("Quiz JSON Parse Error. Raw output:", clean)
      return Response.json({ error: "AI returned invalid JSON" }, { status: 500 })
    }

    return Response.json({
      correct: evaluation.correct,
      feedback: evaluation.feedback,
    })
  } catch (err) {
    console.error("Quiz evaluation error:", err)
    return Response.json({ error: "Evaluation failed" }, { status: 500 })
  }
}
