// ============================================================================
// Test Suite: Import / Export JSON (FASE 7 - Sezione 13)
// ============================================================================

import {
  exportTournamentJSON,
  validateAndImportTournament,
  importTournamentJSON,
} from './storageService';
import { createTournament, createPlayer, createTeam } from './tournamentService';

function runTests() {
  console.log('--- Esecuzione Test Suite Import / Export JSON (FASE 7) ---');
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

  // 1. Creazione torneo di prova completo
  const tournament = createTournament('Torneo San Silvestro');
  const p1 = createPlayer('Mario');
  const p2 = createPlayer('Luigi');
  const team1 = createTeam(p1, p2, 'I Fratelli');
  tournament.players = [p1, p2];
  tournament.teams = [team1];

  // 2. Export in JSON
  const jsonString = exportTournamentJSON(tournament);
  assert(typeof jsonString === 'string' && jsonString.length > 50, 'exportTournamentJSON produce stringa JSON non vuota');
  assert(jsonString.includes('Torneo San Silvestro'), 'JSON esportato contiene il nome del torneo');
  assert(jsonString.includes('I Fratelli'), 'JSON esportato contiene i dati delle coppie');

  // 3. Import da JSON valido
  const importResult = validateAndImportTournament(jsonString);
  assert(importResult.success === true, 'validateAndImportTournament ha successo con JSON valido');
  assert(importResult.tournament?.config.name === 'Torneo San Silvestro', 'Nome del torneo importato corrisponde');
  assert(importResult.tournament?.teams[0].customName === 'I Fratelli', 'Coppia importata integra');

  // 4. Test con importTournamentJSON helper legacy
  const directImport = importTournamentJSON(jsonString);
  assert(directImport !== null && directImport.id === tournament.id, 'importTournamentJSON importa correttamente');

  // 5. Rifiuto JSON malformato
  const badJson = '{ nome: torneo senza virgolette ';
  const badResult = validateAndImportTournament(badJson);
  assert(!badResult.success && Boolean(badResult.error), 'Rifiuta JSON con sintassi errata');

  // 6. Rifiuto JSON mancante di campi obbligatori
  const missingId = JSON.stringify({ config: { name: 'Senza ID' }, players: [], teams: [], rounds: [] });
  const missingIdResult = validateAndImportTournament(missingId);
  assert(!missingIdResult.success && Boolean(missingIdResult.error?.includes('id')), 'Rifiuta JSON privo di id');

  const missingConfig = JSON.stringify({ id: '123', players: [], teams: [], rounds: [] });
  const missingConfigResult = validateAndImportTournament(missingConfig);
  assert(!missingConfigResult.success && Boolean(missingConfigResult.error?.includes('configurazione')), 'Rifiuta JSON privo di config');

  const missingPlayers = JSON.stringify({ id: '123', config: { name: 'Test' }, teams: [], rounds: [] });
  const missingPlayersResult = validateAndImportTournament(missingPlayers);
  assert(!missingPlayersResult.success && Boolean(missingPlayersResult.error?.includes('giocatori')), 'Rifiuta JSON privo di array players');

  console.log(`\n=========================================`);
  console.log(`Risultato: ${passed} passati, ${failed} falliti.`);
  if (failed > 0) {
    throw new Error(`Import/Export test suite failed with ${failed} errors.`);
  }
}

runTests();
