// ============================================================================
// Algoritmo Eliminazione Diretta (Knockout Tournament Engine)
// ============================================================================

import type { Match, Team, Tournament } from '../models/types';
import type { TournamentEngine, ValidationResult } from './types';
import { generateId } from '../utils/id';

/**
 * Calcola la potenza di 2 successiva o uguale a n (es. 5 -> 8, 8 -> 8).
 */
export function nextPowerOfTwo(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

/**
 * Calcola il nome descrittivo del turno a eliminazione diretta in base al numero di match.
 */
export function getKnockoutRoundName(remainingMatches: number): string {
  switch (remainingMatches) {
    case 1:
      return 'Finale';
    case 2:
      return 'Semifinali';
    case 4:
      return 'Quarti di Finale';
    case 8:
      return 'Ottavi di Finale';
    default:
      return `Turno Preliminare`;
  }
}

/**
 * Genera il primo round di un torneo ad eliminazione diretta,
 * gestendo i BYE se il numero di coppie non è una potenza di 2.
 */
export function generateKnockoutFirstRound(teams: Team[]): Match[] {
  const n = teams.length;
  if (n < 2) return [];

  const roundId = generateId();
  const targetBracketSize = nextPowerOfTwo(n); // es. 4, 8, 16...
  const byesCount = targetBracketSize - n; // quante squadre saltano il turno preliminare
  const preliminaryMatchesCount = n - byesCount; // quante squadre giocano subito

  // Mescola le squadre per l'abbinamento iniziale
  const shuffled = [...teams];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const matches: Match[] = [];
  let tableCounter = 1;

  // Le prime squadre che devono disputare il turno preliminare
  for (let i = 0; i < preliminaryMatchesCount; i += 2) {
    matches.push({
      id: generateId(),
      roundId,
      table: tableCounter++,
      teamAId: shuffled[i].id,
      teamBId: shuffled[i + 1].id,
      scoreA: null,
      scoreB: null,
      status: 'pending',
    });
  }

  // Le squadre che ricevono il BYE e passano direttamente al turno successivo
  for (let i = preliminaryMatchesCount; i < n; i++) {
    matches.push({
      id: generateId(),
      roundId,
      table: 0,
      teamAId: shuffled[i].id,
      teamBId: null,
      scoreA: null,
      scoreB: null,
      status: 'confirmed', // I BYE sono già confermati
    });
  }

  return matches;
}

/**
 * Genera il round successivo ad eliminazione diretta raccogliendo i vincitori del round precedente.
 */
export function generateKnockoutNextRound(
  tournament: Tournament,
  nextRoundNumber: number
): Match[] {
  const prevRound = tournament.rounds.find((r) => r.number === nextRoundNumber - 1);
  if (!prevRound || !prevRound.completed) return [];

  // Raccogli i vincitori di tutti i match del round precedente
  const winners: string[] = [];
  for (const match of prevRound.matches) {
    if (match.teamBId === null) {
      // Squadra con BYE avanza
      winners.push(match.teamAId);
    } else if (match.status === 'confirmed') {
      if (match.scoreA !== null && match.scoreB !== null) {
        if (match.scoreA >= match.scoreB) {
          winners.push(match.teamAId);
        } else {
          winners.push(match.teamBId);
        }
      }
    }
  }

  if (winners.length < 2) return [];

  const roundId = generateId();
  const matches: Match[] = [];
  let tableCounter = 1;

  for (let i = 0; i < winners.length; i += 2) {
    if (i + 1 < winners.length) {
      matches.push({
        id: generateId(),
        roundId,
        table: tableCounter++,
        teamAId: winners[i],
        teamBId: winners[i + 1],
        scoreA: null,
        scoreB: null,
        status: 'pending',
      });
    } else {
      // Nel raro caso di numero dispari rimanente, assegna BYE
      matches.push({
        id: generateId(),
        roundId,
        table: 0,
        teamAId: winners[i],
        teamBId: null,
        scoreA: null,
        scoreB: null,
        status: 'confirmed',
      });
    }
  }

  return matches;
}

/**
 * Implementazione dell'interfaccia TournamentEngine per Eliminazione Diretta.
 */
export const knockoutEngine: TournamentEngine = {
  id: 'knockout',
  name: 'Eliminazione Diretta',
  description: 'Chi vince avanza: quarti, semifinali e finale.',
  requiresSequentialRounds: true,

  suggestRounds(teamCount: number): number {
    if (teamCount < 2) return 1;
    return Math.ceil(Math.log2(teamCount));
  },

  validate(tournament: Tournament): ValidationResult {
    const errors: string[] = [];
    if (tournament.teams.length < 2) {
      errors.push("L'Eliminazione Diretta richiede almeno 2 coppie.");
    }
    return {
      valid: errors.length === 0,
      errors,
    };
  },

  generateRound(tournament: Tournament, roundNumber: number): Match[] {
    if (roundNumber === 1 || tournament.rounds.length === 0) {
      return generateKnockoutFirstRound(tournament.teams);
    }
    return generateKnockoutNextRound(tournament, roundNumber);
  },
};
