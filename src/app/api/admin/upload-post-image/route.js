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
    const formData = await request.formData();
    const file = formData.get("image");

    if (!file) {
      return NextResponse.json({ error: "No se envió ningún archivo" }, { status: 400 });
    }

    // Generar nombre único para la imagen
    const timestamp = Date.now();
    const originalName = file.name.toLowerCase().replace(/\s+/g, '-');
    const fileName = `posts/post-${timestamp}-${originalName}`;

    // Subir a Vercel Blob Storage
    const blob = await put(fileName, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    // Retornar la URL pública del blob
    return NextResponse.json({ success: true, image: blob.url });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
