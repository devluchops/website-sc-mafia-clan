"use client";

import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function VerifyEmailPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Manejar errores de URL
  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError === "token_missing") {
      setError("Link de verificación inválido (token faltante)");
    } else if (urlError === "token_invalid") {
      setError("Link de verificación expirado o inválido. Solicita uno nuevo.");
    } else if (urlError === "server_error") {
      setError("Error del servidor. Intenta nuevamente.");
    }
  }, [searchParams]);

  // Redirect si no está autenticado
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error enviando verificación");
      }

      setMessage(
        "✅ Email de verificación enviado! Revisa tu bandeja de entrada y carpeta de spam."
      );
      setEmail("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p style={styles.loading}>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>🔐 Verificación de Email</h1>
          <p style={styles.subtitle}>
            Completa tu registro para acceder al sitio
          </p>
        </div>

        {/* User Info */}
        {session && (
          <div style={styles.userInfo}>
            <p style={styles.userName}>
              <strong>Usuario:</strong> {session.user.name}
            </p>
            <p style={styles.userDiscord}>
              <strong>Discord:</strong> {session.user.discordUsername}
            </p>
          </div>
        )}

        {/* Instrucciones */}
        <div style={styles.instructions}>
          <p>
            Para garantizar la seguridad y calidad de nuestra comunidad,
            necesitamos verificar tu dirección de email.
          </p>
          <p>
            <strong>Ingresa tu email</strong> y te enviaremos un link de
            verificación.
          </p>
        </div>

        {/* Mensajes */}
        {message && (
          <div style={styles.successMessage}>
            <p>{message}</p>
          </div>
        )}

        {error && (
          <div style={styles.errorMessage}>
            <p>{error}</p>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>
              Email *
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu-email@ejemplo.com"
              style={styles.input}
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="phone" style={styles.label}>
              Teléfono (Opcional)
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+51 966 346 424"
              style={styles.input}
              disabled={loading}
            />
            <p style={styles.hint}>
              Opcional: Puedes agregar tu número con código de país
            </p>
          </div>

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar Código de Verificación"}
          </button>
        </form>

        {/* Información adicional */}
        <div style={styles.info}>
          <p style={styles.infoTitle}>📬 ¿Qué sucederá después?</p>
          <ul style={styles.infoList}>
            <li>Recibirás un email con un link de verificación</li>
            <li>Haz click en el link para verificar tu cuenta</li>
            <li>Tendrás acceso completo al sitio del clan</li>
            <li>El link expira en 24 horas</li>
          </ul>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p>
            ¿No recibiste el email?{" "}
            <span style={styles.link} onClick={() => setMessage("")}>
              Revisa tu carpeta de spam
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0a0a0a 0%, #1e1b18 100%)",
    padding: "20px",
  },
  card: {
    maxWidth: "600px",
    width: "100%",
    backgroundColor: "#1e1b18",
    border: "1px solid #3d3525",
    borderRadius: "12px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#252220",
    padding: "40px 30px",
    textAlign: "center",
    borderBottom: "2px solid #c9a84c",
  },
  title: {
    color: "#c9a84c",
    fontSize: "32px",
    margin: "0 0 10px 0",
    fontFamily: "Cinzel, serif",
    letterSpacing: "3px",
    fontWeight: 700,
  },
  subtitle: {
    color: "#8b7b5e",
    fontSize: "16px",
    margin: 0,
  },
  userInfo: {
    backgroundColor: "#252220",
    padding: "16px 30px",
    borderBottom: "1px solid #3d3525",
  },
  userName: {
    color: "#e8dcc0",
    margin: "8px 0",
    fontSize: "14px",
  },
  userDiscord: {
    color: "#e8dcc0",
    margin: "8px 0",
    fontSize: "14px",
  },
  instructions: {
    padding: "30px",
    color: "#e8dcc0",
    lineHeight: "1.6",
    fontSize: "15px",
  },
  form: {
    padding: "0 30px 30px",
  },
  formGroup: {
    marginBottom: "24px",
  },
  label: {
    display: "block",
    color: "#c9a84c",
    fontSize: "14px",
    fontWeight: 600,
    marginBottom: "8px",
    letterSpacing: "1px",
    textTransform: "uppercase",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    backgroundColor: "#252220",
    border: "1px solid #3d3525",
    borderRadius: "6px",
    color: "#e8dcc0",
    fontSize: "16px",
    outline: "none",
    transition: "border-color 0.3s",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "16px",
    backgroundColor: "#c9a84c",
    color: "#1e1b18",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: 700,
    letterSpacing: "2px",
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  successMessage: {
    backgroundColor: "#1a3d1a",
    border: "1px solid #2d5f2d",
    borderLeft: "4px solid #4ade80",
    padding: "16px",
    margin: "0 30px 20px",
    borderRadius: "6px",
    color: "#86efac",
  },
  errorMessage: {
    backgroundColor: "#3d1a1a",
    border: "1px solid #5f2d2d",
    borderLeft: "4px solid #ef4444",
    padding: "16px",
    margin: "0 30px 20px",
    borderRadius: "6px",
    color: "#fca5a5",
  },
  info: {
    backgroundColor: "#252220",
    padding: "24px 30px",
    borderTop: "1px solid #3d3525",
  },
  infoTitle: {
    color: "#c9a84c",
    fontSize: "16px",
    fontWeight: 600,
    marginBottom: "12px",
  },
  infoList: {
    color: "#e8dcc0",
    paddingLeft: "20px",
    margin: 0,
    lineHeight: "1.8",
  },
  footer: {
    padding: "20px 30px",
    textAlign: "center",
    color: "#8b7b5e",
    fontSize: "14px",
    borderTop: "1px solid #3d3525",
  },
  link: {
    color: "#c9a84c",
    cursor: "pointer",
    textDecoration: "underline",
  },
  loading: {
    textAlign: "center",
    color: "#c9a84c",
    fontSize: "18px",
    padding: "60px",
  },
  hint: {
    color: "#8b7b5e",
    fontSize: "12px",
    marginTop: "6px",
    marginBottom: "0",
  },
};
