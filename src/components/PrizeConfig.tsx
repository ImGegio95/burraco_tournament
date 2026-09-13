// ============================================================================
// PrizeConfig — Configurazione montepremi e distribuzione premi
// ============================================================================

import { useState, useEffect } from 'react';
import { useTournament } from '../context/TournamentContext';
import { formatCurrency, calculatePrizePool, calculatePrizeAmounts } from '../services/prizeService';

export default function PrizeConfig() {
  const { state, dispatch } = useTournament();
  const tournament = state.currentTournament;

  const [fee, setFee] = useState<string>('');
  const [customPool, setCustomPool] = useState<string>('');
  const [useCustomPool, setUseCustomPool] = useState(false);

  useEffect(() => {
    if (!tournament) return;
    if (tournament.config.playerFee !== null) {
      setFee(String(tournament.config.playerFee));
    }
    if (tournament.config.prizePool !== null) {
      const calculatedPool = calculatePrizePool(tournament.config.playerFee, tournament.players.length);
      if (calculatedPool !== tournament.config.prizePool) {
        setUseCustomPool(true);
        setCustomPool(String(tournament.config.prizePool));
      }
    }
  }, []);

  if (!tournament) return null;

  const playerCount = tournament.players.length;
  const feeNum = parseFloat(fee) || 0;
  const prizePool = useCustomPool
    ? (parseFloat(customPool) || 0)
    : (feeNum > 0 ? feeNum * playerCount : 0);

  const distribution = tournament.config.prizeDistribution;
  const totalPercentage = distribution.reduce((sum, p) => sum + p.percentage, 0);
  const isValidPercentage = Math.abs(totalPercentage - 100) < 0.01;

  const handleFeeChange = (value: string) => {
    setFee(value);
    const feeVal = parseFloat(value) || null;
    const pool = useCustomPool ? (parseFloat(customPool) || null) : calculatePrizePool(feeVal, playerCount);
    dispatch({
      type: 'UPDATE_CONFIG',
      payload: {
        playerFee: feeVal,
        prizePool: pool,
        prizeDistribution: calculatePrizeAmounts(distribution, pool),
      },
    });
  };

  const handleCustomPoolChange = (value: string) => {
    setCustomPool(value);
    const pool = parseFloat(value) || null;
    dispatch({
      type: 'UPDATE_CONFIG',
      payload: {
        prizePool: pool,
        prizeDistribution: calculatePrizeAmounts(distribution, pool),
      },
    });
  };

  const handlePercentageChange = (position: number, newPercentage: number) => {
    const updated = distribution.map((p) =>
      p.position === position ? { ...p, percentage: newPercentage } : p
    );
    dispatch({
      type: 'UPDATE_CONFIG',
      payload: {
        prizeDistribution: calculatePrizeAmounts(updated, prizePool > 0 ? prizePool : null),
      },
    });
  };

  return (
    <div className="space-y-5">
      {/* Info opzionale */}
      <p className="text-sm text-slate-400">
        La configurazione dei premi è <strong className="text-slate-300">opzionale</strong>. 
        Puoi saltare questo passaggio e avviare il torneo.
      </p>

      {/* Quota giocatore */}
      <div className="glass-card p-4 space-y-3">
        <label className="text-sm font-medium text-slate-300">Quota per giocatore</label>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">€</span>
          <input
            type="number"
            value={fee}
            onChange={(e) => handleFeeChange(e.target.value)}
            placeholder="0"
            min="0"
            step="0.50"
            className="flex-1 px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white 
                       outline-none focus:border-emerald-400 transition-all text-right
                       [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        {feeNum > 0 && playerCount > 0 && !useCustomPool && (
          <p className="text-sm text-emerald-400">
            Montepremi: <strong>{formatCurrency(feeNum * playerCount)}</strong>{' '}
            <span className="text-slate-400">({playerCount} giocatori × {formatCurrency(feeNum)})</span>
          </p>
        )}
      </div>

      {/* Montepremi personalizzato */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-300">Montepremi personalizzato</label>
          <button
            onClick={() => {
              setUseCustomPool(!useCustomPool);
              if (useCustomPool) {
                // Torna a calcolo automatico
                const pool = calculatePrizePool(parseFloat(fee) || null, playerCount);
                dispatch({
                  type: 'UPDATE_CONFIG',
                  payload: {
                    prizePool: pool,
                    prizeDistribution: calculatePrizeAmounts(distribution, pool),
                  },
                });
              }
            }}
            className={`text-xs px-3 py-1 rounded-full transition-all cursor-pointer
              ${useCustomPool
                ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-400/30'
                : 'bg-white/10 text-slate-400 border border-white/10 hover:border-white/20'
              }`}
          >
            {useCustomPool ? 'Attivo' : 'Attiva'}
          </button>
        </div>

        {useCustomPool && (
          <div className="flex items-center gap-2 animate-fade-in">
            <span className="text-slate-400">€</span>
            <input
              type="number"
              value={customPool}
              onChange={(e) => handleCustomPoolChange(e.target.value)}
              placeholder="0"
              min="0"
              step="1"
              className="flex-1 px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white 
                         outline-none focus:border-emerald-400 transition-all text-right
                         [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        )}
      </div>

      {/* Distribuzione premi */}
      {prizePool > 0 && (
        <div className="glass-card p-4 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-slate-300">Distribuzione premi</h4>
            {!isValidPercentage && (
              <span className="text-xs text-rose-400 font-medium">
                Totale: {totalPercentage.toFixed(0)}% (deve essere 100%)
              </span>
            )}
          </div>

          <div className="space-y-3">
            {distribution.map((prize) => {
              const amount = (prize.percentage / 100) * prizePool;
              return (
                <div key={prize.position} className="flex items-center gap-3">
                  <span className="text-lg w-8 text-center">
                    {prize.position === 1 ? '🥇' : prize.position === 2 ? '🥈' : '🥉'}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={prize.percentage}
                        onChange={(e) =>
                          handlePercentageChange(prize.position, Number(e.target.value))
                        }
                        min="0"
                        max="100"
                        className="w-16 px-2 py-1.5 bg-white/10 border border-white/20 rounded text-white 
                                   text-center text-sm outline-none focus:border-emerald-400
                                   [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-sm text-slate-400">%</span>
                      <span className="text-sm text-emerald-400 font-semibold ml-auto">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Riepilogo */}
          <div className="border-t border-white/10 pt-3 flex items-center justify-between">
            <span className="text-sm text-slate-400">Montepremi totale</span>
            <span className="text-lg font-bold text-white">{formatCurrency(prizePool)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
