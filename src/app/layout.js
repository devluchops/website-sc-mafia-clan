import "./globals.css";

export const metadata = {
  title: "Clan MAFIA — StarCraft",
  description: "En la sombra dominamos el mapa. Sitio oficial del Clan MAFIA de StarCraft.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
