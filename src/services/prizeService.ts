// ============================================================================
// Prize Service — Gestione montepremi e distribuzione premi
// ============================================================================

import type { Prize, Tournament } from '../models/types';

/**
 * Calcola il montepremi totale dalla quota e dal numero di giocatori.
 */
export function calculatePrizePool(
  playerFee: number | null,
  playerCount: number
): number | null {
  if (playerFee === null || playerFee <= 0) return null;
  return playerFee * playerCount;
}

/**
 * Calcola gli importi assoluti dalla distribuzione percentuale e dal montepremi.
 */
export function calculatePrizeAmounts(
  distribution: Prize[],
  prizePool: number | null
): Prize[] {
  if (prizePool === null || prizePool <= 0) {
    return distribution.map((p) => ({ ...p, amount: 0 }));
  }

  return distribution.map((prize) => ({
    ...prize,
    amount: Math.round((prize.percentage / 100) * prizePool * 100) / 100,
  }));
}

/**
 * Verifica che le percentuali sommino a 100%.
 */
export function isPrizeDistributionValid(distribution: Prize[]): boolean {
  if (distribution.length === 0) return true;
  const total = distribution.reduce((sum, p) => sum + p.percentage, 0);
  return Math.abs(total - 100) < 0.01;
}

/**
 * Aggiorna la configurazione premi del torneo.
 */
export function updatePrizeConfig(
  tournament: Tournament,
  playerFee: number | null,
  customPrizePool: number | null,
  distribution: Prize[]
): Tournament {
  const prizePool = customPrizePool ?? calculatePrizePool(playerFee, tournament.players.length);
  const prizeDistribution = calculatePrizeAmounts(distribution, prizePool);

  return {
    ...tournament,
    config: {
      ...tournament.config,
      playerFee,
      prizePool: prizePool,
      prizeDistribution,
    },
  };
}

/**
 * Formatta un importo in euro.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}
