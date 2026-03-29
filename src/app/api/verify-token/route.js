import { NextResponse } from "next/server";
import { verifyEmailToken } from "@/lib/verification";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/verify-email?error=token_missing", request.url)
      );
    }

    // Verificar el token
    const member = await verifyEmailToken(token);

    if (!member) {
      return NextResponse.redirect(
        new URL("/verify-email?error=token_invalid", request.url)
      );
    }

    // Redirect al login con mensaje de éxito
    return NextResponse.redirect(
      new URL("/login?verified=true", request.url)
    );
  } catch (error) {
    console.error("Error verificando token:", error);
    return NextResponse.redirect(
      new URL("/verify-email?error=server_error", request.url)
    );
  }
}
