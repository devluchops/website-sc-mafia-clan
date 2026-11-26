import { NextResponse } from "next/server";
import { saveSubscription } from "@/lib/push";

export async function POST(request) {
  try {
    const body = await request.json();
    const subscription = body.subscription || body; // compat: acepta {subscription, topics} o la suscripción cruda
    const topics = body.topics;
    const userAgent = request.headers.get("user-agent") || null;
    await saveSubscription(subscription, userAgent, topics);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
}
