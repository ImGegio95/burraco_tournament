// ============================================================================
// StandingsPage — Classifica (placeholder FASE 0)
// ============================================================================

import { useNavigate } from 'react-router';
import { useTournament } from '../context/TournamentContext';

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

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-[var(--font-display)]">
            Classifica
          </h2>
          <p className="text-slate-400 mt-1">{tournament.config.name}</p>
        </div>
        <button
          onClick={() => navigate('/tournament')}
          className="px-4 py-2 text-sm text-slate-400 hover:text-white glass-card 
                     transition-colors cursor-pointer"
        >
          ← Dashboard
        </button>
      </div>

      {/* Tabella classifica placeholder */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-xs uppercase tracking-wider text-slate-500 px-4 py-3 w-12">
                #
              </th>
              <th className="text-left text-xs uppercase tracking-wider text-slate-500 px-4 py-3">
                Coppia
              </th>
              <th className="text-center text-xs uppercase tracking-wider text-slate-500 px-4 py-3 w-12">
                V
              </th>
              <th className="text-center text-xs uppercase tracking-wider text-slate-500 px-4 py-3 w-12">
                S
              </th>
              <th className="text-right text-xs uppercase tracking-wider text-slate-500 px-4 py-3 w-20">
                Punti
              </th>
            </tr>
          </thead>
          <tbody>
            {tournament.teams.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-500">
                  <div className="text-4xl mb-3">📊</div>
                  <p>La classifica sarà disponibile dopo l'inserimento dei risultati.</p>
                  <p className="text-sm mt-1">(Implementazione nella FASE 3)</p>
                </td>
              </tr>
            ) : (
              tournament.teams.map((team, index) => {
                const entry = tournament.standings.find(
                  (s) => s.teamId === team.id
                );
                return (
                  <tr
                    key={team.id}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`text-sm font-bold ${
                          index === 0
                            ? 'text-amber-400'
                            : index === 1
                              ? 'text-slate-300'
                              : index === 2
                                ? 'text-amber-600'
                                : 'text-slate-500'
                        }`}
                      >
                        {entry?.position ?? index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-white">
                        {team.customName || team.name}
                      </span>
                    </td>
                    <td className="text-center px-4 py-3 text-emerald-400 font-medium">
                      {entry?.wins ?? 0}
                    </td>
                    <td className="text-center px-4 py-3 text-rose-400 font-medium">
                      {entry?.losses ?? 0}
                    </td>
                    <td className="text-right px-4 py-3 font-bold text-white">
                      {entry?.totalPoints ?? 0}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
