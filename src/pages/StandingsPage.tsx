// ============================================================================
// StandingsPage — Classifica Live, Montepremi e Premi (FASE 3 & FASE 5)
// ============================================================================

import { useNavigate } from 'react-router';
import { useTournament } from '../context/TournamentContext';
import type { StandingsEntry, Team } from '../models/types';
import { formatCurrency, getPrizeForPosition } from '../services/prizeService';

export default function StandingsPage() {
  const { state } = useTournament();
  const navigate = useNavigate();
  const tournament = state.currentTournament;

  if (!tournament) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <p className="text-slate-400 text-lg">Nessun torneo selezionato.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white 
                     font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Torna alla Home
        </button>
      </div>
    );
  }

  const { standings, teams, players, config } = tournament;
  const isCompleted = tournament.status === 'completed';

  // Ordina per posizione
  const sortedStandings = [...standings].sort((a, b) => a.position - b.position);

  const getTeam = (teamId: string): Team | undefined => {
    return teams.find((t) => t.id === teamId);
  };

  const getPlayerNames = (team?: Team): string => {
    if (!team) return '';
    const p1 = players.find((p) => p.id === team.playerIds[0]);
    const p2 = players.find((p) => p.id === team.playerIds[1]);
    return `${p1?.name ?? '?'} e ${p2?.name ?? '?'}`;
  };

  // Top 3 per il podio
  const top3 = sortedStandings.slice(0, 3);

  const renderTrend = (entry: StandingsEntry) => {
    if (!entry.previousPosition || entry.previousPosition === entry.position) {
      return <span className="text-slate-500 text-xs">—</span>;
    }
    const diff = entry.previousPosition - entry.position;
    if (diff > 0) {
      return (
        <span className="text-emerald-400 text-xs font-bold flex items-center">
          ▲ +{diff}
        </span>
      );
    }
    return (
      <span className="text-rose-400 text-xs font-bold flex items-center">
        ▼ {diff}
      </span>
    );
  };

  const prizeDist = config.prizeDistribution ?? [];
  const hasPrizes = config.prizePool !== null && (config.prizePool ?? 0) > 0 && prizeDist.length > 0;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold font-[var(--font-display)]">
              {isCompleted ? 'Classifica Finale' : 'Classifica Live'}
            </h2>
            {isCompleted ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Torneo Concluso 🏆
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            )}
          </div>
          <p className="text-slate-400 mt-1 text-sm">{config.name}</p>
        </div>

        <button
          onClick={() => navigate('/tournament')}
          className="self-start sm:self-auto px-4 py-2 text-sm text-slate-300 hover:text-white glass-card 
                     hover:border-white/20 transition-all cursor-pointer flex items-center gap-2"
        >
          <span>←</span>
          <span>Dashboard Incontri</span>
        </button>
      </div>

      {/* Banner Celebrazione Vincitore (se concluso) */}
      {isCompleted && sortedStandings.length > 0 && (
        <div className="glass-card p-5 border-amber-400/50 bg-gradient-to-r from-amber-500/20 via-emerald-500/15 to-amber-500/20 text-center space-y-2 animate-fade-in shadow-xl shadow-amber-500/10">
          <div className="text-4xl animate-bounce">🏆 🎉</div>
          <h3 className="text-xl font-black text-white">Torneo Concluso!</h3>
          <p className="text-sm text-slate-200">
            Complimenti ai vincitori:{' '}
            <strong className="text-amber-300 font-bold text-base">
              {getTeam(sortedStandings[0]?.teamId)?.customName ?? getTeam(sortedStandings[0]?.teamId)?.name}
            </strong>{' '}
            ({getPlayerNames(getTeam(sortedStandings[0]?.teamId))})
          </p>
          {hasPrizes && getPrizeForPosition(prizeDist, 1) && (
            <div className="inline-block mt-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
              💰 Primo Premio Assegnato: {formatCurrency(getPrizeForPosition(prizeDist, 1)!.amount)}
            </div>
          )}
        </div>
      )}

      {/* Banner Montepremi (se impostato) */}
      {hasPrizes && (
        <div className="glass-card p-4 border-amber-400/30 bg-amber-400/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">💰</span>
            <div>
              <span className="text-[11px] font-semibold text-amber-300/80 uppercase tracking-wider">
                Montepremi Totale
              </span>
              <p className="text-xl font-black text-white">
                {formatCurrency(config.prizePool!)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {prizeDist
              .filter((p) => p.amount > 0)
              .map((p) => (
                <span
                  key={p.position}
                  className="px-2.5 py-1 rounded bg-white/10 text-slate-200 border border-white/10"
                >
                  <strong className="text-amber-300">{p.label}:</strong>{' '}
                  {formatCurrency(p.amount)} ({p.percentage}%)
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Podio visuale per i primi 3 posti */}
      {top3.length >= 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {top3.map((entry, idx) => {
            const team = getTeam(entry.teamId);
            const prize = getPrizeForPosition(prizeDist, entry.position);
            const medals = ['🥇 1° Posto', '🥈 2° Posto', '🥉 3° Posto'];
            const borders = [
              'border-amber-400/50 bg-amber-400/10',
              'border-slate-300/40 bg-slate-300/5',
              'border-amber-700/40 bg-amber-700/5',
            ];
            const textAccents = ['text-amber-400', 'text-slate-300', 'text-amber-600'];

            return (
              <div
                key={entry.teamId}
                className={`glass-card p-4 text-center border ${borders[idx]} space-y-2 relative overflow-hidden`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-wider ${textAccents[idx]}`}>
                    {medals[idx]}
                  </span>
                  {prize && prize.amount > 0 && (
                    <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                      {formatCurrency(prize.amount)}
                    </span>
                  )}
                </div>
                <p className="font-bold text-base text-white truncate">
                  {team?.customName ?? team?.name ?? 'Coppia'}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {getPlayerNames(team)}
                </p>
                <div className="pt-2 border-t border-white/5 flex items-center justify-around text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Vinte</span>
                    <span className="font-bold text-emerald-400">{entry.wins}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Punti</span>
                    <span className="font-bold text-white text-sm">{entry.totalPoints}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Diff</span>
                    <span className={`font-bold ${entry.pointDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {entry.pointDiff > 0 ? `+${entry.pointDiff}` : entry.pointDiff}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tabella Classifica Completa */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="px-3 py-3 text-xs uppercase tracking-wider text-slate-400 font-semibold w-12 text-center">
                  Pos
                </th>
                <th className="px-2 py-3 text-xs uppercase tracking-wider text-slate-400 font-semibold w-10 text-center">
                  +/-
                </th>
                <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Coppia / Giocatori
                </th>
                <th className="px-3 py-3 text-xs uppercase tracking-wider text-slate-400 font-semibold text-center w-12">
                  G
                </th>
                <th className="px-3 py-3 text-xs uppercase tracking-wider text-emerald-400 font-semibold text-center w-12">
                  V
                </th>
                <th className="px-3 py-3 text-xs uppercase tracking-wider text-rose-400 font-semibold text-center w-12">
                  P
                </th>
                <th className="px-3 py-3 text-xs uppercase tracking-wider text-slate-400 font-semibold text-right w-20">
                  Diff
                </th>
                <th className="px-4 py-3 text-xs uppercase tracking-wider text-white font-bold text-right w-24">
                  Punti
                </th>
                {hasPrizes && (
                  <th className="px-4 py-3 text-xs uppercase tracking-wider text-amber-300 font-bold text-right w-28">
                    Premio
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedStandings.length === 0 ? (
                <tr>
                  <td colSpan={hasPrizes ? 9 : 8} className="text-center py-12 text-slate-400">
                    Nessuna coppia in classifica.
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
                      className="hover:bg-white/[0.04] transition-colors"
                    >
                      {/* Posizione */}
                      <td className="px-3 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                            ${
                              isFirst
                                ? 'bg-amber-400 text-slate-950 shadow-sm shadow-amber-400/40'
                                : isSecond
                                ? 'bg-slate-300 text-slate-950'
                                : isThird
                                ? 'bg-amber-700 text-white'
                                : 'text-slate-400'
                            }`}
                        >
                          {entry.position}
                        </span>
                      </td>

                      {/* Variazione Trend */}
                      <td className="px-2 py-3.5 text-center">
                        {renderTrend(entry)}
                      </td>

                      {/* Nome Coppia & Giocatori */}
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-white text-sm">
                          {team?.customName ?? team?.name ?? 'Coppia'}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {getPlayerNames(team)}
                        </p>
                      </td>

                      {/* Partite Giocate */}
                      <td className="px-3 py-3.5 text-center text-sm text-slate-300">
                        {entry.played}
                      </td>

                      {/* Vinte */}
                      <td className="px-3 py-3.5 text-center text-sm font-bold text-emerald-400">
                        {entry.wins}
                      </td>

                      {/* Perse */}
                      <td className="px-3 py-3.5 text-center text-sm font-medium text-rose-400">
                        {entry.losses}
                      </td>

                      {/* Differenza Punti */}
                      <td
                        className={`px-3 py-3.5 text-right text-sm font-mono
                          ${
                            entry.pointDiff > 0
                              ? 'text-emerald-400'
                              : entry.pointDiff < 0
                              ? 'text-rose-400'
                              : 'text-slate-500'
                          }`}
                      >
                        {entry.pointDiff > 0 ? `+${entry.pointDiff}` : entry.pointDiff}
                      </td>

                      {/* Punti Totali */}
                      <td className="px-4 py-3.5 text-right font-black text-white text-base">
                        {entry.totalPoints}
                      </td>

                      {/* Premio Assegnato */}
                      {hasPrizes && (
                        <td className="px-4 py-3.5 text-right text-sm font-bold text-amber-300">
                          {prize && prize.amount > 0 ? (
                            <span className="bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded">
                              {formatCurrency(prize.amount)}
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
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

      {/* Scheda Tie-Break (Sezione 10 del Project Plan) */}
      <div className="glass-card p-4 border-white/5 space-y-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 font-semibold text-slate-300">
          <span>⚖️</span>
          <span>Regole di Spareggio (Tie-Break)</span>
        </div>
        <p>
          In caso di parità, l'ordinamento è rigorosamente deterministico secondo le seguenti priorità:{' '}
          <strong className="text-slate-300">1. Punti totali</strong> →{' '}
          <strong className="text-slate-300">2. Numero di vittorie</strong> →{' '}
          <strong className="text-slate-300">3. Differenza punti</strong> →{' '}
          <strong className="text-slate-300">4. Scontro diretto (Head-to-head)</strong>.
        </p>
      </div>
    </div>
  );
}
