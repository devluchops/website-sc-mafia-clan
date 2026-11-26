import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import PwaRegister from "@/components/PwaRegister";
import InstallBanner from "@/components/InstallBanner";

// El sitio es dinámico (auth + base de datos); evitamos el prerender estático
// que rompía el build (useContext null en /, /admin, /login, /404, etc.).
export const dynamic = "force-dynamic";

export const metadata = {
  metadataBase: new URL("https://clanmafia.devluchops.space"),
  title: "Clan MAFIA — StarCraft",
  description: "El mejor clan del StarCraft en mapa Fastest. Sitio oficial del Clan MAFIA.",
  manifest: "/manifest.json",
  applicationName: "Clan MAFIA",
  openGraph: {
    title: "Clan MAFIA — StarCraft Fastest",
    description: "El mejor clan de StarCraft en mapa Fastest. Showmatches, eventos y la familia MAFIA.",
    url: "https://clanmafia.devluchops.space",
    siteName: "Clan MAFIA",
    images: [{ url: "/logo.png", width: 885, height: 852, alt: "Clan MAFIA" }],
    locale: "es_PE",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Clan MAFIA — StarCraft Fastest",
    description: "El mejor clan de StarCraft en mapa Fastest.",
    images: ["/logo.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Clan MAFIA",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logo.png", sizes: "any" },
    ],
    shortcut: "/favicon.svg",
    apple: "/logo.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#090a0f",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <SessionProvider>{children}</SessionProvider>
        <PwaRegister />
        <InstallBanner />
      </body>
    </html>
  );
}
