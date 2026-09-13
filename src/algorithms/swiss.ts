// ============================================================================
// Algoritmo Sistema Svizzero (Swiss System) per Tornei di Burraco
// ============================================================================

import type { Match, Round, Team, Tournament } from '../models/types';
import type { TournamentEngine, ValidationResult } from './types';
import { generateId } from '../utils/id';
import { calculateStandings } from '../services/standingsService';

/**
 * Raccoglie l'insieme delle coppie che si sono già affrontate nei round precedenti.
 */
export function getPreviousMatchupKeys(rounds: Round[]): Set<string> {
  const met = new Set<string>();
  for (const round of rounds) {
    for (const match of round.matches) {
      if (match.teamBId !== null) {
        const key = [match.teamAId, match.teamBId].sort().join('__vs__');
        met.add(key);
      }
    }
  }
  return met;
}

/**
 * Raccoglie gli ID delle coppie che hanno già ricevuto un BYE nei round precedenti.
 */
export function getTeamsWithPreviousBye(rounds: Round[]): Set<string> {
  const byeTeams = new Set<string>();
  for (const round of rounds) {
    for (const match of round.matches) {
      if (match.teamBId === null) {
        byeTeams.add(match.teamAId);
      }
    }
  }
  return byeTeams;
}

/**
 * Esegue il pairing ricorsivo con backtracking per trovare abbinamenti validi
 * evitando re-match e minimizzando la distanza di ranking.
 */
function findPairingsBacktrack(
  availableTeams: Team[],
  previousMatchups: Set<string>
): [Team, Team][] | null {
  if (availableTeams.length === 0) return [];
  if (availableTeams.length % 2 !== 0) return null;

  const current = availableTeams[0];
  const candidates = availableTeams.slice(1);

  // Prova i candidati in ordine di classifica (i più vicini per primi)
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    const key = [current.id, candidate.id].sort().join('__vs__');

    if (!previousMatchups.has(key)) {
      const remaining = candidates.filter((_, idx) => idx !== i);
      const subResult = findPairingsBacktrack(remaining, previousMatchups);
      if (subResult !== null) {
        return [[current, candidate], ...subResult];
      }
    }
  }

  return null;
}

/**
 * Fallback: accoppia in ordine di classifica anche se si ripete un incontro,
 * nel caso estremo in cui non sia possibile evitare il rematch.
 */
function findPairingsFallback(teams: Team[]): [Team, Team][] {
  const pairs: [Team, Team][] = [];
  for (let i = 0; i < teams.length; i += 2) {
    if (i + 1 < teams.length) {
      pairs.push([teams[i], teams[i + 1]]);
    }
  }
  return pairs;
}

/**
 * Genera gli incontri per un determinato round del Sistema Svizzero.
 */
export function generateSwissRound(
  tournament: Tournament,
  roundNumber: number
): Match[] {
  const { teams, rounds } = tournament;
  const roundId = generateId();

  if (teams.length < 2) return [];

  // Round 1: Abbinamento casuale iniziale
  if (roundNumber === 1 || rounds.length === 0) {
    const shuffled = [...teams];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const matches: Match[] = [];
    let tableCounter = 1;

    // Se dispari, l'ultima squadra riceve il BYE
    const isOdd = shuffled.length % 2 !== 0;
    const playingTeams = isOdd ? shuffled.slice(0, shuffled.length - 1) : shuffled;

    for (let i = 0; i < playingTeams.length; i += 2) {
      matches.push({
        id: generateId(),
        roundId,
        table: tableCounter++,
        teamAId: playingTeams[i].id,
        teamBId: playingTeams[i + 1].id,
        scoreA: null,
        scoreB: null,
        status: 'pending',
      });
    }

    if (isOdd) {
      const byeTeam = shuffled[shuffled.length - 1];
      matches.push({
        id: generateId(),
        roundId,
        table: 0,
        teamAId: byeTeam.id,
        teamBId: null,
        scoreA: null,
        scoreB: null,
        status: 'pending',
      });
    }

    return matches;
  }

  // Round successivi: Abbinamento basato sulla classifica live
  const standings = calculateStandings(tournament);
  // Ordina le squadre secondo la classifica attuale (dal 1° all'ultimo)
  const rankedTeams: Team[] = standings
    .map((s) => teams.find((t) => t.id === s.teamId))
    .filter((t): t is Team => t !== undefined);

  const previousMatchups = getPreviousMatchupKeys(rounds);
  const teamsWithBye = getTeamsWithPreviousBye(rounds);

  const isOdd = rankedTeams.length % 2 !== 0;
  let byeTeam: Team | null = null;
  let activeTeams = [...rankedTeams];

  if (isOdd) {
    // Assegna il BYE alla squadra con ranking più basso che non ha ancora riposato
    for (let i = rankedTeams.length - 1; i >= 0; i--) {
      if (!teamsWithBye.has(rankedTeams[i].id)) {
        byeTeam = rankedTeams[i];
        activeTeams = rankedTeams.filter((t) => t.id !== byeTeam!.id);
        break;
      }
    }
    // Se tutte hanno già avuto un BYE (torneo molto lungo), prendi l'ultima in classifica
    if (!byeTeam) {
      byeTeam = rankedTeams[rankedTeams.length - 1];
      activeTeams = rankedTeams.slice(0, rankedTeams.length - 1);
    }
  }

  // Trova gli abbinamenti ottimali evitando rematch
  let pairings = findPairingsBacktrack(activeTeams, previousMatchups);
  if (!pairings) {
    pairings = findPairingsFallback(activeTeams);
  }

  const matches: Match[] = [];
  let tableCounter = 1;

  for (const [tA, tB] of pairings) {
    matches.push({
      id: generateId(),
      roundId,
      table: tableCounter++,
      teamAId: tA.id,
      teamBId: tB.id,
      scoreA: null,
      scoreB: null,
      status: 'pending',
    });
  }

  if (byeTeam) {
    matches.push({
      id: generateId(),
      roundId,
      table: 0,
      teamAId: byeTeam.id,
      teamBId: null,
      scoreA: null,
      scoreB: null,
      status: 'pending',
    });
  }

  return matches;
}

/**
 * Implementazione dell'interfaccia TournamentEngine per Sistema Svizzero.
 */
export const swissEngine: TournamentEngine = {
  id: 'swiss',
  name: 'Sistema Svizzero',
  description: 'Abbinamenti progressivi basati sulla classifica, evitando ripetizioni.',
  requiresSequentialRounds: true,

  suggestRounds(teamCount: number): number {
    if (teamCount <= 3) return 2;
    if (teamCount <= 5) return 3; // 5 coppie -> 3 round (Sezione 21)
    if (teamCount <= 10) return 4;
    return 5;
  },

  validate(tournament: Tournament): ValidationResult {
    const errors: string[] = [];
    if (tournament.teams.length < 2) {
      errors.push('Il Sistema Svizzero richiede almeno 2 coppie.');
    }
    if (tournament.config.totalRounds < 1) {
      errors.push('Il numero di round deve essere di almeno 1.');
    }
    return {
      valid: errors.length === 0,
      errors,
    };
  },

  generateRound(tournament: Tournament, roundNumber: number): Match[] {
    return generateSwissRound(tournament, roundNumber);
  },
};
