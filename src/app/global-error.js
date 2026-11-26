"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html lang="es">
      <body
        style={{
          background: "#090a0f",
          color: "#eef1f8",
          fontFamily: "system-ui, sans-serif",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          textAlign: "center",
          padding: 24,
          margin: 0,
        }}
      >
        <h1 style={{ fontSize: 40, color: "#ffc24e", margin: 0 }}>Algo salió mal</h1>
        <p style={{ color: "#8690a6" }}>Ocurrió un error inesperado.</p>
        <button
          onClick={() => reset()}
          style={{
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 1,
            color: "#0b0c12",
            background: "linear-gradient(135deg, #ffd87a, #ffc24e)",
            padding: "10px 20px",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
          }}
        >
          Reintentar
        </button>
      </body>
    </html>
  );
}
