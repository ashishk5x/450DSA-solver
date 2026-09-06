import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get user's plan
    let plan = "free";
    const { data: subData } = await sb
      .from("subscriptions")
      .select("plan, expires_at")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();

    if (subData) {
      const expired = subData.expires_at && new Date(subData.expires_at) < new Date();
      if (!expired) plan = subData.plan as string;
    }

    // Determine fetch constraints based on plan
    let query = sb
      .from("solves")
      .select("id, created_at, problem_summary, pattern_name, difficulty, full_result")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (plan === "free") {
      // Free users only get the most recent 3 solves as a teaser
      query = query.limit(3);
    } else if (plan === "basic") {
      // Basic users get last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query = query.gte("created_at", thirtyDaysAgo.toISOString());
    }
    // Pro gets everything (no limit/gte)

    const { data, error } = await query;

    if (error) {
      console.error("Database error fetching history:", error);
      return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }

    return NextResponse.json({
      plan,
      history: data || [],
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
