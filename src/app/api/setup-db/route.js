import { NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import * as clanData from "@/data/clan-data";

// Esta ruta inicializa la base de datos
// Solo necesitas llamarla UNA VEZ después de configurar Neon
export async function GET() {
  try {
    const sql = getDb();

    // Crear tablas
    await schema.createTables(sql);

    // Poblar con datos iniciales del archivo
    await schema.seedData(sql, {
      CLAN: clanData.CLAN,
      MEMBERS: clanData.MEMBERS,
      POSTS: clanData.POSTS,
      VIDEOS: clanData.VIDEOS,
      EVENTS: clanData.EVENTS,
    });

    return NextResponse.json({
      success: true,
      message: "Base de datos configurada correctamente",
    });
  } catch (error) {
    console.error("Error al configurar DB:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
