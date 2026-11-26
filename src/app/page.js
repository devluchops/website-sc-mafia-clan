import PageClient from "./page-client";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// SSR: traemos los datos en el servidor para que el HTML inicial tenga
// contenido real (SEO + sin "Cargando...").
async function getInitialData() {
  try {
    const h = headers();
    const host = h.get("host");
    if (!host) return null;
    const proto = h.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const res = await fetch(`${proto}://${host}/api/clan`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch (_e) {
    return null;
  }
}

export default async function Page() {
  const initialData = await getInitialData();
  return <PageClient initialData={initialData} />;
}
