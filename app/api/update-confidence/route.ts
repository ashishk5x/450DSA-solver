import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const { solveId, confidence, userId } = await request.json()

    if (!userId) {
      return Response.json({ error: "Not authenticated" }, { status: 401 })
    }

    if (!confidence || confidence < 1 || confidence > 4) {
      return Response.json({ error: "Invalid confidence value" }, { status: 400 })
    }

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // If solveId is provided, update that specific solve
    if (solveId) {
      await sb
        .from("solves")
        .update({ confidence })
        .eq("id", solveId)
        .eq("user_id", userId)
    } else {
      // Otherwise update the most recent solve for this user
      const { data: recentSolve } = await sb
        .from("solves")
        .select("id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (recentSolve) {
        await sb
          .from("solves")
          .update({ confidence })
          .eq("id", recentSolve.id)
      }
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error("Update confidence error:", err)
    return Response.json({ error: "Failed to save confidence" }, { status: 500 })
  }
}
