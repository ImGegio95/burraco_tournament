// ============================================================================
// Registry / Factory degli algoritmi di torneo
// ============================================================================

import type { TournamentFormat } from '../models/types';
import type { TournamentEngine } from './types';

/**
 * Registry degli algoritmi disponibili.
 * Ogni nuovo algoritmo si registra qui.
 * 
 * In FASE 2+ verranno importati i moduli concreti:
 * - roundRobin
 * - swiss
 * - knockout
 */
const engineRegistry = new Map<TournamentFormat, TournamentEngine>();

/**
 * Registra un motore di torneo.
 */
export function registerEngine(format: TournamentFormat, engine: TournamentEngine): void {
  engineRegistry.set(format, engine);
}

/**
 * Ottiene il motore di torneo per una determinata formula.
 * 
 * @throws Error se la formula non è registrata
 */
export function getEngine(format: TournamentFormat): TournamentEngine {
  const engine = engineRegistry.get(format);
  if (!engine) {
    throw new Error(`Formula di torneo "${format}" non ancora implementata.`);
  }
  return engine;
}

/**
 * Restituisce tutte le formule di torneo disponibili (registrate).
 */
export function getAvailableFormats(): { format: TournamentFormat; engine: TournamentEngine }[] {
  return Array.from(engineRegistry.entries()).map(([format, engine]) => ({
    format,
    engine,
  }));
}

/**
 * Suggerisce la formula migliore in base al numero di coppie.
 * Implementa la logica del "Torneo Rapido" (sezione 5.5).
 */
export function suggestFormat(teamCount: number): {
  format: TournamentFormat;
  suggestedRounds: number;
} {
  // Per ora restituisce Swiss come default (la più adatta a tornei brevi)
  const swissEngine = engineRegistry.get('swiss');
  if (swissEngine) {
    return {
      format: 'swiss',
      suggestedRounds: swissEngine.suggestRounds(teamCount),
    };
  }

  // Fallback a Round Robin se Swiss non è disponibile
  const rrEngine = engineRegistry.get('round-robin');
  if (rrEngine) {
    return {
      format: 'round-robin',
      suggestedRounds: rrEngine.suggestRounds(teamCount),
    };
  }

  // Nessun engine registrato ancora
  return {
    format: 'swiss',
    suggestedRounds: Math.min(teamCount - 1, 4),
  };
}
