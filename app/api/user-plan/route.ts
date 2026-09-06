import { auth } from "@clerk/nextjs/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ plan: "free" })

  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await sb
      .from("subscriptions")
      .select("plan, expires_at")
      .eq("user_id", userId)
      .eq("status", "active")
      .single()

    if (!data) return Response.json({ plan: "free" })
    const expired = data.expires_at && new Date(data.expires_at) < new Date()
    if (expired) return Response.json({ plan: "free" })
    return Response.json({ plan: data.plan })
  } catch {
    return Response.json({ plan: "free" })
  }
}