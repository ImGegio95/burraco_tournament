// ============================================================================
// Algoritmo Round Robin (Tutti contro tutti)
// ============================================================================

import type { Match, Round, Team, Tournament } from '../models/types';
import type { TournamentEngine, ValidationResult } from './types';
import { generateId } from '../utils/id';


/**
 * Genera l'intero calendario Round Robin per una lista di squadre.
 * Utilizza il circle method (algoritmo di Berger).
 * 
 * @param teams - Lista delle squadre partecipanti
 * @param maxRounds - Numero massimo di round da generare (opzionale)
 * @returns Array di round con gli incontri generati
 */
export function generateRoundRobinSchedule(
  teams: Team[],
  maxRounds?: number
): { roundNumber: number; pairings: { teamA: Team; teamB: Team | null }[] }[] {
  const n = teams.length;
  if (n < 2) return [];

  // Se dispari, aggiungiamo una squadra fittizia BYE
  const isOdd = n % 2 !== 0;
  const teamList: (Team | null)[] = [...teams];
  if (isOdd) {
    teamList.push(null); // null rappresenta il BYE
  }

  const totalTeams = teamList.length; // sempre pari
  const roundsInCycle = totalTeams - 1;
  const roundsToGenerate = maxRounds ? Math.min(maxRounds, roundsInCycle) : roundsInCycle;
  const matchesPerRound = totalTeams / 2;

  // Indici delle squadre: 0 è fisso, 1..totalTeams-1 ruotano
  const indices: number[] = Array.from({ length: totalTeams }, (_, i) => i);
  const schedule: { roundNumber: number; pairings: { teamA: Team; teamB: Team | null }[] }[] = [];

  for (let r = 0; r < roundsToGenerate; r++) {
    const pairings: { teamA: Team; teamB: Team | null }[] = [];

    for (let m = 0; m < matchesPerRound; m++) {
      const idx1 = indices[m];
      const idx2 = indices[totalTeams - 1 - m];

      const t1 = teamList[idx1];
      const t2 = teamList[idx2];

      // Se uno dei due è BYE, la squadra reale è sempre messa come teamA
      if (t1 === null && t2 !== null) {
        pairings.push({ teamA: t2, teamB: null });
      } else if (t2 === null && t1 !== null) {
        pairings.push({ teamA: t1, teamB: null });
      } else if (t1 !== null && t2 !== null) {
        // Alterniamo casa/trasferta per bilanciare i tavoli
        if ((r + m) % 2 === 0) {
          pairings.push({ teamA: t1, teamB: t2 });
        } else {
          pairings.push({ teamA: t2, teamB: t1 });
        }
      }
    }

    // Ordina i pairings: prima le partite giocate (con tavolo), per ultimo il BYE (riposo)
    pairings.sort((a, b) => {
      if (a.teamB === null) return 1;
      if (b.teamB === null) return -1;
      return 0;
    });

    schedule.push({
      roundNumber: r + 1,
      pairings,
    });

    // Rotazione circle method: mantieni fisso indices[0], ruota indices[1..totalTeams-1]
    const last = indices.pop()!;
    indices.splice(1, 0, last);
  }

  return schedule;
}

/**
 * Genera tutti i Round di un torneo Round Robin con Match completi di ID e tavoli.
 */
export function generateAllRoundRobinRounds(tournament: Tournament): Round[] {
  const teams = tournament.teams;
  const requestedRounds = tournament.config.totalRounds || (teams.length % 2 === 0 ? teams.length - 1 : teams.length);
  const schedule = generateRoundRobinSchedule(teams, requestedRounds);

  return schedule.map((roundData) => {
    const roundId = generateId();
    let tableCounter = 1;

    const matches: Match[] = roundData.pairings.map((pairing) => {
      const isBye = pairing.teamB === null;
      const match: Match = {
        id: generateId(),
        roundId,
        table: isBye ? 0 : tableCounter++,
        teamAId: pairing.teamA.id,
        teamBId: pairing.teamB ? pairing.teamB.id : null,
        scoreA: null,
        scoreB: null,
        status: 'pending',
      };
      return match;
    });

    return {
      id: roundId,
      number: roundData.roundNumber,
      matches,
      completed: false,
    };
  });
}

/**
 * Implementazione dell'interfaccia TournamentEngine per Round Robin.
 */
export const roundRobinEngine: TournamentEngine = {
  id: 'round-robin',
  name: 'Round Robin',
  description: 'Tutti contro tutti: ogni coppia affronta tutte le altre.',
  requiresSequentialRounds: false,

  suggestRounds(teamCount: number): number {
    if (teamCount < 2) return 1;
    // Se pari: N-1 round. Se dispari: N round (con un BYE a turno)
    return teamCount % 2 === 0 ? teamCount - 1 : teamCount;
  },

  validate(tournament: Tournament): ValidationResult {
    const errors: string[] = [];
    if (tournament.teams.length < 2) {
      errors.push('Il Round Robin richiede almeno 2 coppie.');
    }
    const maxPossibleRounds = this.suggestRounds(tournament.teams.length);
    if (tournament.config.totalRounds > maxPossibleRounds) {
      errors.push(
        `Per ${tournament.teams.length} coppie, il numero massimo di round unici è ${maxPossibleRounds}.`
      );
    }
    return {
      valid: errors.length === 0,
      errors,
    };
  },

  generateRound(tournament: Tournament, roundNumber: number): Match[] {
    const allRounds = generateAllRoundRobinRounds(tournament);
    const round = allRounds.find((r) => r.number === roundNumber);
    return round ? round.matches : [];
  },
};
