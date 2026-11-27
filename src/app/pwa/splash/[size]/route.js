import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";
import { IOS_SPLASH_SCREENS, PWA_BACKGROUND, PWA_GOLD, PWA_MUTED, splashSize } from "@/lib/pwa";

/**
 * GET /pwa/splash/1290x2796 -> la pantalla de arranque del iPhone para ese tamaño.
 *
 * Fondo oscuro, el logo del clan, "CLAN MAFIA" y "Cargando…": es lo que iOS muestra
 * mientras abre la app instalada, en vez de la pantalla negra. Una por modelo
 * (`IOS_SPLASH_SCREENS` de `src/lib/pwa.js`). Se generan en el build y se sirven como
 * archivos; cualquier otro tamaño, 404.
 */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return IOS_SPLASH_SCREENS.map((s) => ({ size: splashSize(s) }));
}

export async function GET(_request, { params }) {
  const [width, height] = params.size.split("x").map(Number);
  // Todo se mide con el ancho, para que se vea igual en cada modelo.
  const mark = Math.round(width * 0.28);

  const logo = await readFile(join(process.cwd(), "public", "logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: PWA_BACKGROUND,
        }}
      >
        <img
          src={logoSrc}
          width={mark}
          height={mark}
          style={{ objectFit: "contain", filter: `drop-shadow(0 0 ${Math.round(mark * 0.12)}px rgba(255,194,78,0.35))` }}
        />
        <div
          style={{
            display: "flex",
            marginTop: Math.round(width * 0.07),
            fontSize: Math.round(width * 0.085),
            fontWeight: 800,
            letterSpacing: Math.round(width * 0.006),
          }}
        >
          <span style={{ color: "#ffffff" }}>CLAN&nbsp;</span>
          <span style={{ color: PWA_GOLD }}>MAFIA</span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: Math.round(width * 0.035),
            fontSize: Math.round(width * 0.04),
            color: PWA_MUTED,
          }}
        >
          Cargando…
        </div>
      </div>
    ),
    { width, height },
  );
}
