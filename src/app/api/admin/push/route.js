import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendPushToAll, countSubscriptions } from "@/lib/push";

// GET: cantidad de dispositivos suscritos (admin)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.permissions?.is_admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  try {
    const count = await countSubscriptions();
    return NextResponse.json({ count });
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
    const { title, body, url } = await request.json();
    if (!title || !body) {
      return NextResponse.json({ error: "title y body requeridos" }, { status: 400 });
    }
    const result = await sendPushToAll({ title, body, url: url || "/", tag: "anuncio" });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
