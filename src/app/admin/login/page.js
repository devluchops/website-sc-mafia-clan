"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/admin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a"
      }}>
        <div style={{ color: "#c9a84c" }}>Cargando...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#111110",
          border: "1px solid #2a2215",
          borderRadius: "10px",
          padding: "48px 40px",
          maxWidth: "400px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 32,
            fontWeight: 700,
            color: "#c9a84c",
            marginBottom: 12,
            letterSpacing: 4,
          }}
        >
          CLAN MAFIA
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "#6b5c3e",
            marginBottom: 32,
            letterSpacing: 1,
          }}
        >
          Panel de Administración
        </p>
        <button
          onClick={() => signIn("discord", { callbackUrl: "/admin" })}
          style={{
            width: "100%",
            padding: "14px 24px",
            background: "#5865F2",
            color: "#ffffff",
            border: "none",
            borderRadius: 6,
            fontFamily: "'Cinzel', serif",
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: 2,
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => {
            e.target.style.background = "#4752C4";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "#5865F2";
          }}
        >
          🎮 Iniciar sesión con Discord
        </button>
        <p
          style={{
            fontSize: 12,
            color: "#6b5c3e",
            marginTop: 24,
            lineHeight: 1.6,
          }}
        >
          Necesitas permisos de administrador para acceder a este panel
        </p>
      </div>
    </div>
  );
}
