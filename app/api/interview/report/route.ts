import { createClient } from "@supabase/supabase-js"
import { auth } from "@clerk/nextjs/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  const { userId } = await auth()

  if (!id || !userId) {
    return Response.json({ error: "Unauthorized or missing ID" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("mock_interviews")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single()

  if (error || !data) {
    return Response.json({ error: "Report not found" }, { status: 404 })
  }

  return Response.json(data)
}

export async function POST(request: Request) {
  const { userId } = await auth()
  
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

    const { pattern, transcript, code, language } = await request.json()

    if (!transcript || !Array.isArray(transcript)) {
      return Response.json({ error: "Invalid transcript" }, { status: 400 })
    }

    const transcriptText = transcript
      .map((t: { role: string; content: string }) => `${t.role.toUpperCase()}: ${t.content}`)
      .join("\n")

    const systemPrompt = `You are an expert FAANG technical interviewer.
You just completed a mock interview with a candidate focusing on the pattern: ${pattern}.

CANDIDATE'S FINAL WRITTEN CODE (${language}):
\`\`\`
${code || "(The candidate did not write any code)"}
\`\`\`

Here is the transcript of the interview:
${transcriptText}

Your task is to analyze BOTH their verbal communication in the transcript AND the final code they wrote.
Generate a highly critical, realistic feedback report.

Respond ONLY with valid JSON. Do NOT include markdown fences, and do NOT include // comments inside the JSON. Escape all newlines in the code string as \\n:
{
  "hire_probability": 85,
  "feedback_summary": "Two sentences summarizing their overall performance. YOU MUST explicitly mention their communication skills (e.g. if they spoke clearly, if they struggled to explain their thoughts, or gave one-word answers).",
  "strengths": [
    "Specific technical strength",
    "Specific communication strength (if any. If there are no communication strengths, OMIT this item completely. DO NOT output 'None')"
  ],
  "weaknesses": [
    "What they are missing (e.g. missed an edge case or failed to explain time complexity)",
    "What they need to know (e.g. they need to learn about sliding window optimization)",
    "Communication issues (if any. If none, OMIT this item. DO NOT output 'None')"
  ],
  "action_plan": "One highly specific, step-by-step piece of advice on what to study next for this pattern and how to improve their communication during interviews.",
  "optimal_code_language": "The programming language you are using for the optimal solution (e.g., 'python', 'javascript', 'java', 'cpp'). Default to python if unknown.",
  "optimal_solution_code": "The complete, perfect, 100% optimal code solution. You MUST properly escape all newlines as \\n so this remains a valid JSON string."
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
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(transcript) }
        ],
        max_tokens: 2500,
      }),
    })

    const aiData = await aiResponse.json()
    
    if (!aiResponse.ok) {
      console.error("OpenRouter API Error:", aiData)
      return Response.json({ error: "AI API error" }, { status: 500 })
    }

    const rawText = aiData.choices?.[0]?.message?.content || ""
    const clean = rawText.replace(/```json|```/g, "").trim()
    
    let result;
    try {
      result = JSON.parse(clean)
    } catch {
      console.error("Failed to parse JSON. Raw AI Output:", clean)
      return Response.json({ error: "AI returned invalid JSON format" }, { status: 500 })
    }

    // Save to database
    const { data: insertedData, error: dbError } = await supabase
      .from("mock_interviews")
      .insert([
        {
          user_id: userId,
          pattern: pattern,
          hire_probability: result.hire_probability,
          feedback_summary: result.feedback_summary,
          strengths: result.strengths,
          weaknesses: result.weaknesses,
          action_plan: result.action_plan
        }
      ])
      .select()
      .single()

    if (dbError) {
      console.error("Database insert error:", dbError)
      return Response.json(result) // Still return result even if saving fails
    }

    return Response.json({ ...result, id: insertedData.id })
  } catch (error) {
    console.error("Failed to generate report", error)
    return Response.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
