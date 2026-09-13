// ============================================================================
// Scoring Service — Inserimento e gestione risultati
// ============================================================================

import type { Match, Round, Tournament } from '../models/types';

/**
 * Conferma il risultato di una partita.
 * Imposta lo status a 'confirmed' e verifica che i punteggi siano validi.
 */
export function confirmMatchResult(
  tournament: Tournament,
  roundId: string,
  matchId: string,
  scoreA: number,
  scoreB: number
): Tournament {
  const rounds = tournament.rounds.map((round) => {
    if (round.id !== roundId) return round;

    const matches = round.matches.map((match) => {
      if (match.id !== matchId) return match;
      return {
        ...match,
        scoreA,
        scoreB,
        status: 'confirmed' as const,
      };
    });

    // Verifica se il round è completato
    const completed = matches.every(
      (m) => m.status === 'confirmed' || m.teamBId === null
    );

    return { ...round, matches, completed };
  });

  const allRoundsCompleted =
    rounds.length === tournament.config.totalRounds &&
    rounds.every((r) => r.completed);

  return {
    ...tournament,
    rounds,
    status: allRoundsCompleted ? 'completed' : 'in-progress',
  };
}

/**
 * Resetta il risultato di una partita (per modifiche dell'organizzatore).
 */
export function resetMatchResult(
  tournament: Tournament,
  roundId: string,
  matchId: string
): Tournament {
  const rounds = tournament.rounds.map((round) => {
    if (round.id !== roundId) return round;

    const matches = round.matches.map((match) => {
      if (match.id !== matchId) return match;
      return {
        ...match,
        scoreA: null,
        scoreB: null,
        status: 'pending' as const,
      };
    });

    return { ...round, matches, completed: false };
  });

  return { ...tournament, rounds };
}

/**
 * Verifica se un round è completato (tutte le partite confermate).
 */
export function isRoundCompleted(round: Round): boolean {
  return round.matches.every(
    (m) => m.status === 'confirmed' || m.teamBId === null
  );
}

/**
 * Restituisce il round corrente (primo non completato).
 */
export function getCurrentRound(tournament: Tournament): Round | null {
  return tournament.rounds.find((r) => !r.completed) ?? null;
}

/**
 * Determina il vincitore di una partita confermata.
 * Restituisce null se la partita non è confermata o è un BYE.
 */
export function getMatchWinner(match: Match): string | null {
  if (match.status !== 'confirmed' || match.teamBId === null) return null;
  if (match.scoreA === null || match.scoreB === null) return null;

  if (match.scoreA > match.scoreB) return match.teamAId;
  if (match.scoreB > match.scoreA) return match.teamBId;
  return null; // Pareggio
}
