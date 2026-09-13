// ============================================================================
// Test Suite: Persistenza e Storage Service (FASE 6 - Sezione 12)
// ============================================================================

import {
  saveTournament,
  loadTournament,
  loadTournaments,
  saveTournaments,
  deleteTournament,
  setActiveTournament,
  getActiveTournamentId,
} from './storageService';
import type { Tournament } from '../models/types';
import { createTournament } from './tournamentService';

// Mock localStorage per ambiente Node
class MockLocalStorage {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

// @ts-expect-error Mocking global localStorage
globalThis.localStorage = new MockLocalStorage();

function runTests() {
  console.log('--- Esecuzione Test Suite Persistenza localStorage (FASE 6) ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FALLITO: ${message}`);
      failed++;
    }
  }

  // 1. Inizialmente storage vuoto
  const initial = loadTournaments();
  assert(Array.isArray(initial) && initial.length === 0, 'Inizialmente loadTournaments() restituisce array vuoto');

  // 2. Salvataggio e caricamento torneo
  const t1 = createTournament('Torneo Alpha');
  saveTournament(t1);

  const loaded1 = loadTournament(t1.id);
  assert(loaded1 !== null && loaded1.config.name === 'Torneo Alpha', 'Torneo Alpha salvato e ricaricato correttamente');

  // 3. Aggiornamento torneo esistente
  const updatedT1: Tournament = {
    ...t1,
    status: 'in-progress',
    config: { ...t1.config, totalRounds: 4 },
  };
  saveTournament(updatedT1);

  const reloaded = loadTournament(t1.id);
  assert(reloaded !== null && reloaded.config.totalRounds === 4, 'Aggiornamento torneo persistito (totalRounds: 4)');
  assert(reloaded?.status === 'in-progress', 'Stato in-progress persistito');

  // 4. Salvataggio secondo torneo
  const t2 = createTournament('Torneo Beta');
  saveTournament(t2);

  const allTournaments = loadTournaments();
  assert(allTournaments.length === 2, 'Presenti 2 tornei distinti salvati');

  // 5. Active tournament management
  setActiveTournament(t1.id);
  assert(getActiveTournamentId() === t1.id, `Torneo attivo impostato a ${t1.id}`);

  setActiveTournament(null);
  assert(getActiveTournamentId() === null, 'Torneo attivo rimosso correttamente');

  // 6. Eliminazione torneo
  deleteTournament(t1.id);
  const remaining = loadTournaments();
  assert(remaining.length === 1 && remaining[0].id === t2.id, 'Torneo Alpha eliminato, Torneo Beta ancora presente');

  // 7. Salva lista massiva
  const t3 = createTournament('Torneo Gamma');
  saveTournaments([t2, t3]);
  assert(loadTournaments().length === 2, 'Salvataggio massivo di 2 tornei eseguito');

  console.log(`\n=========================================`);
  console.log(`Risultato: ${passed} passati, ${failed} falliti.`);
  if (failed > 0) {
    throw new Error(`Storage test suite failed with ${failed} errors.`);
  }
}

runTests();
