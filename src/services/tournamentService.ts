// ============================================================================
// Tournament Service — Creazione e gestione del torneo
// ============================================================================

import type {
  Tournament,
  TournamentConfig,
  TournamentFormat,
  Player,
  Team,
} from '../models/types';
import {
  CURRENT_MODEL_VERSION,
  DEFAULT_PRIZE_DISTRIBUTION,
  DEFAULT_TIEBREAK_ORDER,
} from '../models/types';
import { generateId } from '../utils/id';

/**
 * Crea un nuovo torneo con configurazione di default.
 */
export function createTournament(name: string = 'Nuovo Torneo'): Tournament {
  const now = new Date().toISOString();

  return {
    id: generateId(),
    version: CURRENT_MODEL_VERSION,
    createdAt: now,
    updatedAt: now,
    status: 'setup',
    config: createDefaultConfig(name),
    players: [],
    teams: [],
    rounds: [],
    standings: [],
  };
}

/**
 * Crea una configurazione di default.
 */
export function createDefaultConfig(name: string): TournamentConfig {
  return {
    name,
    format: 'swiss',
    totalRounds: 3,
    playerFee: null,
    prizePool: null,
    prizeDistribution: [...DEFAULT_PRIZE_DISTRIBUTION],
    tieBreakOrder: [...DEFAULT_TIEBREAK_ORDER],
  };
}

/**
 * Crea un nuovo giocatore.
 */
export function createPlayer(name: string): Player {
  return {
    id: generateId(),
    name: name.trim(),
  };
}

/**
 * Crea una coppia da due giocatori.
 */
export function createTeam(player1: Player, player2: Player, customName?: string): Team {
  return {
    id: generateId(),
    name: `${player1.name} / ${player2.name}`,
    customName,
    playerIds: [player1.id, player2.id],
  };
}

/**
 * Genera coppie casuali da una lista di giocatori.
 * Richiede un numero pari di giocatori.
 */
export function generateRandomTeams(players: Player[]): Team[] {
  if (players.length % 2 !== 0) {
    throw new Error('Il numero di giocatori deve essere pari per generare le coppie.');
  }

  // Shuffle Fisher-Yates
  const shuffled = [...players];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const teams: Team[] = [];
  for (let i = 0; i < shuffled.length; i += 2) {
    teams.push(createTeam(shuffled[i], shuffled[i + 1]));
  }

  return teams;
}

/**
 * Suggerisce il formato e il numero di round ottimale.
 */
export function suggestTournamentSetup(teamCount: number): {
  format: TournamentFormat;
  rounds: number;
} {
  if (teamCount <= 4) {
    return { format: 'round-robin', rounds: teamCount - 1 };
  }

  // Swiss per la maggior parte dei tornei
  let rounds: number;
  if (teamCount <= 5) rounds = 3;
  else if (teamCount <= 6) rounds = 4;
  else if (teamCount <= 10) rounds = 4;
  else rounds = 5;

  return { format: 'swiss', rounds };
}
