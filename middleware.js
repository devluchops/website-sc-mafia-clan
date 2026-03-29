import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { isEmailVerified } from "@/lib/verification";

// Rutas que NO requieren verificación de email
const PUBLIC_ROUTES = [
  "/login",
  "/verify-email",
  "/api/auth",
  "/api/send-verification",
  "/api/verify-token",
  "/_next",
  "/favicon.ico",
  "/logo.png",
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Permitir rutas públicas
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Si no hay sesión, redirigir a login
  if (!token) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  // Verificar si el email está verificado
  try {
    const verified = await isEmailVerified(token.discordId);

    // Si no está verificado, redirigir a /verify-email
    if (!verified) {
      const url = new URL("/verify-email", request.url);
      return NextResponse.redirect(url);
    }
  } catch (error) {
    console.error("Error verificando email en middleware:", error);
    // En caso de error, permitir acceso (para evitar bloqueos)
  }

  // Proteger rutas de admin
  if (pathname.startsWith("/admin")) {
    // Usuario ya está autenticado y verificado
    // Continuar normalmente
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
