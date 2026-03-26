import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Octokit } from "@octokit/rest";
import { NextResponse } from "next/server";

// GET: Obtener datos actuales
export async function GET() {
  try {
    // Importar los datos actuales del módulo
    const clanData = await import("@/data/clan-data");

    return NextResponse.json({
      CLAN: clanData.CLAN,
      MEMBERS: clanData.MEMBERS,
      POSTS: clanData.POSTS,
      VIDEOS: clanData.VIDEOS,
      EVENTS: clanData.EVENTS,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Actualizar datos del clan
export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, tagline } = body;

    // Configurar Octokit con el token de GitHub
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    const [owner, repo] = process.env.GITHUB_REPO.split("/");
    const path = "src/data/clan-data.js";

    // Obtener el contenido actual del archivo
    const { data: fileData } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    // Decodificar el contenido actual
    const currentContent = Buffer.from(fileData.content, "base64").toString();

    // Actualizar solo la sección CLAN
    const updatedContent = currentContent.replace(
      /export const CLAN = \{[\s\S]*?\};/,
      `export const CLAN = {
  name: "${name}",
  tagline: "${tagline}",
  // Pon tu logo en la carpeta /public y referencia como "/logo.png"
  logo: "/logo.png",
};`
    );

    // Actualizar el archivo en GitHub
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `Actualizar información del clan: ${name}`,
      content: Buffer.from(updatedContent).toString("base64"),
      sha: fileData.sha,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al actualizar:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
