// ============================================================================
// Test Suite: Eliminazione Diretta (Knockout Engine — FASE 9 - Sezione 5.3)
// ============================================================================

import {
  nextPowerOfTwo,
  getKnockoutRoundName,
  generateKnockoutFirstRound,
  generateKnockoutNextRound,
  knockoutEngine,
} from './knockout';
import type { Team, Tournament, Round } from '../models/types';
import { createDefaultConfig } from '../services/tournamentService';
import { generateId } from '../utils/id';

function createMockTeam(id: string, name: string): Team {
  return {
    id,
    name,
    playerIds: [`p_${id}_1`, `p_${id}_2`],
  };
}

function runTests() {
  console.log('--- Esecuzione Test Suite Eliminazione Diretta (FASE 9) ---');
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

  // 1. nextPowerOfTwo
  assert(nextPowerOfTwo(2) === 2, 'nextPowerOfTwo(2) = 2');
  assert(nextPowerOfTwo(3) === 4, 'nextPowerOfTwo(3) = 4');
  assert(nextPowerOfTwo(4) === 4, 'nextPowerOfTwo(4) = 4');
  assert(nextPowerOfTwo(5) === 8, 'nextPowerOfTwo(5) = 8');
  assert(nextPowerOfTwo(8) === 8, 'nextPowerOfTwo(8) = 8');

  // 2. getKnockoutRoundName
  assert(getKnockoutRoundName(1) === 'Finale', '1 match rimanente = Finale');
  assert(getKnockoutRoundName(2) === 'Semifinali', '2 match rimanenti = Semifinali');
  assert(getKnockoutRoundName(4) === 'Quarti di Finale', '4 match rimanenti = Quarti');

  // 3. Torneo Knockout con 4 squadre (potenza di 2 perfetta)
  console.log('\nTest Knockout con 4 squadre (Semifinali -> Finale):');
  const teams4 = [
    createMockTeam('t1', 'Team 1'),
    createMockTeam('t2', 'Team 2'),
    createMockTeam('t3', 'Team 3'),
    createMockTeam('t4', 'Team 4'),
  ];

  let tournament4: Tournament = {
    id: 'tourn_ko_4',
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'in-progress',
    config: {
      ...createDefaultConfig('Knockout 4'),
      format: 'knockout',
      totalRounds: 2,
    },
    players: [],
    teams: teams4,
    rounds: [],
    standings: [],
  };

  assert(knockoutEngine.suggestRounds(4) === 2, 'suggestRounds(4) = 2 round (Semifinali e Finale)');

  // Round 1 (Semifinali)
  const r1 = generateKnockoutFirstRound(teams4);
  assert(r1.length === 2, 'Round 1 ha 2 partite');
  assert(r1.every((m) => m.teamBId !== null), 'Nessun BYE con 4 squadre');

  // Simula completamento Semifinali: t1 vince match 0, t4 vince match 1
  const r1Id = generateId();
  r1[0].roundId = r1Id;
  r1[0].scoreA = 1000;
  r1[0].scoreB = 600;
  r1[0].status = 'confirmed';

  r1[1].roundId = r1Id;
  r1[1].scoreA = 400;
  r1[1].scoreB = 950;
  r1[1].status = 'confirmed';

  const round1: Round = { id: r1Id, number: 1, matches: r1, completed: true };
  tournament4.rounds.push(round1);

  // Round 2 (Finale)
  const r2 = generateKnockoutNextRound(tournament4, 2);
  assert(r2.length === 1, 'Round 2 ha 1 partita (La Finale)');
  const winnerA = r1[0].teamAId;
  const winnerB = r1[1].teamBId;
  assert(
    (r2[0].teamAId === winnerA && r2[0].teamBId === winnerB) ||
    (r2[0].teamAId === winnerB && r2[0].teamBId === winnerA),
    'La finale vede scontrarsi i due vincitori delle semifinali'
  );

  // 4. Torneo Knockout con 5 squadre (gestione BYE / non potenza di 2)
  console.log('\nTest Knockout con 5 squadre (Turno Preliminare con BYE):');
  const teams5 = Array.from({ length: 5 }, (_, i) =>
    createMockTeam(`team5_${i + 1}`, `Coppia ${i + 1}`)
  );

  let tournament5: Tournament = {
    id: 'tourn_ko_5',
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'in-progress',
    config: {
      ...createDefaultConfig('Knockout 5'),
      format: 'knockout',
      totalRounds: 3,
    },
    players: [],
    teams: teams5,
    rounds: [],
    standings: [],
  };

  const r1Ko5 = generateKnockoutFirstRound(teams5);
  // Con 5 squadre su bracket da 8: 8 - 5 = 3 squadre hanno BYE, 2 giocano il preliminare
  const byes = r1Ko5.filter((m) => m.teamBId === null);
  const active = r1Ko5.filter((m) => m.teamBId !== null);
  assert(byes.length === 3, '3 squadre ricevono il BYE per il turno successivo');
  assert(active.length === 1, '1 partita preliminare disputata dalle altre 2 squadre');

  // Simula vittoria preliminare
  const r1Ko5Id = generateId();
  active[0].roundId = r1Ko5Id;
  active[0].scoreA = 800;
  active[0].scoreB = 500;
  active[0].status = 'confirmed';
  byes.forEach((m) => (m.roundId = r1Ko5Id));

  tournament5.rounds.push({ id: r1Ko5Id, number: 1, matches: r1Ko5, completed: true });

  // Round 2 (Semifinali con 4 squadre: 3 da BYE + 1 vincitore preliminare)
  const r2Ko5 = generateKnockoutNextRound(tournament5, 2);
  assert(r2Ko5.length === 2, 'Semifinali con esattamente 2 partite (4 squadre qualificate)');
  assert(r2Ko5.every((m) => m.teamBId !== null), 'Tutti i match di semifinale hanno due contendenti');

  console.log(`\n=========================================`);
  console.log(`Risultato: ${passed} passati, ${failed} falliti.`);
  if (failed > 0) {
    throw new Error(`Knockout test suite failed with ${failed} errors.`);
  }
}

runTests();
