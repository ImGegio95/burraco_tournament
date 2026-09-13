// ============================================================================
// TournamentPage — Dashboard Torneo con Calendario Incontri e Tavoli (FASE 2)
// ============================================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTournament } from '../context/TournamentContext';
import type { Match, Team } from '../models/types';

export default function TournamentPage() {
  const { state, dispatch } = useTournament();
  const navigate = useNavigate();
  const tournament = state.currentTournament;

  const [activeRoundNumber, setActiveRoundNumber] = useState<number>(1);

  // Se i round non sono ancora stati generati (ad es. per tornei avviati prima di Fase 2),
  // o se il numero di round è 0, generiamoli automaticamente se il torneo è in-progress
  useEffect(() => {
    if (
      tournament &&
      tournament.status === 'in-progress' &&
      tournament.rounds.length === 0 &&
      tournament.teams.length >= 2
    ) {
      dispatch({ type: 'GENERATE_ROUNDS' });
    }
  }, [tournament, dispatch]);

  // Seleziona di default il primo round non completato
  useEffect(() => {
    if (tournament && tournament.rounds.length > 0) {
      const firstIncomplete = tournament.rounds.find((r) => !r.completed);
      if (firstIncomplete) {
        setActiveRoundNumber(firstIncomplete.number);
      } else {
        setActiveRoundNumber(1);
      }
    }
  }, [tournament?.id]);

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

  const { rounds, teams, players, config } = tournament;
  const completedRounds = rounds.filter((r) => r.completed).length;
  const totalMatches = rounds.flatMap((r) => r.matches).length;
  const confirmedMatches = rounds
    .flatMap((r) => r.matches)
    .filter((m) => m.status === 'confirmed').length;

  const activeRound = rounds.find((r) => r.number === activeRoundNumber) ?? rounds[0];

  const getTeam = (teamId: string | null): Team | undefined => {
    if (!teamId) return undefined;
    return teams.find((t) => t.id === teamId);
  };

  const getPlayerNames = (team?: Team): string => {
    if (!team) return '';
    const p1 = players.find((p) => p.id === team.playerIds[0]);
    const p2 = players.find((p) => p.id === team.playerIds[1]);
    return `${p1?.name ?? '?'} e ${p2?.name ?? '?'}`;
  };

  const formatLabels: Record<string, string> = {
    'round-robin': 'Round Robin',
    swiss: 'Sistema Svizzero',
    knockout: 'Eliminazione Diretta',
    'groups-playoff': 'Gironi + Playoff',
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header torneo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold font-[var(--font-display)]">
              {config.name}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {tournament.status === 'in-progress' ? 'In Corso' : 'Concluso'}
            </span>
          </div>
          <p className="text-slate-400 mt-1 flex items-center gap-2 text-sm">
            <span>{formatLabels[config.format] ?? config.format}</span>
            <span>•</span>
            <span>{teams.length} coppie</span>
            <span>•</span>
            <span>{rounds.length} round previsti</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/standings')}
            className="px-4 py-2.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 
                       border border-emerald-400/30 text-emerald-300 font-medium 
                       transition-all cursor-pointer flex items-center gap-1.5 text-sm"
          >
            <span>📊</span>
            <span>Classifica</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Round',
            value: `${completedRounds} / ${rounds.length || config.totalRounds}`,
            icon: '🔄',
          },
          {
            label: 'Coppie',
            value: teams.length.toString(),
            icon: '👥',
          },
          {
            label: 'Partite Concluse',
            value: `${confirmedMatches} / ${totalMatches}`,
            icon: '🎯',
          },
          {
            label: 'Tavoli Simultanei',
            value: Math.floor(teams.length / 2).toString(),
            icon: '🪑',
          },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-3.5 text-center">
            <div className="text-xl mb-0.5">{stat.icon}</div>
            <div className="text-lg font-bold text-white">{stat.value}</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider mt-0.5">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Sezione Round & Incontri */}
      {rounds.length === 0 ? (
        <div className="glass-card p-8 text-center space-y-4">
          <div className="text-4xl">🎲</div>
          <h3 className="text-lg font-semibold">Calendario non ancora generato</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Genera automaticamente il calendario degli incontri Round Robin per tutte le coppie.
          </p>
          <button
            onClick={() => dispatch({ type: 'GENERATE_ROUNDS' })}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold 
                       rounded-lg transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
          >
            Genera Incontri
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Selettore Round (Tab / Pills) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {rounds.map((r) => {
              const isSelected = r.number === activeRoundNumber;
              return (
                <button
                  key={r.id}
                  onClick={() => setActiveRoundNumber(r.number)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2
                    ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : r.completed
                        ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/20 hover:bg-white/[0.08]'
                        : 'bg-white/[0.05] text-slate-300 border border-white/10 hover:bg-white/[0.08]'
                    }`}
                >
                  <span>Round {r.number}</span>
                  {r.completed && <span className="text-xs">✓</span>}
                </button>
              );
            })}
          </div>

          {/* Dettaglio del Round attivo */}
          {activeRound && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm px-1">
                <span className="font-semibold text-slate-300 flex items-center gap-2">
                  <span>Partite Round {activeRound.number}</span>
                  <span className="text-xs font-normal text-slate-400">
                    ({activeRound.matches.length} incontri)
                  </span>
                </span>
                {activeRound.completed ? (
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">
                    Completato
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium">
                    Da disputare
                  </span>
                )}
              </div>

              {/* Lista delle partite */}
              <div className="space-y-3">
                {activeRound.matches.map((match: Match) => {
                  const teamA = getTeam(match.teamAId);
                  const teamB = getTeam(match.teamBId);
                  const isBye = match.teamBId === null;

                  if (isBye) {
                    return (
                      <div
                        key={match.id}
                        className="glass-card p-4 border-dashed border-amber-400/30 bg-amber-400/5 
                                   flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 text-xs font-semibold">
                            💤 Turno di Riposo
                          </span>
                          <div>
                            <p className="font-semibold text-white">
                              {teamA?.customName ?? teamA?.name ?? 'Coppia'}
                            </p>
                            <p className="text-xs text-slate-400">
                              {getPlayerNames(teamA)}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-amber-300/80">
                          Questa coppia riposa in questo round (BYE)
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={match.id}
                      className="glass-card p-4 hover:border-emerald-400/30 transition-all space-y-3"
                    >
                      {/* Header partita */}
                      <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/5 pb-2">
                        <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                          <span>🪑</span>
                          <span>Tavolo {match.table}</span>
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-white/10 text-slate-300">
                          {match.status === 'confirmed' ? 'Concluso' : 'In attesa'}
                        </span>
                      </div>

                      {/* Scontro coppie */}
                      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3">
                        {/* Squadra A */}
                        <div className="bg-white/[0.03] p-3 rounded-lg border border-white/5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-emerald-400 font-bold text-sm">A</span>
                            <p className="font-semibold text-white truncate">
                              {teamA?.customName ?? teamA?.name ?? 'Coppia A'}
                            </p>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">
                            {getPlayerNames(teamA)}
                          </p>
                        </div>

                        {/* VS badge */}
                        <div className="text-center my-1 sm:my-0">
                          <span className="w-8 h-8 rounded-full bg-white/10 text-slate-300 text-xs font-bold inline-flex items-center justify-center border border-white/15">
                            VS
                          </span>
                        </div>

                        {/* Squadra B */}
                        <div className="bg-white/[0.03] p-3 rounded-lg border border-white/5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-amber-400 font-bold text-sm">B</span>
                            <p className="font-semibold text-white truncate">
                              {teamB?.customName ?? teamB?.name ?? 'Coppia B'}
                            </p>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">
                            {getPlayerNames(teamB)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigazione rapida alla classifica */}
      <div className="pt-2">
        <button
          onClick={() => navigate('/standings')}
          className="w-full glass-card-light p-4 text-center hover:bg-white/[0.12] 
                     transition-all cursor-pointer flex items-center justify-center gap-2 font-semibold text-white"
        >
          <span className="text-xl">🏆</span>
          <span>Visualizza Classifica Live</span>
        </button>
      </div>
    </div>
  );
}
