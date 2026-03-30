import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getTournaments,
  getTournament,
  createTournament,
  deleteTournament,
  startTournament,
  addParticipant,
  deleteParticipant,
  getMatches,
  updateMatch,
  getParticipants,
  bulkAddParticipants,
  finalizeTournament
} from "@/lib/challonge";

// GET: Obtener todos los torneos
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get('id');
    const getMatchesOnly = searchParams.get('matches');

    const getParticipantsOnly = searchParams.get('participants');

    if (tournamentId && getMatchesOnly === 'true') {
      // Obtener solo los matches de un torneo
      const matches = await getMatches(tournamentId);
      return NextResponse.json(matches);
    } else if (tournamentId && getParticipantsOnly === 'true') {
      // Obtener solo los participantes de un torneo (útil para fase de grupos)
      const participants = await getParticipants(tournamentId);
      return NextResponse.json(participants);
    } else if (tournamentId) {
      // Obtener un torneo específico con participantes y partidos
      const tournament = await getTournament(tournamentId);
      return NextResponse.json(tournament);
    } else {
      // Obtener todos los torneos
      const tournaments = await getTournaments();
      return NextResponse.json(tournaments);
    }
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener torneos' },
      { status: 500 }
    );
  }
}

// POST: Crear torneo o agregar participante
export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const permissions = session.user?.permissions;
  if (!permissions?.is_admin && !permissions?.can_publish_events) {
    return NextResponse.json(
      { error: "No tienes permisos para gestionar torneos" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { action, tournamentData, tournamentId, participant, participantId, matchId, matchData, participants } = body;

    if (action === 'create') {
      // Crear nuevo torneo
      const tournament = await createTournament(tournamentData);
      return NextResponse.json({
        success: true,
        tournament,
        message: 'Torneo creado correctamente'
      });
    } else if (action === 'start') {
      // Iniciar torneo
      const tournament = await startTournament(tournamentId);
      return NextResponse.json({
        success: true,
        tournament,
        message: 'Torneo iniciado correctamente'
      });
    } else if (action === 'add_participant') {
      // Agregar participante
      const result = await addParticipant(tournamentId, participant);
      return NextResponse.json({
        success: true,
        participant: result,
        message: 'Participante agregado correctamente'
      });
    } else if (action === 'delete_participant') {
      // Eliminar participante
      const result = await deleteParticipant(tournamentId, participantId);
      return NextResponse.json({
        success: true,
        message: 'Participante eliminado correctamente'
      });
    } else if (action === 'update_match') {
      // Actualizar resultado de un partido
      const result = await updateMatch(tournamentId, matchId, matchData);
      return NextResponse.json({
        success: true,
        match: result,
        message: 'Resultado actualizado correctamente'
      });
    } else if (action === 'bulk_add_participants') {
      // Agregar múltiples participantes (útil para copiar clasificados de grupos a playoffs)
      const results = await bulkAddParticipants(tournamentId, participants);
      return NextResponse.json({
        success: true,
        results,
        message: `${participants.length} participantes agregados`
      });
    } else if (action === 'finalize') {
      // Finalizar torneo (bloquea resultados finales)
      const tournament = await finalizeTournament(tournamentId);
      return NextResponse.json({
        success: true,
        tournament,
        message: 'Torneo finalizado correctamente'
      });
    } else {
      return NextResponse.json(
        { error: 'Acción no válida' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in tournament operation:', error);
    return NextResponse.json(
      { error: error.message || 'Error en la operación' },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar torneo
export async function DELETE(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const permissions = session.user?.permissions;
  if (!permissions?.is_admin && !permissions?.can_publish_events) {
    return NextResponse.json(
      { error: "No tienes permisos para eliminar torneos" },
      { status: 403 }
    );
  }

  try {
    const { tournamentId } = await request.json();
    await deleteTournament(tournamentId);

    return NextResponse.json({
      success: true,
      message: "Torneo eliminado correctamente",
    });
  } catch (error) {
    console.error('Error deleting tournament:', error);
    return NextResponse.json(
      { error: error.message || 'Error al eliminar torneo' },
      { status: 500 }
    );
  }
}
