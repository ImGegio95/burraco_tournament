// ============================================================================
// StandingsPage — Classifica Live con Tie-Break e Trend Posizioni (FASE 3)
// ============================================================================

import { useNavigate } from 'react-router';
import { useTournament } from '../context/TournamentContext';
import type { StandingsEntry, Team } from '../models/types';

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

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold font-[var(--font-display)]">
              Classifica Live
            </h2>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
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

      {/* Podio visuale per i primi 3 posti (se ci sono partite giocate o almeno 3 squadre) */}
      {top3.length >= 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {top3.map((entry, idx) => {
            const team = getTeam(entry.teamId);
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
                className={`glass-card p-4 text-center border ${borders[idx]} space-y-2`}
              >
                <span className={`text-xs font-bold uppercase tracking-wider ${textAccents[idx]}`}>
                  {medals[idx]}
                </span>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedStandings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    Nessuna coppia in classifica.
                  </td>
                </tr>
              ) : (
                sortedStandings.map((entry) => {
                  const team = getTeam(entry.teamId);
                  const isFirst = entry.position === 1;
                  const isSecond = entry.position === 2;
                  const isThird = entry.position === 3;

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
