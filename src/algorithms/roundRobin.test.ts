// ============================================================================
// Test Suite: Algoritmo Round Robin (Verifiche Sezione 21 del Project Plan)
// ============================================================================

import { generateRoundRobinSchedule, generateAllRoundRobinRounds, roundRobinEngine } from './roundRobin';
import type { Team, Tournament } from '../models/types';
import { createDefaultConfig } from '../services/tournamentService';

function createMockTeam(id: string, name: string): Team {
  return {
    id,
    name,
    playerIds: [`p_${id}_1`, `p_${id}_2`],
  };
}

function runTests() {
  console.log('--- Esecuzione Test Suite Round Robin ---');
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

  // Test per 3, 4, 5, 6, 8, 10 coppie come richiesto dalla Sezione 21
  const teamCountsToTest = [3, 4, 5, 6, 8, 10];

  for (const count of teamCountsToTest) {
    console.log(`\nTest con ${count} coppie:`);
    const teams: Team[] = Array.from({ length: count }, (_, i) =>
      createMockTeam(`t${i + 1}`, `Coppia ${i + 1}`)
    );

    const isOdd = count % 2 !== 0;
    const expectedRounds = isOdd ? count : count - 1;
    const expectedMatchesPerTeam = count - 1;

    // 1. Verifica suggerimento round
    const suggested = roundRobinEngine.suggestRounds(count);
    assert(
      suggested === expectedRounds,
      `suggestRounds(${count}) restituisce ${expectedRounds} (ottenuto ${suggested})`
    );

    // 2. Generazione calendario
    const schedule = generateRoundRobinSchedule(teams);
    assert(
      schedule.length === expectedRounds,
      `Numero di round generati pari a ${expectedRounds}`
    );

    // 3. Verifica duplicati e incontri totali
    const matchupSet = new Set<string>();
    const byeCountPerTeam = new Map<string, number>();
    const matchesPlayedPerTeam = new Map<string, number>();

    teams.forEach((t) => {
      byeCountPerTeam.set(t.id, 0);
      matchesPlayedPerTeam.set(t.id, 0);
    });

    for (const round of schedule) {
      // Verifica che in ogni round nessuna squadra compaia due volte
      const teamsInRound = new Set<string>();

      for (const pairing of round.pairings) {
        const idA = pairing.teamA.id;
        assert(!teamsInRound.has(idA), `Squadra ${idA} non gioca due volte nel round ${round.roundNumber}`);
        teamsInRound.add(idA);

        if (pairing.teamB === null) {
          // BYE
          byeCountPerTeam.set(idA, (byeCountPerTeam.get(idA) || 0) + 1);
        } else {
          const idB = pairing.teamB.id;
          assert(!teamsInRound.has(idB), `Squadra ${idB} non gioca due volte nel round ${round.roundNumber}`);
          teamsInRound.add(idB);

          // Ordina gli ID per verificare unicità del matchup
          const pairKey = [idA, idB].sort().join(' vs ');
          assert(!matchupSet.has(pairKey), `Incontro unico [${pairKey}] mai disputato prima`);
          matchupSet.add(pairKey);

          matchesPlayedPerTeam.set(idA, (matchesPlayedPerTeam.get(idA) || 0) + 1);
          matchesPlayedPerTeam.set(idB, (matchesPlayedPerTeam.get(idB) || 0) + 1);
        }
      }
    }

    // 4. Se dispari: ogni squadra ha esattamente 1 BYE
    if (isOdd) {
      for (const team of teams) {
        assert(
          byeCountPerTeam.get(team.id) === 1,
          `Squadra ${team.name} riceve esattamente 1 BYE (ottenuto ${byeCountPerTeam.get(team.id)})`
        );
      }
    } else {
      for (const team of teams) {
        assert(
          byeCountPerTeam.get(team.id) === 0,
          `Squadra ${team.name} non ha BYE con numero pari`
        );
      }
    }

    // 5. Ogni coppia affronta tutte le altre (totale incontri = N * (N - 1) / 2)
    const expectedTotalMatches = (count * (count - 1)) / 2;
    assert(
      matchupSet.size === expectedTotalMatches,
      `Tutti i ${expectedTotalMatches} scontri diretti unici generati senza ripetizioni`
    );

    for (const team of teams) {
      assert(
        matchesPlayedPerTeam.get(team.id) === expectedMatchesPerTeam,
        `Squadra ${team.name} gioca esattamente ${expectedMatchesPerTeam} partite`
      );
    }
  }

  // 6. Test generazione con torneo completo e assegnazione tavoli
  console.log('\nTest generazione torneo completo e tavoli:');
  const teams4 = Array.from({ length: 4 }, (_, i) =>
    createMockTeam(`t${i + 1}`, `Coppia ${i + 1}`)
  );
  const mockTournament: Tournament = {
    id: 'tourn_test',
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'setup',
    config: {
      ...createDefaultConfig('Test Round Robin'),
      format: 'round-robin',
      totalRounds: 3,
    },
    players: [],
    teams: teams4,
    rounds: [],
    standings: [],
  };

  const rounds = generateAllRoundRobinRounds(mockTournament);
  assert(rounds.length === 3, '3 round generati per 4 squadre');

  for (const round of rounds) {
    assert(round.matches.length === 2, `Round ${round.number} contiene 2 partite`);
    const tables = round.matches.map((m) => m.table);
    assert(tables.includes(1) && tables.includes(2), `Tavoli 1 e 2 assegnati nel round ${round.number}`);
  }

  console.log(`\n=========================================`);
  console.log(`Risultato: ${passed} passati, ${failed} falliti.`);
  if (failed > 0) {
    throw new Error(`Round Robin test suite failed with ${failed} errors.`);
  }
}

runTests();
