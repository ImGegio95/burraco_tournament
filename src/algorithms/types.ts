// ============================================================================
// Interfaccia comune per i motori di generazione incontri
// ============================================================================

import type { Match, Tournament } from '../models/types';

/** Risultato di validazione */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Interfaccia che ogni algoritmo di torneo deve implementare.
 * 
 * Questo design a plugin permette di aggiungere nuove formule
 * senza modificare la UI o la logica di business.
 */
export interface TournamentEngine {
  /** Identificativo della formula */
  readonly id: string;

  /** Nome leggibile (es. "Round Robin", "Sistema Svizzero") */
  readonly name: string;

  /** Descrizione breve della formula */
  readonly description: string;

  /**
   * Genera gli incontri per un determinato round.
   * 
   * @param tournament - Stato corrente del torneo
   * @param roundNumber - Numero del round da generare (1-based)
   * @returns Array di Match generati
   */
  generateRound(tournament: Tournament, roundNumber: number): Match[];

  /**
   * Suggerisce il numero ottimale di round in base al numero di coppie.
   * 
   * @param teamCount - Numero di coppie partecipanti
   * @returns Numero suggerito di round
   */
  suggestRounds(teamCount: number): number;

  /**
   * Verifica che la configurazione del torneo sia valida per questa formula.
   * 
   * @param tournament - Stato corrente del torneo
   * @returns Risultato della validazione con eventuali errori
   */
  validate(tournament: Tournament): ValidationResult;

  /**
   * Indica se la formula richiede che tutti i round precedenti
   * siano completati prima di generare il successivo.
   */
  readonly requiresSequentialRounds: boolean;
}
