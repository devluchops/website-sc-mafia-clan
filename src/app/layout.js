import "./globals.css";
import SessionProvider from "@/components/SessionProvider";

export const metadata = {
  title: "Clan MAFIA — StarCraft",
  description: "El mejor clan del StarCraft en mapa Fastest. Sitio oficial del Clan MAFIA.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logo.png", sizes: "any" },
    ],
    shortcut: "/favicon.svg",
    apple: "/logo.png",
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
