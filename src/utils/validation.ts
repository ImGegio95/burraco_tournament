// ============================================================================
// Validazioni
// ============================================================================

import type { Player, Team, Prize, Tournament } from '../models/types';

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Valida che il nome del torneo sia impostato.
 */
export function validateTournamentName(name: string): ValidationError | null {
  if (!name.trim()) {
    return { field: 'name', message: 'Il nome del torneo è obbligatorio.' };
  }
  return null;
}

/**
 * Valida che ci siano abbastanza giocatori.
 */
export function validatePlayers(players: Player[]): ValidationError[] {
  const errors: ValidationError[] = [];

  if (players.length < 4) {
    errors.push({
      field: 'players',
      message: 'Servono almeno 4 giocatori per formare 2 coppie.',
    });
  }

  if (players.length % 2 !== 0) {
    errors.push({
      field: 'players',
      message: 'Il numero di giocatori deve essere pari per formare coppie complete.',
    });
  }

  // Verifica duplicati
  const names = players.map((p) => p.name.trim().toLowerCase());
  const duplicates = names.filter((name, i) => names.indexOf(name) !== i);
  if (duplicates.length > 0) {
    errors.push({
      field: 'players',
      message: `Giocatori duplicati: ${[...new Set(duplicates)].join(', ')}`,
    });
  }

  // Verifica nomi vuoti
  if (players.some((p) => !p.name.trim())) {
    errors.push({
      field: 'players',
      message: 'Tutti i giocatori devono avere un nome.',
    });
  }

  return errors;
}

/**
 * Valida le coppie.
 */
export function validateTeams(teams: Team[], players: Player[]): ValidationError[] {
  const errors: ValidationError[] = [];

  if (teams.length < 2) {
    errors.push({
      field: 'teams',
      message: 'Servono almeno 2 coppie per avviare un torneo.',
    });
  }

  // Verifica che ogni giocatore sia in esattamente una coppia
  const assignedPlayerIds = teams.flatMap((t) => t.playerIds);
  const playerIds = players.map((p) => p.id);

  const unassigned = playerIds.filter((id) => !assignedPlayerIds.includes(id));
  if (unassigned.length > 0) {
    errors.push({
      field: 'teams',
      message: `${unassigned.length} giocator${unassigned.length === 1 ? 'e non è assegnato' : 'i non sono assegnati'} a nessuna coppia.`,
    });
  }

  const duplicateAssignments = assignedPlayerIds.filter(
    (id, i) => assignedPlayerIds.indexOf(id) !== i
  );
  if (duplicateAssignments.length > 0) {
    errors.push({
      field: 'teams',
      message: 'Un giocatore è assegnato a più di una coppia.',
    });
  }

  return errors;
}

/**
 * Valida la distribuzione premi (percentuali devono sommare a 100%).
 */
export function validatePrizeDistribution(prizes: Prize[]): ValidationError[] {
  const errors: ValidationError[] = [];

  if (prizes.length === 0) return errors;

  const totalPercentage = prizes.reduce((sum, p) => sum + p.percentage, 0);
  if (Math.abs(totalPercentage - 100) > 0.01) {
    errors.push({
      field: 'prizeDistribution',
      message: `La somma delle percentuali deve essere 100% (attuale: ${totalPercentage}%).`,
    });
  }

  return errors;
}

/**
 * Valida l'intero torneo prima dell'avvio.
 */
export function validateTournamentForStart(tournament: Tournament): ValidationError[] {
  const errors: ValidationError[] = [];

  const nameError = validateTournamentName(tournament.config.name);
  if (nameError) errors.push(nameError);

  errors.push(...validatePlayers(tournament.players));
  errors.push(...validateTeams(tournament.teams, tournament.players));

  if (tournament.config.prizeDistribution.length > 0) {
    errors.push(...validatePrizeDistribution(tournament.config.prizeDistribution));
  }

  if (tournament.config.totalRounds < 1) {
    errors.push({
      field: 'totalRounds',
      message: 'Il numero di round deve essere almeno 1.',
    });
  }

  return errors;
}
