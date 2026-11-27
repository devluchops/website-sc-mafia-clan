import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendPushToAll, countSubscriptions, getPushLog } from "@/lib/push";

// GET: dispositivos suscritos + historial de envíos (admin)
export async function GET() {
  const session = await getServerSession(authOptions);
  const perms = session?.user?.permissions;
  if (!perms?.is_admin && !perms?.can_publish_events) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  try {
    const count = await countSubscriptions();
    const log = await getPushLog(30);
    return NextResponse.json({ count, log });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: enviar un anuncio push a todos (admin)
export async function POST(request) {
  const session = await getServerSession(authOptions);
  const perms = session?.user?.permissions;
  if (!perms?.is_admin && !perms?.can_publish_events) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  try {
    const { title, body, url, detail } = await request.json();
    if (!title || !body) {
      return NextResponse.json({ error: "title y body requeridos" }, { status: 400 });
    }
    const sentBy = session.user?.discordUsername || session.user?.name || session.user?.email || "admin";
    const result = await sendPushToAll(
      { title, body, url: url || "/", detail: detail || null, tag: "anuncio", topic: "anuncio" },
      { kind: "manual", sentBy }
    );
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
