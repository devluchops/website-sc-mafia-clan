import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!file) {
      return NextResponse.json({ error: "No se envió ningún archivo" }, { status: 400 });
    }

    // Generar nombre único para la imagen
    const timestamp = Date.now();
    const originalName = file.name.toLowerCase().replace(/\s+/g, '-');
    const fileName = `post-${timestamp}-${originalName}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Crear directorio posts si no existe
    const postsDir = path.join(process.cwd(), "public", "posts");
    try {
      await mkdir(postsDir, { recursive: true });
    } catch (err) {
      // Directorio ya existe, continuar
    }

    // Guardar archivo
    const filePath = path.join(postsDir, fileName);
    await writeFile(filePath, buffer);

    // Retornar la ruta pública
    const publicPath = `/posts/${fileName}`;

    return NextResponse.json({ success: true, image: publicPath });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
