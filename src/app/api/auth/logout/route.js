import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logSession } from "@/lib/audit";

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    // Log antes de destruir la sesión
    await logSession({
      action: "LOGOUT",
      user: {
        id: session.user.discordId,
        username: session.user.discordUsername,
        email: session.user.email,
      },
      request,
    });
  }

  // Responder con instrucción de logout
  return Response.json({ success: true });
}
