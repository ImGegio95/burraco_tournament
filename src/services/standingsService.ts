// ============================================================================
// Standings Service — Calcolo classifica e tie-break
// ============================================================================

import type {
  Match,
  StandingsEntry,
  Team,
  TieBreakCriterion,
  Tournament,
} from '../models/types';

/**
 * Calcola la classifica completa del torneo.
 * 
 * Itera su tutti i round completati, raccoglie i risultati
 * e ordina le coppie secondo i criteri di tie-break configurati.
 */
export function calculateStandings(tournament: Tournament): StandingsEntry[] {
  const { teams, rounds, config } = tournament;

  // Inizializza le entries per ogni coppia
  const entriesMap = new Map<string, StandingsEntry>();
  teams.forEach((team) => {
    entriesMap.set(team.id, {
      teamId: team.id,
      position: 0,
      played: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      totalPoints: 0,
      pointDiff: 0,
    });
  });

  // Raccoglie i risultati da tutti i match confermati
  const confirmedMatches: Match[] = [];
  for (const round of rounds) {
    for (const match of round.matches) {
      if (match.status === 'confirmed' && match.teamBId !== null) {
        confirmedMatches.push(match);
        updateEntry(entriesMap, match);
      }
    }
  }

  // Ordina secondo tie-break
  const entries = Array.from(entriesMap.values());
  sortByTieBreak(entries, config.tieBreakOrder, confirmedMatches);

  // Salva la posizione precedente e assegna la nuova
  const oldStandings = tournament.standings;
  entries.forEach((entry, index) => {
    const oldEntry = oldStandings.find((e) => e.teamId === entry.teamId);
    entry.previousPosition = oldEntry?.position;
    entry.position = index + 1;
  });

  return entries;
}

/**
 * Aggiorna le statistiche di una entry in base a un match.
 */
function updateEntry(
  entriesMap: Map<string, StandingsEntry>,
  match: Match
): void {
  if (match.scoreA === null || match.scoreB === null || match.teamBId === null) return;

  const entryA = entriesMap.get(match.teamAId);
  const entryB = entriesMap.get(match.teamBId);
  if (!entryA || !entryB) return;

  entryA.played++;
  entryB.played++;
  entryA.totalPoints += match.scoreA;
  entryB.totalPoints += match.scoreB;
  entryA.pointDiff += match.scoreA - match.scoreB;
  entryB.pointDiff += match.scoreB - match.scoreA;

  if (match.scoreA > match.scoreB) {
    entryA.wins++;
    entryB.losses++;
  } else if (match.scoreB > match.scoreA) {
    entryB.wins++;
    entryA.losses++;
  } else {
    entryA.draws++;
    entryB.draws++;
  }
}

/**
 * Ordina le entries secondo i criteri di tie-break, in ordine di priorità.
 */
function sortByTieBreak(
  entries: StandingsEntry[],
  tieBreakOrder: TieBreakCriterion[],
  confirmedMatches: Match[]
): void {
  entries.sort((a, b) => {
    for (const criterion of tieBreakOrder) {
      const diff = compareByCriterion(a, b, criterion, confirmedMatches);
      if (diff !== 0) return diff;
    }
    return 0;
  });
}

/**
 * Compara due entries secondo un singolo criterio.
 * Restituisce negativo se A è migliore, positivo se B è migliore, 0 se pari.
 */
function compareByCriterion(
  a: StandingsEntry,
  b: StandingsEntry,
  criterion: TieBreakCriterion,
  confirmedMatches: Match[]
): number {
  switch (criterion) {
    case 'totalPoints':
      return b.totalPoints - a.totalPoints;
    case 'wins':
      return b.wins - a.wins;
    case 'pointDiff':
      return b.pointDiff - a.pointDiff;
    case 'headToHead':
      return compareHeadToHead(a.teamId, b.teamId, confirmedMatches);
    case 'playoff':
      // Il playoff è gestito separatamente, non si può risolvere automaticamente
      return 0;
    default:
      return 0;
  }
}

/**
 * Confronto testa a testa tra due coppie.
 * Restituisce negativo se teamA ha vinto lo scontro diretto.
 */
function compareHeadToHead(
  teamAId: string,
  teamBId: string,
  matches: Match[]
): number {
  let pointsA = 0;
  let pointsB = 0;

  for (const match of matches) {
    if (
      (match.teamAId === teamAId && match.teamBId === teamBId) ||
      (match.teamAId === teamBId && match.teamBId === teamAId)
    ) {
      const sA = match.teamAId === teamAId ? match.scoreA ?? 0 : match.scoreB ?? 0;
      const sB = match.teamAId === teamAId ? match.scoreB ?? 0 : match.scoreA ?? 0;
      pointsA += sA;
      pointsB += sB;
    }
  }

  return pointsB - pointsA;
}

/**
 * Restituisce il nome visualizzato di una coppia.
 */
export function getTeamDisplayName(team: Team): string {
  return team.customName || team.name;
}
