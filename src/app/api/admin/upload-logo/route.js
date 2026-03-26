import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("logo");

    if (!file) {
      return NextResponse.json({ error: "No se encontró el archivo" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Guardar como logo.png en la carpeta public
    const filePath = path.join(process.cwd(), "public", "logo.png");
    await writeFile(filePath, buffer);

    return NextResponse.json({ success: true, message: "Logo subido correctamente" });
  } catch (error) {
    console.error("Error al subir logo:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
