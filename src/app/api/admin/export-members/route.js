import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import * as XLSX from "xlsx";

export async function GET(request) {
  const session = await getServerSession(authOptions);

  // Verificar autenticación y permisos
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!session.user?.permissions?.is_admin && !session.user?.permissions?.can_manage_members) {
    return NextResponse.json({ error: "No tienes permisos para exportar miembros" }, { status: 403 });
  }

  try {
    const sql = getDb();

    // Obtener todos los miembros
    const members = await sql`
      SELECT
        id,
        name,
        email,
        social_discord,
        discord_id,
        main_race,
        races_played,
        rank,
        level_rank,
        protoss_level,
        terran_level,
        zerg_level,
        mmr,
        avatar,
        birth_date,
        join_date,
        about_me,
        social_facebook,
        social_instagram,
        social_twitter,
        social_kick,
        social_twitch,
        social_tiktok,
        social_youtube,
        last_login_at,
        email_verified,
        created_at,
        updated_at
      FROM members
      ORDER BY rank, name
    `;

    // Formatear datos para Excel
    const excelData = members.map(member => ({
      'ID': member.id,
      'Nombre': member.name,
      'Email': member.email || '',
      'Discord': member.social_discord || '',
      'Discord ID': member.discord_id || '',
      'Raza Principal': member.main_race || '',
      'Razas Jugadas': member.races_played || '',
      'Rango': member.rank || '',
      'Nivel General': member.level_rank || '',
      'Nivel Protoss': member.protoss_level || '',
      'Nivel Terran': member.terran_level || '',
      'Nivel Zerg': member.zerg_level || '',
      'MMR': member.mmr || 0,
      'Avatar URL': member.avatar || '',
      'Fecha Nacimiento': member.birth_date ? new Date(member.birth_date).toLocaleDateString('es-ES') : '',
      'Fecha Ingreso': member.join_date ? new Date(member.join_date).toLocaleDateString('es-ES') : '',
      'Sobre Mí': member.about_me || '',
      'Facebook': member.social_facebook || '',
      'Instagram': member.social_instagram || '',
      'Twitter': member.social_twitter || '',
      'Kick': member.social_kick || '',
      'Twitch': member.social_twitch || '',
      'TikTok': member.social_tiktok || '',
      'YouTube': member.social_youtube || '',
      'Último Login': member.last_login_at ? new Date(member.last_login_at).toLocaleString('es-ES') : '',
      'Email Verificado': member.email_verified ? 'Sí' : 'No',
      'Fecha Creación': member.created_at ? new Date(member.created_at).toLocaleString('es-ES') : '',
      'Última Actualización': member.updated_at ? new Date(member.updated_at).toLocaleString('es-ES') : '',
    }));

    // Crear libro de Excel
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Miembros");

    // Ajustar ancho de columnas
    const maxWidths = {};
    excelData.forEach(row => {
      Object.keys(row).forEach(key => {
        const value = String(row[key] || '');
        maxWidths[key] = Math.max(maxWidths[key] || 10, Math.min(value.length + 2, 50));
      });
    });

    worksheet['!cols'] = Object.keys(excelData[0] || {}).map(key => ({
      wch: maxWidths[key] || 10
    }));

    // Generar archivo Excel como buffer
    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Generar nombre de archivo con fecha actual
    const date = new Date().toISOString().split('T')[0];
    const filename = `miembros-clan-mafia-${date}.xlsx`;

    // Retornar archivo como descarga
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting members:", error);
    return NextResponse.json({
      error: "Error al exportar miembros",
      details: error.message
    }, { status: 500 });
  }
}
