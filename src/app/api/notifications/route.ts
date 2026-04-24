import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET — Fetch notifications for a user
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notifications: data });
}

// PATCH — Mark notifications as read
export async function PATCH(req: NextRequest) {
  const { userId, notificationIds } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  if (notificationIds && notificationIds.length > 0) {
    // Mark specific notifications as read
    await supabase
      .from("notifications")
      .update({ read: true })
      .in("id", notificationIds)
      .eq("user_id", userId);
  } else {
    // Mark ALL as read
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);
  }

  return NextResponse.json({ success: true });
}
