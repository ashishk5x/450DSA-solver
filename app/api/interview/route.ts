import { auth } from "@clerk/nextjs/server"

export async function POST(request: Request) {
  const { pattern, difficulty, duration, timeLeft, code, messages } = await request.json()
  
  if (!pattern) {
    return Response.json({ error: "Pattern is required" }, { status: 400 })
  }

  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const systemPrompt = `You are a STRICT, professional tech interviewer from a top FAANG company (Google/Amazon). 
You are conducting a voice-to-voice mock interview with a candidate.
The focus pattern for today's interview is: ${pattern}.
The requested difficulty level is: ${difficulty || "Medium"}.

CANDIDATE'S CURRENT LIVE CODE:
\`\`\`
${code || "(Candidate has not written any code yet)"}
\`\`\`

RULES:
1. ALWAYS keep your responses concise (1 to 3 sentences maximum). This will be spoken out loud via text-to-speech, so long paragraphs are terrible.
2. DO NOT use markdown, code blocks, or special characters (like asterisks or hashtags). Speak entirely in plain English text.
3. Start by warmly greeting them. DO NOT ask a generic, textbook algorithm question. Instead, frame the question dynamically as a real-world engineering problem that requires the ${pattern} pattern to solve.
CRITICAL: The user has selected a ${duration}-minute interview at ${difficulty} difficulty. Your opening question MUST be extremely brief. Do NOT give a massive paragraph of backstory. Keep the scenario to 1 or 2 short sentences max.
4. At the end of your opening question, EXPLICITLY ask them to explain their high-level approach verbally before writing any code.
5. As they answer verbally, BE STRICT but HELPFUL. Act like a real human interviewer. If they give a superficial answer, push back and demand a detailed step-by-step explanation including time and space complexity. If they get stuck, gently nudge them with a hint.
6. ONLY after you are completely satisfied with their verbal approach, explicitly ask them to "go ahead and write the code in the editor."
7. Evaluate their live code. If they are writing code and it has syntax errors, off-by-one errors, or algorithmic flaws, explicitly point it out ("I see in your code that...").
8. Act like a human conversationalist. Use words like "Got it," "That makes sense," "Hmm," or "Okay."
9. TIME MANAGEMENT: You have ${timeLeft} seconds remaining. If this is less than 60 seconds, you MUST wrap up the interview immediately. Do not ask any more questions. Instead, give a quick verbal feedback summary covering exactly these points:
   - Their communication skills.
   - The best part of their performance.
   - What they need to focus on or improve.
   - Name 1 or 2 top companies that frequently ask this exact type of question.
   Explicitly say "We are out of time, let's end here" at the very end.`

  // Format messages for OpenRouter
  // If messages is empty, we just pass the system prompt to trigger the opening question
  const openRouterMessages = [
    { role: "system", content: systemPrompt },
    ...messages
  ]
  
  // If it's the very first call, we need to prompt the AI to start and verify limits
  if (messages.length === 0) {
    try {
      const protocol = request.headers.get("x-forwarded-proto") || "http"
      const host = request.headers.get("host")
      const limitRes = await fetch(`${protocol}://${host}/api/interview-limit`, {
        headers: { cookie: request.headers.get("cookie") || "" }
      })
      if (limitRes.ok) {
        const { limit, used } = await limitRes.json()
        if (limit !== -1 && used >= limit && limit > 0) {
          return Response.json({ error: "Monthly interview limit reached. Please upgrade to Pro for more." }, { status: 403 })
        }
        if (limit === 0) {
          return Response.json({ error: "Mock interviews are only available on Basic and Pro plans." }, { status: 403 })
        }
      }
    } catch (e) {
      console.error("Failed to check limit", e)
    }

    openRouterMessages.push({ role: "user", content: "Hi, I'm ready to start the interview." })
  }

  try {
    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: openRouterMessages,
        max_tokens: 300, // Keep it short for voice
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
      return Response.json({ error: `AI API error` }, { status: 500 });
    }

    const rawText = aiData.choices?.[0]?.message?.content || "I'm sorry, I didn't catch that. Could you repeat?"
    
    // Clean up any stray markdown that the AI might have hallucinated despite instructions
    const cleanText = rawText.replace(/[*#`_]/g, "").trim()

    return Response.json({ reply: cleanText })
  } catch (error) {
    console.error("API error", error)
    return Response.json({ error: "Failed to generate reply" }, { status: 500 })
  }
}
