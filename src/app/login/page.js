"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showVerified, setShowVerified] = useState(false);

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      setShowVerified(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === "authenticated") {
      // Redirigir a admin solo si tiene permisos, sino a la página principal
      const hasAdminAccess = session?.user?.permissions?.is_admin ||
                            session?.user?.permissions?.can_manage_members ||
                            session?.user?.permissions?.can_publish_blog ||
                            session?.user?.permissions?.can_publish_videos ||
                            session?.user?.permissions?.can_publish_events ||
                            session?.user?.permissions?.can_edit_rules ||
                            session?.user?.permissions?.can_manage_permissions;

      router.push(hasAdminAccess ? "/admin" : "/");
    }
  }, [status, router, session]);

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
          Iniciar Sesión
        </p>
        {showVerified && (
          <div
            style={{
              background: "rgba(76, 201, 76, 0.15)",
              border: "1px solid #4CAF50",
              borderRadius: 6,
              padding: "12px 16px",
              marginBottom: 24,
              color: "#4CAF50",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            ✓ Email verificado exitosamente
          </div>
        )}
        <button
          onClick={() => signIn("discord", { callbackUrl: "/" })}
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
          Inicia sesión para acceder al sitio y comentar en publicaciones
        </p>
      </div>
    </div>
  );
}
