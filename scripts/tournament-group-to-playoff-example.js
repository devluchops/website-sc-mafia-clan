/**
 * Script de ejemplo para manejar torneos con fase de grupos + playoffs
 *
 * Flujo:
 * 1. Crear torneo de grupos (Round Robin)
 * 2. Los jugadores compiten en grupos
 * 3. Obtener clasificados (top 2 de cada grupo)
 * 4. Crear torneo de playoffs
 * 5. Agregar clasificados al torneo de playoffs
 * 6. Iniciar playoffs
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function createGroupStageTournament() {
  const response = await fetch(`${SITE_URL}/api/admin/tournaments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'create',
      tournamentData: {
        name: 'CopaMAFIA2025 - Fase de Grupos',
        tournament_type: 'round robin',
        url: 'copamafia2025-grupos',
        description: 'Fase de grupos - clasifican los 2 primeros',
        open_signup: false
      }
    })
  });

  return response.json();
}

async function getGroupStageQualifiers(tournamentId) {
  // Obtener participantes con sus estadísticas finales
  const response = await fetch(
    `${SITE_URL}/api/admin/tournaments?id=${tournamentId}&participants=true`
  );

  const participants = await response.json();

  // Ordenar por posición final (o por wins/losses)
  const sorted = participants
    .map(p => p.participant)
    .sort((a, b) => {
      // Ordenar por final_rank o por wins
      if (a.final_rank && b.final_rank) {
        return a.final_rank - b.final_rank;
      }
      return (b.wins || 0) - (a.wins || 0);
    });

  // Tomar los primeros 2 (o N según configuración)
  const qualifiers = sorted.slice(0, 2);

  return qualifiers.map(p => ({
    name: p.name,
    seed: null, // Se asignará en playoffs según posición
    misc: `Clasificado de grupos - ${p.wins}W-${p.losses}L`
  }));
}

async function createPlayoffTournament() {
  const response = await fetch(`${SITE_URL}/api/admin/tournaments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'create',
      tournamentData: {
        name: 'CopaMAFIA2025 - Playoffs',
        tournament_type: 'single elimination',
        url: 'copamafia2025-playoffs',
        description: 'Fase eliminatoria - clasificados de grupos',
        open_signup: false,
        hold_third_place_match: true // Match por 3er lugar
      }
    })
  });

  return response.json();
}

async function addQualifiersToPlayoffs(playoffTournamentId, qualifiers) {
  const response = await fetch(`${SITE_URL}/api/admin/tournaments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'bulk_add_participants',
      tournamentId: playoffTournamentId,
      participants: qualifiers
    })
  });

  return response.json();
}

async function startPlayoffTournament(tournamentId) {
  const response = await fetch(`${SITE_URL}/api/admin/tournaments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'start',
      tournamentId
    })
  });

  return response.json();
}

async function finalizeGroupStage(tournamentId) {
  const response = await fetch(`${SITE_URL}/api/admin/tournaments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'finalize',
      tournamentId
    })
  });

  return response.json();
}

// Ejemplo de uso completo
async function main() {
  console.log('=== Creando torneo de grupos ===');
  const groupTournament = await createGroupStageTournament();
  console.log('Torneo de grupos creado:', groupTournament.tournament.tournament.url);

  // Aquí agregarías participantes y esperarías a que terminen los partidos
  // ...

  console.log('\n=== Finalizando fase de grupos ===');
  const finalizedGroups = await finalizeGroupStage(groupTournament.tournament.tournament.id);
  console.log('Fase de grupos finalizada');

  console.log('\n=== Obteniendo clasificados ===');
  const qualifiers = await getGroupStageQualifiers(groupTournament.tournament.tournament.id);
  console.log('Clasificados:', qualifiers.map(q => q.name));

  console.log('\n=== Creando torneo de playoffs ===');
  const playoffTournament = await createPlayoffTournament();
  console.log('Torneo de playoffs creado:', playoffTournament.tournament.tournament.url);

  console.log('\n=== Agregando clasificados a playoffs ===');
  const added = await addQualifiersToPlayoffs(
    playoffTournament.tournament.tournament.id,
    qualifiers
  );
  console.log('Clasificados agregados:', added.results.length);

  console.log('\n=== Iniciando playoffs ===');
  const started = await startPlayoffTournament(playoffTournament.tournament.tournament.id);
  console.log('Playoffs iniciados!');
}

// Descomentar para ejecutar
// main().catch(console.error);

export {
  createGroupStageTournament,
  getGroupStageQualifiers,
  createPlayoffTournament,
  addQualifiersToPlayoffs,
  startPlayoffTournament,
  finalizeGroupStage
};
