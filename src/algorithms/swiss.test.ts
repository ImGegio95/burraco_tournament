// ============================================================================
// Test Suite: Sistema Svizzero (Swiss System) — Verifiche Sezione 21
// Caso prioritario: 5 coppie → Swiss → 3 round
// ============================================================================

import { generateSwissRound, swissEngine } from './swiss';
import { confirmMatchResult } from '../services/scoringService';
import { calculateStandings } from '../services/standingsService';
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
  console.log('--- Esecuzione Test Suite Sistema Svizzero (FASE 4) ---');
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

  // ==========================================================================
  // CASO PRIORITARIO (Sezione 21): 5 coppie → Swiss → 3 round
  // ==========================================================================
  console.log('\n[CASO PRIORITARIO] Test 5 coppie → Swiss → 3 round:');
  const teams5: Team[] = Array.from({ length: 5 }, (_, i) =>
    createMockTeam(`t${i + 1}`, `Coppia ${i + 1}`)
  );

  let tournament: Tournament = {
    id: 'swiss_5_tourn',
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'in-progress',
    config: {
      ...createDefaultConfig('Torneo Amatoriale 5 Coppie'),
      format: 'swiss',
      totalRounds: 3,
    },
    players: [],
    teams: teams5,
    rounds: [],
    standings: [],
  };

  assert(swissEngine.suggestRounds(5) === 3, 'suggestRounds(5) suggerisce 3 round per 5 coppie');

  // ROUND 1
  const r1Matches = generateSwissRound(tournament, 1);
  assert(r1Matches.length === 3, 'Round 1 ha 3 partite (2 tavoli giocati + 1 BYE)');
  const r1ByeMatch = r1Matches.find((m) => m.teamBId === null);
  assert(r1ByeMatch !== undefined, 'Round 1 ha 1 coppia in riposo (BYE)');

  const r1Id = generateId();
  r1Matches.forEach((m) => (m.roundId = r1Id));
  const round1: Round = { id: r1Id, number: 1, matches: r1Matches, completed: false };
  tournament.rounds.push(round1);

  // Simula risultati Round 1
  const r1Playing = r1Matches.filter((m) => m.teamBId !== null);
  tournament = confirmMatchResult(tournament, r1Id, r1Playing[0].id, 1020, 640);
  tournament = confirmMatchResult(tournament, r1Id, r1Playing[1].id, 850, 430);
  tournament.standings = calculateStandings(tournament);

  // ROUND 2
  const r2Matches = generateSwissRound(tournament, 2);
  assert(r2Matches.length === 3, 'Round 2 ha 3 partite (2 tavoli + 1 BYE)');
  const r2ByeMatch = r2Matches.find((m) => m.teamBId === null)!;
  assert(
    r2ByeMatch.teamAId !== r1ByeMatch!.teamAId,
    `La coppia ${r2ByeMatch.teamAId} che riposa al Round 2 è diversa da quella del Round 1 (${r1ByeMatch!.teamAId})`
  );

  // Verifica nessun rematch tra Round 1 e Round 2
  const r1Keys = new Set(
    r1Playing.map((m) => [m.teamAId, m.teamBId].sort().join('__vs__'))
  );
  const r2Playing = r2Matches.filter((m) => m.teamBId !== null);
  for (const m of r2Playing) {
    const key = [m.teamAId, m.teamBId].sort().join('__vs__');
    assert(!r1Keys.has(key), `Incontro [${key}] al Round 2 non è un rematch del Round 1`);
  }

  const r2Id = generateId();
  r2Matches.forEach((m) => (m.roundId = r2Id));
  const round2: Round = { id: r2Id, number: 2, matches: r2Matches, completed: false };
  tournament.rounds.push(round2);

  // Simula risultati Round 2
  tournament = confirmMatchResult(tournament, r2Id, r2Playing[0].id, 1100, 950);
  tournament = confirmMatchResult(tournament, r2Id, r2Playing[1].id, 780, 520);
  tournament.standings = calculateStandings(tournament);

  // ROUND 3
  const r3Matches = generateSwissRound(tournament, 3);
  assert(r3Matches.length === 3, 'Round 3 ha 3 partite (2 tavoli + 1 BYE)');
  const r3ByeMatch = r3Matches.find((m) => m.teamBId === null)!;
  assert(
    r3ByeMatch.teamAId !== r1ByeMatch!.teamAId && r3ByeMatch.teamAId !== r2ByeMatch.teamAId,
    `La coppia ${r3ByeMatch.teamAId} che riposa al Round 3 non ha mai riposato nei round 1 o 2`
  );

  const r2Keys = new Set(
    r2Playing.map((m) => [m.teamAId, m.teamBId].sort().join('__vs__'))
  );
  const allPastKeys = new Set([...r1Keys, ...r2Keys]);
  const r3Playing = r3Matches.filter((m) => m.teamBId !== null);
  for (const m of r3Playing) {
    const key = [m.teamAId, m.teamBId].sort().join('__vs__');
    assert(!allPastKeys.has(key), `Incontro [${key}] al Round 3 non si è mai disputato prima`);
  }

  // ==========================================================================
  // Test con numeri pari di coppie: 4, 6, 8 coppie
  // ==========================================================================
  for (const count of [4, 6, 8]) {
    console.log(`\nTest Swiss con ${count} coppie:`);
    const teams = Array.from({ length: count }, (_, i) =>
      createMockTeam(`team_${count}_${i + 1}`, `Coppia ${i + 1}`)
    );
    let tourn: Tournament = {
      id: `swiss_${count}`,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'in-progress',
      config: {
        ...createDefaultConfig(`Swiss ${count}`),
        format: 'swiss',
        totalRounds: 3,
      },
      players: [],
      teams,
      rounds: [],
      standings: [],
    };

    // Round 1
    const r1 = generateSwissRound(tourn, 1);
    assert(r1.length === count / 2, `Round 1 ha ${count / 2} partite senza BYE`);
    assert(r1.every((m) => m.teamBId !== null), 'Nessun BYE per numero pari di squadre');

    const id1 = generateId();
    tourn.rounds.push({ id: id1, number: 1, matches: r1, completed: true });
    // Simula risultati
    r1.forEach((m) => {
      m.scoreA = 1000;
      m.scoreB = 500;
      m.status = 'confirmed';
    });
    tourn.standings = calculateStandings(tourn);

    // Round 2
    const r2 = generateSwissRound(tourn, 2);
    assert(r2.length === count / 2, `Round 2 ha ${count / 2} partite`);
    const r1Set = new Set(r1.map((m) => [m.teamAId, m.teamBId].sort().join('__vs__')));
    for (const m of r2) {
      const key = [m.teamAId, m.teamBId].sort().join('__vs__');
      assert(!r1Set.has(key), `Round 2 incontro ${key} evita re-match`);
    }
  }

  console.log(`\n=========================================`);
  console.log(`Risultato: ${passed} passati, ${failed} falliti.`);
  if (failed > 0) {
    throw new Error(`Swiss test suite failed with ${failed} errors.`);
  }
}

runTests();
