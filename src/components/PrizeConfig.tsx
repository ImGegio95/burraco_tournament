// ============================================================================
// PrizeConfig — Configurazione Montepremi e Distribuzione Premi (2026 Edition)
// ============================================================================

import { useState, useEffect } from 'react';
import { 
  Coins, 
  Trophy, 
  Award, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
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
    <div className="space-y-6">
      
      {/* Avviso Opzionalità */}
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
          <Coins className="w-5 h-5" />
        </div>
        <p className="text-xs sm:text-sm text-slate-300">
          La configurazione di quote e premi è <strong className="text-white">facoltativa</strong>. Se preferisci non gestire montepremi in denaro, puoi lasciare i campi vuoti e procedere direttamente all'avvio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Quota Giocatore */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            Quota Iscrizione per Giocatore
          </label>

          <div className="relative">
            <input
              type="number"
              value={fee}
              onChange={(e) => handleFeeChange(e.target.value)}
              placeholder="0.00"
              min="0"
              step="1"
              className="w-full pl-4 pr-10 py-3 glass-input text-lg font-bold text-white placeholder-slate-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
              €
            </span>
          </div>

          {feeNum > 0 && playerCount > 0 && !useCustomPool && (
            <div className="text-xs text-emerald-400 flex items-center gap-1.5 pt-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                Montepremi calcolato: <strong>{formatCurrency(feeNum * playerCount)}</strong> ({playerCount} giocatori × {formatCurrency(feeNum)})
              </span>
            </div>
          )}
        </div>

        {/* Montepremi Forfettario o Personalizzato */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Montepremi Manuale / Fisso
            </label>
            <button
              onClick={() => {
                setUseCustomPool(!useCustomPool);
                if (useCustomPool) {
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
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                useCustomPool
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                  : 'bg-white/[0.05] text-slate-400 border-white/[0.1] hover:text-white'
              }`}
            >
              {useCustomPool ? 'Attivo' : 'Imposta Manualmente'}
            </button>
          </div>

          {useCustomPool ? (
            <div className="relative animate-fade-in">
              <input
                type="number"
                value={customPool}
                onChange={(e) => handleCustomPoolChange(e.target.value)}
                placeholder="0.00"
                min="0"
                step="5"
                className="w-full pl-4 pr-10 py-3 glass-input text-lg font-bold text-white placeholder-slate-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                €
              </span>
            </div>
          ) : (
            <p className="text-xs text-slate-500 pt-2">
              Il montepremi viene calcolato automaticamente moltiplicando la quota per il numero di iscritti.
            </p>
          )}
        </div>

      </div>

      {/* Ripartizione Percentuale Premi */}
      {prizePool > 0 && (
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Ripartizione Podio</h4>
              <p className="text-xs text-slate-400">Specifica le percentuali di vincita riservate ai primi 3 classificati</p>
            </div>
            {!isValidPercentage && (
              <span className="text-xs text-rose-400 font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Totale {totalPercentage.toFixed(0)}% (deve essere 100%)</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {distribution.map((prize, idx) => {
              const amount = (prize.percentage / 100) * prizePool;
              const icons = [Trophy, Award, Award];
              const Icon = icons[idx] || Award;
              const colorConfig = [
                'text-amber-400 border-amber-400/30 bg-amber-400/10',
                'text-slate-300 border-slate-300/30 bg-slate-300/10',
                'text-amber-600 border-amber-600/30 bg-amber-600/10',
              ][idx] || 'text-slate-300 border-slate-300/30 bg-slate-300/10';

              return (
                <div
                  key={prize.position}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-black px-2 py-0.5 rounded-md border ${colorConfig}`}>
                      <Icon className="w-3.5 h-3.5" />
                      <span>{prize.label}</span>
                    </span>
                    <span className="text-base font-black text-emerald-400">
                      {formatCurrency(amount)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={prize.percentage}
                      onChange={(e) => handlePercentageChange(prize.position, Number(e.target.value))}
                      min="0"
                      max="100"
                      className="w-20 px-3 py-1.5 glass-input text-center text-sm font-bold"
                    />
                    <span className="text-xs font-bold text-slate-400">% del montepremi</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Montepremi Assegnato
            </span>
            <span className="text-xl font-black text-white font-[var(--font-display)]">
              {formatCurrency(prizePool)}
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
