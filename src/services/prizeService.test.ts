// ============================================================================
// Test Suite: Gestione Montepremi e Premi (FASE 5 - Sezioni 6 e 7)
// ============================================================================

import {
  calculatePrizePool,
  calculatePrizeAmounts,
  isPrizeDistributionValid,
  getPrizeForPosition,
  formatCurrency,
  updatePrizeConfig,
} from './prizeService';
import type { Prize, Tournament } from '../models/types';
import { createDefaultConfig } from './tournamentService';

function runTests() {
  console.log('--- Esecuzione Test Suite Montepremi e Premi (FASE 5) ---');
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

  // 1. Calcolo montepremi automatico da quota giocatore
  // Esempio sezione 7: Quota 10€ x 10 giocatori = 100€
  const pool1 = calculatePrizePool(10, 10);
  assert(pool1 === 100, `Quota 10€ per 10 giocatori genera montepremi di 100€ (ottenuto ${pool1})`);

  const poolZero = calculatePrizePool(0, 10);
  assert(poolZero === null, 'Quota 0 genera montepremi null');

  // 2. Validazione percentuali (deve sommare a 100%)
  const validDist: Prize[] = [
    { position: 1, label: '1° Classificato', percentage: 60, amount: 0 },
    { position: 2, label: '2° Classificato', percentage: 30, amount: 0 },
    { position: 3, label: '3° Classificato', percentage: 10, amount: 0 },
  ];
  assert(isPrizeDistributionValid(validDist), 'Distribuzione 60-30-10 è valida (somma 100%)');

  const invalidDist: Prize[] = [
    { position: 1, label: '1°', percentage: 50, amount: 0 },
    { position: 2, label: '2°', percentage: 30, amount: 0 },
  ];
  assert(!isPrizeDistributionValid(invalidDist), 'Distribuzione con somma 80% non è valida');

  // 3. Calcolo importi con arrotondamento corretto
  const calculatedPrizes = calculatePrizeAmounts(validDist, 100);
  assert(calculatedPrizes[0].amount === 60, '1° posto riceve 60,00 €');
  assert(calculatedPrizes[1].amount === 30, '2° posto riceve 30,00 €');
  assert(calculatedPrizes[2].amount === 10, '3° posto riceve 10,00 €');

  // Calcolo con montepremi dispari (es. 75€ con 50%, 30%, 20%)
  const oddPrizes = calculatePrizeAmounts(
    [
      { position: 1, label: '1°', percentage: 50, amount: 0 },
      { position: 2, label: '2°', percentage: 30, amount: 0 },
      { position: 3, label: '3°', percentage: 20, amount: 0 },
    ],
    75
  );
  assert(oddPrizes[0].amount === 37.5, '50% di 75€ = 37,50€');
  assert(oddPrizes[1].amount === 22.5, '30% di 75€ = 22,50€');
  assert(oddPrizes[2].amount === 15, '20% di 75€ = 15,00€');

  // 4. getPrizeForPosition
  const prize1 = getPrizeForPosition(calculatedPrizes, 1);
  assert(prize1 !== undefined && prize1.amount === 60, 'getPrizeForPosition(1) restituisce 60€');
  const prize4 = getPrizeForPosition(calculatedPrizes, 4);
  assert(prize4 === undefined, 'getPrizeForPosition(4) restituisce undefined');

  // 5. Formattazione valuta italiana
  const formatted = formatCurrency(60);
  assert(formatted.includes('60') && formatted.includes('€'), `formatCurrency(60) produce formato valido: ${formatted}`);

  // 6. updatePrizeConfig nel torneo
  let mockTourn: Tournament = {
    id: 't_prize',
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'setup',
    config: createDefaultConfig('Test Premi'),
    players: Array.from({ length: 8 }, (_, i) => ({ id: `p${i}`, name: `P${i}` })),
    teams: [],
    rounds: [],
    standings: [],
  };

  mockTourn = updatePrizeConfig(mockTourn, 15, null, validDist);
  assert(mockTourn.config.playerFee === 15, 'Quota aggiornata a 15€');
  assert(mockTourn.config.prizePool === 120, 'Montepremi calcolato a 120€ (15 x 8)');
  assert(mockTourn.config.prizeDistribution[0].amount === 72, '1° premio calcolato a 72€ (60% di 120)');

  console.log(`\n=========================================`);
  console.log(`Risultato: ${passed} passati, ${failed} falliti.`);
  if (failed > 0) {
    throw new Error(`Prize test suite failed with ${failed} errors.`);
  }
}

runTests();
