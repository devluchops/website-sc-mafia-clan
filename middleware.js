import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Rutas públicas que no requieren autenticación
  const publicRoutes = [
    "/login",
    "/verify-email",
    "/api/auth",
    "/api/send-verification",
    "/api/verify-token",
  ];

  // Permitir rutas públicas
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Solo proteger admin y rutas que requieren auth
  const protectedRoutes = ["/admin"];

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Si no hay sesión, redirigir a login
    if (!token) {
      const url = new URL("/login", request.url);
      return NextResponse.redirect(url);
    }

    // Verificar email desde el token (almacenado en sesión)
    // El token incluye emailVerified desde auth.js
    if (!token.emailVerified && pathname !== "/verify-email") {
      const url = new URL("/verify-email", request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*"],
};
