import { NextResponse } from "next/server";
import { saveSubscription } from "@/lib/push";

export async function POST(request) {
  try {
    const subscription = await request.json();
    const userAgent = request.headers.get("user-agent") || null;
    await saveSubscription(subscription, userAgent);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
}
