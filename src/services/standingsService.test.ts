// ============================================================================
// Test Suite: Standings & Tie-Break Service (Verifiche Sezione 9 e 10)
// ============================================================================

import { calculateStandings } from './standingsService';
import { confirmMatchResult, resetMatchResult } from './scoringService';
import type { Tournament, Team, Round, Match } from '../models/types';
import { createDefaultConfig } from './tournamentService';

function createMockTeam(id: string, name: string): Team {
  return {
    id,
    name,
    playerIds: [`p_${id}_1`, `p_${id}_2`],
  };
}

function runTests() {
  console.log('--- Esecuzione Test Suite Classifica e Tie-Break (FASE 3) ---');
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

  const teamA = createMockTeam('tA', 'Coppia A');
  const teamB = createMockTeam('tB', 'Coppia B');
  const teamC = createMockTeam('tC', 'Coppia C');
  const teamD = createMockTeam('tD', 'Coppia D');
  const teams = [teamA, teamB, teamC, teamD];

  const round1Matches: Match[] = [
    {
      id: 'm1',
      roundId: 'r1',
      table: 1,
      teamAId: 'tA',
      teamBId: 'tB',
      scoreA: null,
      scoreB: null,
      status: 'pending',
    },
    {
      id: 'm2',
      roundId: 'r1',
      table: 2,
      teamAId: 'tC',
      teamBId: 'tD',
      scoreA: null,
      scoreB: null,
      status: 'pending',
    },
  ];

  const round1: Round = {
    id: 'r1',
    number: 1,
    matches: round1Matches,
    completed: false,
  };

  let tournament: Tournament = {
    id: 'tourn_1',
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'in-progress',
    config: {
      ...createDefaultConfig('Test Burraco Standings'),
      format: 'round-robin',
      totalRounds: 3,
    },
    players: [],
    teams,
    rounds: [round1],
    standings: [],
  };

  // Test 1: Classifica iniziale a 0
  let standings = calculateStandings(tournament);
  assert(standings.length === 4, 'Tutte le 4 coppie inizializzate in classifica');
  assert(standings.every((s) => s.played === 0 && s.totalPoints === 0), 'Tutti a zero punti inizialmente');

  // Test 2: Inserimento risultati Match 1 (Coppia A 1050 vs Coppia B 620)
  tournament = confirmMatchResult(tournament, 'r1', 'm1', 1050, 620);
  standings = calculateStandings(tournament);

  const entryA = standings.find((s) => s.teamId === 'tA')!;
  const entryB = standings.find((s) => s.teamId === 'tB')!;
  assert(entryA.played === 1 && entryA.wins === 1 && entryA.totalPoints === 1050, 'Coppia A: 1 partita, 1 vittoria, 1050 punti');
  assert(entryA.pointDiff === 430, 'Coppia A: diff punti +430');
  assert(entryB.played === 1 && entryB.losses === 1 && entryB.totalPoints === 620, 'Coppia B: 1 partita, 1 sconfitta, 620 punti');
  assert(entryB.pointDiff === -430, 'Coppia B: diff punti -430');
  assert(standings[0].teamId === 'tA', 'Coppia A è al 1° posto');

  // Test 3: Inserimento risultati Match 2 (Coppia C 800 vs Coppia D 400)
  tournament = confirmMatchResult(tournament, 'r1', 'm2', 800, 400);
  tournament.standings = standings; // Salva posizioni per verificare trend
  standings = calculateStandings(tournament);

  const entryC = standings.find((s) => s.teamId === 'tC')!;
  assert(entryC.played === 1 && entryC.wins === 1 && entryC.totalPoints === 800, 'Coppia C: 1 partita, 1 vittoria, 800 punti');
  assert(standings[0].teamId === 'tA', '1° posto confermato a Coppia A (1050 pt)');
  assert(standings[1].teamId === 'tC', '2° posto a Coppia C (800 pt)');
  assert(standings[2].teamId === 'tB', '3° posto a Coppia B (620 pt)');
  assert(standings[3].teamId === 'tD', '4° posto a Coppia D (400 pt)');

  // Test 4: Tie-Break - Pari punti totali ma diversa vittoria
  // Creiamo una situazione di parità punti tra A e C
  // Simuliamo match tra A e C con punteggi che pareggiano i punti totali
  const round2: Round = {
    id: 'r2',
    number: 2,
    matches: [
      {
        id: 'm3',
        roundId: 'r2',
        table: 1,
        teamAId: 'tA',
        teamBId: 'tC',
        scoreA: null,
        scoreB: null,
        status: 'pending',
      },
    ],
    completed: false,
  };
  tournament.rounds.push(round2);

  // Se A fa 100 pt e C fa 350 pt:
  // A ha 1050 + 100 = 1150 pt, 1 vittoria
  // C ha 800 + 350 = 1150 pt, 2 vittorie!
  tournament = confirmMatchResult(tournament, 'r2', 'm3', 100, 350);
  standings = calculateStandings(tournament);

  assert(standings[0].teamId === 'tC', 'Coppia C al 1° posto per maggior numero di vittorie (2 vs 1) a pari punti totali (1150 pt)');
  assert(standings[1].teamId === 'tA', 'Coppia A al 2° posto');

  // Test 5: Tie-Break - Pari punti e pari vittorie, risolto da diff punti
  // Supponiamo Team X e Team Y entrambi con 1 vittoria e 1000 punti:
  // X ha fatto 1000 - 500 = +500 diff
  // Y ha fatto 1000 - 800 = +200 diff
  const mockTournamentDiff: Tournament = {
    ...tournament,
    standings: [],
    rounds: [
      {
        id: 'rdiff',
        number: 1,
        completed: true,
        matches: [
          { id: 'mx', roundId: 'rdiff', table: 1, teamAId: 'tA', teamBId: 'tB', scoreA: 1000, scoreB: 500, status: 'confirmed' },
          { id: 'my', roundId: 'rdiff', table: 2, teamAId: 'tC', teamBId: 'tD', scoreA: 1000, scoreB: 800, status: 'confirmed' },
        ],
      },
    ],
  };
  const standingsDiff = calculateStandings(mockTournamentDiff);
  assert(standingsDiff[0].teamId === 'tA', 'Team A primo grazie a diff punti superiore (+500 vs +200)');
  assert(standingsDiff[1].teamId === 'tC', 'Team C secondo (+200 diff)');

  // Test 6: Reset match - ripristina lo status pending e ricalcola
  const resetTourn = resetMatchResult(mockTournamentDiff, 'rdiff', 'my');
  const standingsReset = calculateStandings(resetTourn);
  const resetC = standingsReset.find((s) => s.teamId === 'tC')!;
  assert(resetC.played === 0 && resetC.totalPoints === 0, 'Dopo reset match, Team C torna a 0 partite e 0 punti');

  console.log(`\n=========================================`);
  console.log(`Risultato: ${passed} passati, ${failed} falliti.`);
  if (failed > 0) {
    throw new Error(`Standings test suite failed with ${failed} errors.`);
  }
}

runTests();
