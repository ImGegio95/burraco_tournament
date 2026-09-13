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
 * Esporta un torneo come stringa JSON formattata.
 */
export function exportTournamentJSON(tournament: Tournament): string {
  return JSON.stringify(tournament, null, 2);
}

/**
 * Avvia il download del file JSON del torneo nel browser.
 */
export function downloadTournamentFile(tournament: Tournament): void {
  const json = exportTournamentJSON(tournament);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const sanitizeName = tournament.config.name
    .toLowerCase()
    .replace(/[^a-z0-9]/gi, '_')
    .slice(0, 30);
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `burraco_${sanitizeName}_${dateStr}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Valida e importa un torneo da stringa JSON.
 */
export function validateAndImportTournament(json: string): {
  success: boolean;
  tournament?: Tournament;
  error?: string;
} {
  try {
    const data = JSON.parse(json);

    if (!data || typeof data !== 'object') {
      return { success: false, error: 'Il file selezionato non è un JSON valido.' };
    }

    if (!data.id || typeof data.id !== 'string') {
      return { success: false, error: 'File non valido: campo "id" mancante.' };
    }

    if (!data.config || typeof data.config !== 'object' || !data.config.name) {
      return { success: false, error: 'File non valido: configurazione torneo assente o incompleta.' };
    }

    if (!Array.isArray(data.players) || !Array.isArray(data.teams) || !Array.isArray(data.rounds)) {
      return { success: false, error: 'File non valido: mancano le strutture dati di giocatori, coppie o round.' };
    }

    const tournament: Tournament = {
      ...data,
      version: data.version || 1,
      updatedAt: new Date().toISOString(),
    };

    return { success: true, tournament };
  } catch (err: any) {
    return { success: false, error: `Errore nella lettura del file: ${err?.message || 'Formato errato'}` };
  }
}

/**
 * Importa un torneo da stringa JSON (compatibilità legacy).
 */
export function importTournamentJSON(json: string): Tournament | null {
  const res = validateAndImportTournament(json);
  return res.success && res.tournament ? res.tournament : null;
}
