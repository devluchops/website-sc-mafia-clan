import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { put } from "@vercel/blob";

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // Verificar que BLOB_READ_WRITE_TOKEN esté configurado
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("BLOB_READ_WRITE_TOKEN no está configurado");
      return NextResponse.json({
        error: "Vercel Blob Storage no está configurado. Configura BLOB_READ_WRITE_TOKEN en las variables de entorno."
      }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get("image");

    if (!file) {
      return NextResponse.json({ error: "No se envió ningún archivo" }, { status: 400 });
    }

    // Generar nombre único para la imagen
    const timestamp = Date.now();
    const originalName = file.name.toLowerCase().replace(/\s+/g, '-');
    const fileName = `posts/post-${timestamp}-${originalName}`;

    console.log(`Subiendo imagen: ${fileName}, tamaño: ${file.size} bytes`);

    // Subir a Vercel Blob Storage
    const blob = await put(fileName, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    console.log(`Imagen subida exitosamente: ${blob.url}`);

    // Retornar la URL pública del blob
    return NextResponse.json({ success: true, image: blob.url });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json({
      error: `Error al subir imagen: ${error.message}`,
      details: error.toString()
    }, { status: 500 });
  }
}
