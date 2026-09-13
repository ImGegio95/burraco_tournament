// ============================================================================
// StandingsPage — Classifica Live, Podio Top 3 e Montepremi (2026 Edition)
// ============================================================================

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  Trophy, 
  Award, 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Coins, 
  Info, 
  ChevronDown, 
  ChevronUp
} from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import type { StandingsEntry, Team } from '../models/types';
import { formatCurrency, getPrizeForPosition } from '../services/prizeService';

export default function StandingsPage() {
  const { state } = useTournament();
  const navigate = useNavigate();
  const tournament = state.currentTournament;
  const [showTieBreakRules, setShowTieBreakRules] = useState(false);

  if (!tournament) {
    return (
      <div className="text-center py-16 animate-fade-in glass-card max-w-lg mx-auto p-8 space-y-4">
        <p className="text-slate-400 text-base">Nessun torneo attualmente selezionato.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer"
        >
          Torna alla Home
        </button>
      </div>
    );
  }

  const { standings, teams, players, config } = tournament;
  const isCompleted = tournament.status === 'completed';

  const sortedStandings = [...standings].sort((a, b) => a.position - b.position);

  const getTeam = (teamId: string): Team | undefined => {
    return teams.find((t) => t.id === teamId);
  };

  const getPlayerNames = (team?: Team): string => {
    if (!team) return '';
    const p1 = players.find((p) => p.id === team.playerIds[0]);
    const p2 = players.find((p) => p.id === team.playerIds[1]);
    return `${p1?.name ?? '?'} • ${p2?.name ?? '?'}`;
  };

  const top3 = sortedStandings.slice(0, 3);
  const prizeDist = config.prizeDistribution ?? [];
  const hasPrizes = config.prizePool !== null && (config.prizePool ?? 0) > 0 && prizeDist.length > 0;

  const renderTrend = (entry: StandingsEntry) => {
    if (!entry.previousPosition || entry.previousPosition === entry.position) {
      return (
        <span className="text-slate-500 inline-flex items-center">
          <Minus className="w-3.5 h-3.5" />
        </span>
      );
    }
    const diff = entry.previousPosition - entry.position;
    if (diff > 0) {
      return (
        <span className="inline-flex items-center gap-0.5 text-emerald-400 text-xs font-bold">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+{diff}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-0.5 text-rose-400 text-xs font-bold">
        <TrendingDown className="w-3.5 h-3.5" />
        <span>{diff}</span>
      </span>
    );
  };

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 glass-card p-5 sm:p-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-2xl sm:text-3xl font-black text-white font-[var(--font-display)] tracking-tight">
              {isCompleted ? 'Classifica Finale' : 'Classifica Live'}
            </h2>
            {isCompleted ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Trophy className="w-3.5 h-3.5" />
                Torneo Concluso
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Update
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            {config.name} • {teams.length} Coppie partecipanti
          </p>
        </div>

        <button
          onClick={() => navigate('/tournament')}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-slate-200 hover:text-white font-semibold text-xs sm:text-sm transition-all active:scale-[0.98] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard Incontri</span>
        </button>
      </div>

      {/* Banner Vincitore Assoluto (se concluso) */}
      {isCompleted && sortedStandings.length > 0 && (
        <div className="glass-card p-6 border-amber-400/40 bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-amber-500/15 text-center space-y-2.5 animate-fade-in shadow-2xl shadow-amber-500/10">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center mx-auto text-amber-400">
            <Trophy className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h3 className="text-2xl font-black text-white font-[var(--font-display)]">
            Vincitori del Torneo!
          </h3>
          <p className="text-base text-slate-200">
            Complimenti a{' '}
            <strong className="text-amber-300 font-extrabold text-lg">
              {getTeam(sortedStandings[0]?.teamId)?.customName ?? getTeam(sortedStandings[0]?.teamId)?.name}
            </strong>{' '}
            ({getPlayerNames(getTeam(sortedStandings[0]?.teamId))})
          </p>
          {hasPrizes && getPrizeForPosition(prizeDist, 1) && (
            <div className="inline-flex items-center gap-2 mt-1 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
              <Coins className="w-3.5 h-3.5" />
              <span>1° Premio Assegnato: {formatCurrency(getPrizeForPosition(prizeDist, 1)!.amount)}</span>
            </div>
          )}
        </div>
      )}

      {/* Banner Montepremi */}
      {hasPrizes && (
        <div className="glass-card p-5 border-amber-500/25 bg-gradient-to-r from-amber-500/[0.07] to-slate-900/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                Montepremi Totale
              </span>
              <div className="text-2xl font-black text-white font-[var(--font-display)]">
                {formatCurrency(config.prizePool!)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {prizeDist
              .filter((p) => p.amount > 0)
              .map((p) => (
                <div
                  key={p.position}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs flex items-center gap-2"
                >
                  <span className="text-amber-400 font-bold">{p.label}:</span>
                  <span className="font-extrabold text-white">{formatCurrency(p.amount)}</span>
                  <span className="text-slate-400 text-[10px]">({p.percentage}%)</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Podio Top 3 */}
      {top3.length >= 2 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {top3.map((entry, idx) => {
            const team = getTeam(entry.teamId);
            const prize = getPrizeForPosition(prizeDist, entry.position);

            const podiumConfig = [
              {
                rank: '1° Posto',
                border: 'border-amber-400/50 bg-gradient-to-b from-amber-500/15 to-slate-900/60',
                badgeBg: 'bg-amber-400 text-slate-950',
                accentText: 'text-amber-400',
                icon: Trophy,
              },
              {
                rank: '2° Posto',
                border: 'border-slate-300/40 bg-gradient-to-b from-slate-300/10 to-slate-900/60',
                badgeBg: 'bg-slate-300 text-slate-950',
                accentText: 'text-slate-300',
                icon: Award,
              },
              {
                rank: '3° Posto',
                border: 'border-amber-700/40 bg-gradient-to-b from-amber-700/15 to-slate-900/60',
                badgeBg: 'bg-amber-700 text-white',
                accentText: 'text-amber-500',
                icon: Award,
              },
            ][idx];

            const Icon = podiumConfig.icon;

            return (
              <div
                key={entry.teamId}
                className={`glass-card p-5 border ${podiumConfig.border} flex flex-col justify-between space-y-3 relative overflow-hidden`}
              >
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${podiumConfig.badgeBg}`}>
                    <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{podiumConfig.rank}</span>
                  </span>

                  {prize && prize.amount > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                      <Coins className="w-3 h-3" />
                      <span>{formatCurrency(prize.amount)}</span>
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-extrabold text-lg text-white truncate font-[var(--font-display)]">
                    {team?.customName ?? team?.name ?? 'Coppia'}
                  </h4>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {getPlayerNames(team)}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.06] grid grid-cols-3 text-center">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">Vittorie</span>
                    <span className="text-base font-black text-emerald-400">{entry.wins}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">Diff Punti</span>
                    <span className={`text-base font-black ${entry.pointDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {entry.pointDiff > 0 ? `+${entry.pointDiff}` : entry.pointDiff}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">Totale</span>
                    <span className="text-base font-black text-white">{entry.totalPoints}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tabella Classifica Completa */}
      <div className="glass-card overflow-hidden border-white/[0.08]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                <th className="px-4 py-3.5 text-[11px] uppercase tracking-wider text-slate-400 font-bold w-14 text-center">
                  Pos
                </th>
                <th className="px-2 py-3.5 text-[11px] uppercase tracking-wider text-slate-400 font-bold w-12 text-center">
                  Trend
                </th>
                <th className="px-4 py-3.5 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                  Coppia / Componenti
                </th>
                <th className="px-3 py-3.5 text-[11px] uppercase tracking-wider text-slate-400 font-bold text-center w-14">
                  G
                </th>
                <th className="px-3 py-3.5 text-[11px] uppercase tracking-wider text-emerald-400 font-bold text-center w-14">
                  V
                </th>
                <th className="px-3 py-3.5 text-[11px] uppercase tracking-wider text-rose-400 font-bold text-center w-14">
                  P
                </th>
                <th className="px-4 py-3.5 text-[11px] uppercase tracking-wider text-slate-400 font-bold text-right w-24">
                  Diff
                </th>
                <th className="px-5 py-3.5 text-[11px] uppercase tracking-wider text-white font-black text-right w-28">
                  Punti
                </th>
                {hasPrizes && (
                  <th className="px-5 py-3.5 text-[11px] uppercase tracking-wider text-amber-400 font-black text-right w-32">
                    Premio
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {sortedStandings.length === 0 ? (
                <tr>
                  <td colSpan={hasPrizes ? 9 : 8} className="text-center py-16 text-slate-400 text-sm">
                    Nessuna coppia attualmente in classifica.
                  </td>
                </tr>
              ) : (
                sortedStandings.map((entry) => {
                  const team = getTeam(entry.teamId);
                  const isFirst = entry.position === 1;
                  const isSecond = entry.position === 2;
                  const isThird = entry.position === 3;
                  const prize = getPrizeForPosition(prizeDist, entry.position);

                  return (
                    <tr
                      key={entry.teamId}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      {/* Posizione */}
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-xl text-xs font-black
                            ${
                              isFirst
                                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                                : isSecond
                                ? 'bg-slate-300 text-slate-950'
                                : isThird
                                ? 'bg-amber-700 text-white'
                                : 'bg-white/[0.05] text-slate-300'
                            }`}
                        >
                          {entry.position}
                        </span>
                      </td>

                      {/* Trend */}
                      <td className="px-2 py-4 text-center">
                        {renderTrend(entry)}
                      </td>

                      {/* Nome Squadra & Giocatori */}
                      <td className="px-4 py-4">
                        <div className="font-bold text-white text-sm">
                          {team?.customName ?? team?.name ?? 'Coppia'}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {getPlayerNames(team)}
                        </div>
                      </td>

                      {/* Giocate */}
                      <td className="px-3 py-4 text-center text-xs font-semibold text-slate-300">
                        {entry.played}
                      </td>

                      {/* Vinte */}
                      <td className="px-3 py-4 text-center text-xs font-bold text-emerald-400">
                        {entry.wins}
                      </td>

                      {/* Perse */}
                      <td className="px-3 py-4 text-center text-xs font-semibold text-rose-400">
                        {entry.losses}
                      </td>

                      {/* Differenza Punti */}
                      <td className="px-4 py-4 text-right text-xs font-mono font-bold">
                        <span className={entry.pointDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {entry.pointDiff > 0 ? `+${entry.pointDiff}` : entry.pointDiff}
                        </span>
                      </td>

                      {/* Punti Torneo */}
                      <td className="px-5 py-4 text-right">
                        <span className="text-base font-black text-white font-[var(--font-display)]">
                          {entry.totalPoints}
                        </span>
                      </td>

                      {/* Premio spettante */}
                      {hasPrizes && (
                        <td className="px-5 py-4 text-right">
                          {prize && prize.amount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                              <Coins className="w-3 h-3" />
                              <span>{formatCurrency(prize.amount)}</span>
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">—</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regole di Spareggio Collassabili */}
      <div className="glass-card overflow-hidden border-white/[0.08]">
        <button
          onClick={() => setShowTieBreakRules(!showTieBreakRules)}
          className="w-full p-4 flex items-center justify-between text-left text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-300">Criteri Ufficiali di Ordinamento e Spareggio (Tie-Break)</span>
          </div>
          {showTieBreakRules ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTieBreakRules && (
          <div className="px-4 pb-4 pt-1 text-xs text-slate-300 border-t border-white/[0.04] space-y-1.5 animate-fade-in leading-relaxed">
            <p>
              In caso di parità di punteggio, l'ordinamento in classifica è rigorosamente deterministico e calcolato in base alla seguente priorità:
            </p>
            <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-400">
              <li><strong className="text-white">Punti Totali di Torneo</strong> (somma dei punteggi di tutti i match)</li>
              <li><strong className="text-white">Maggior numero di vittorie</strong></li>
              <li><strong className="text-white">Differenza punti complessiva</strong> (punti fatti - punti subiti)</li>
              <li><strong className="text-white">Scontro Diretto (Head-to-head)</strong> tra le coppie a pari punti</li>
              <li><strong className="text-white">Ordine alfabetico</strong> del nome squadra per determinismo assoluto</li>
            </ol>
          </div>
        )}
      </div>

    </div>
  );
}
