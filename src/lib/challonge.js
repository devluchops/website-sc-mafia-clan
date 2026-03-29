// Challonge API client
const CHALLONGE_API_KEY = process.env.CHALLONGE_API_KEY;
const CHALLONGE_USERNAME = process.env.CHALLONGE_USERNAME;
const CHALLONGE_API_BASE = 'https://api.challonge.com/v1';

/**
 * Fetch tournaments from Challonge
 * @param {Object} options - Query options
 * @returns {Promise<Array>} List of tournaments
 */
export async function getTournaments(options = {}) {
  const params = new URLSearchParams({
    api_key: CHALLONGE_API_KEY,
    ...options
  });

  const url = `${CHALLONGE_API_BASE}/tournaments.json?${params}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Challonge API error: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    throw error;
  }
}

/**
 * Get a specific tournament by ID
 * @param {string} tournamentId - Tournament ID or URL
 * @returns {Promise<Object>} Tournament details
 */
export async function getTournament(tournamentId) {
  const params = new URLSearchParams({
    api_key: CHALLONGE_API_KEY,
    include_participants: 1,
    include_matches: 1
  });

  const url = `${CHALLONGE_API_BASE}/tournaments/${tournamentId}.json?${params}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Challonge API error: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching tournament:', error);
    throw error;
  }
}

/**
 * Create a new tournament
 * @param {Object} tournamentData - Tournament configuration
 * @returns {Promise<Object>} Created tournament
 */
export async function createTournament(tournamentData) {
  const body = {
    api_key: CHALLONGE_API_KEY,
    tournament: {
      name: tournamentData.name,
      tournament_type: tournamentData.tournament_type || 'single elimination',
      url: tournamentData.url, // unique identifier
      description: tournamentData.description || '',
      open_signup: tournamentData.open_signup || false,
      hold_third_place_match: tournamentData.hold_third_place_match || false,
      pts_for_match_win: tournamentData.pts_for_match_win || '1.0',
      pts_for_match_tie: tournamentData.pts_for_match_tie || '0.5',
      pts_for_game_win: tournamentData.pts_for_game_win || '0.0',
      ...tournamentData
    }
  };

  const url = `${CHALLONGE_API_BASE}/tournaments.json`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Challonge API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating tournament:', error);
    throw error;
  }
}

/**
 * Delete a tournament
 * @param {string} tournamentId - Tournament ID or URL
 * @returns {Promise<Object>} Deletion confirmation
 */
export async function deleteTournament(tournamentId) {
  const params = new URLSearchParams({
    api_key: CHALLONGE_API_KEY
  });

  const url = `${CHALLONGE_API_BASE}/tournaments/${tournamentId}.json?${params}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Challonge API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting tournament:', error);
    throw error;
  }
}

/**
 * Start a tournament (starts accepting match results)
 * @param {string} tournamentId - Tournament ID or URL
 * @returns {Promise<Object>} Updated tournament
 */
export async function startTournament(tournamentId) {
  const params = new URLSearchParams({
    api_key: CHALLONGE_API_KEY
  });

  const url = `${CHALLONGE_API_BASE}/tournaments/${tournamentId}/start.json?${params}`;

  try {
    const response = await fetch(url, {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error(`Challonge API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error starting tournament:', error);
    throw error;
  }
}

/**
 * Add a participant to a tournament
 * @param {string} tournamentId - Tournament ID or URL
 * @param {Object} participant - Participant data
 * @returns {Promise<Object>} Created participant
 */
export async function addParticipant(tournamentId, participant) {
  const body = {
    api_key: CHALLONGE_API_KEY,
    participant: {
      name: participant.name,
      seed: participant.seed || null,
      misc: participant.misc || null
    }
  };

  const url = `${CHALLONGE_API_BASE}/tournaments/${tournamentId}/participants.json`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Challonge API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding participant:', error);
    throw error;
  }
}

/**
 * Get embed iframe code for a tournament
 * @param {string} tournamentUrl - Tournament URL identifier
 * @returns {string} Iframe HTML code
 */
export function getTournamentEmbed(tournamentUrl) {
  const username = CHALLONGE_USERNAME || 'challonge';
  return `<iframe src="https://challonge.com/${username}/${tournamentUrl}/module" width="100%" height="500" frameborder="0" scrolling="auto" allowtransparency="true"></iframe>`;
}
