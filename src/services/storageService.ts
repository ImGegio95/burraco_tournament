// ============================================================================
// Storage Service — Persistenza su localStorage
// ============================================================================

import type { Tournament } from '../models/types';

const STORAGE_KEY = 'burraco-tournaments';
const ACTIVE_TOURNAMENT_KEY = 'burraco-active-tournament';

/**
 * Salva la lista di tornei su localStorage.
 */
export function saveTournaments(tournaments: Tournament[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tournaments));
  } catch (error) {
    console.error('Errore nel salvataggio dei tornei:', error);
  }
}

/**
 * Carica la lista di tornei da localStorage.
 */
export function loadTournaments(): Tournament[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as Tournament[];
  } catch (error) {
    console.error('Errore nel caricamento dei tornei:', error);
    return [];
  }
}

/**
 * Salva un singolo torneo (aggiorna o aggiunge alla lista).
 */
export function saveTournament(tournament: Tournament): void {
  const tournaments = loadTournaments();
  const index = tournaments.findIndex((t) => t.id === tournament.id);
  
  const updated = { ...tournament, updatedAt: new Date().toISOString() };
  
  if (index >= 0) {
    tournaments[index] = updated;
  } else {
    tournaments.push(updated);
  }
  
  saveTournaments(tournaments);
}

/**
 * Carica un singolo torneo per ID.
 */
export function loadTournament(id: string): Tournament | null {
  const tournaments = loadTournaments();
  return tournaments.find((t) => t.id === id) ?? null;
}

/**
 * Elimina un torneo per ID.
 */
export function deleteTournament(id: string): void {
  const tournaments = loadTournaments().filter((t) => t.id !== id);
  saveTournaments(tournaments);
}

/**
 * Salva l'ID del torneo attivo.
 */
export function setActiveTournament(id: string | null): void {
  if (id) {
    localStorage.setItem(ACTIVE_TOURNAMENT_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_TOURNAMENT_KEY);
  }
}

/**
 * Ottiene l'ID del torneo attivo.
 */
export function getActiveTournamentId(): string | null {
  return localStorage.getItem(ACTIVE_TOURNAMENT_KEY);
}

/**
 * Esporta un torneo come stringa JSON.
 */
export function exportTournamentJSON(tournament: Tournament): string {
  return JSON.stringify(tournament, null, 2);
}

/**
 * Importa un torneo da stringa JSON.
 * 
 * @returns Il torneo parsato o null se il JSON non è valido
 */
export function importTournamentJSON(json: string): Tournament | null {
  try {
    const tournament = JSON.parse(json) as Tournament;
    // Validazione base: verifica che abbia i campi essenziali
    if (!tournament.id || !tournament.config || !tournament.players) {
      return null;
    }
    return tournament;
  } catch {
    return null;
  }
}
