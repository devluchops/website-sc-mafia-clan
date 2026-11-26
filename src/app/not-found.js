import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        textAlign: "center",
        padding: 24,
      }}
    >
      <h1 style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 72, color: "#ffc24e", margin: 0, letterSpacing: 2 }}>
        404
      </h1>
      <p style={{ color: "#8690a6", fontSize: 16 }}>Esta página no existe.</p>
      <Link
        href="/"
        style={{
          fontFamily: "'Oxanium', sans-serif",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 1,
          color: "#0b0c12",
          background: "linear-gradient(135deg, #ffd87a, #ffc24e)",
          padding: "10px 20px",
          borderRadius: 6,
          textDecoration: "none",
        }}
      >
        Volver al inicio
      </Link>
    </div>
  );
}
