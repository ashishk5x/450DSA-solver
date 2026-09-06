import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  const { userId, solveTimeSeconds, selfSolved, timerUsed } = await request.json()

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Find the most recent solve for this user and update it with timer data
    const { data: latestSolve } = await sb
      .from("solves")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (!latestSolve) {
      return Response.json({ error: "No solve found" }, { status: 404 })
    }

    const updateData: Record<string, unknown> = { timer_used: timerUsed }

    if (typeof solveTimeSeconds === "number") {
      updateData.solve_time_seconds = solveTimeSeconds
    }

    if (typeof selfSolved === "boolean") {
      updateData.self_solved = selfSolved
    }

    const { error } = await sb
      .from("solves")
      .update(updateData)
      .eq("id", latestSolve.id)

    if (error) {
      console.error("Save timer result error:", error)
      return Response.json({ error: "Failed to save" }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error("Timer save error:", err)
    return Response.json({ error: "Server error" }, { status: 500 })
  }
}
