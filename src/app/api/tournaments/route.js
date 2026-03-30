import { NextResponse } from "next/server";
import { getTournaments, getTournament } from "@/lib/challonge";

// GET: Obtener torneos públicos
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get('id');
    const state = searchParams.get('state') || 'all'; // pending, in_progress, ended, all

    if (tournamentId) {
      // Obtener un torneo específico
      const tournament = await getTournament(tournamentId);
      return NextResponse.json(tournament);
    } else {
      // Obtener todos los torneos
      const options = {};
      if (state !== 'all') {
        options.state = state;
      }

      const tournaments = await getTournaments(options);

      // Filtrar solo torneos activos o próximos para mostrar en el sitio
      const activeTournaments = tournaments.filter(t => {
        const tournament = t.tournament;
        return tournament.state === 'pending' ||
               tournament.state === 'underway' ||
               tournament.state === 'awaiting_review';
      });

      return NextResponse.json(activeTournaments);
    }
  } catch (error) {
    console.error('Error fetching public tournaments:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Error al obtener torneos', details: error.message },
      { status: 500 }
    );
  }
}
