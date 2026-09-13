// ============================================================================
// TournamentPage — Dashboard Torneo con Calendario Incontri e Tavoli (FASE 2)
// ============================================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTournament } from '../context/TournamentContext';
import type { Match } from '../models/types';
import MatchCard from '../components/MatchCard';
import { downloadTournamentFile } from '../services/storageService';
import { getKnockoutRoundName } from '../algorithms/knockout';

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
            onClick={() => downloadTournamentFile(tournament)}
            className="px-3.5 py-2.5 rounded-lg glass-card hover:bg-white/10 
                       border border-white/10 text-slate-300 font-medium 
                       transition-all cursor-pointer flex items-center gap-1.5 text-sm"
            title="Scarica backup JSON del torneo"
          >
            <span>💾</span>
            <span className="hidden sm:inline">Esporta JSON</span>
          </button>
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
                  <span>
                    {config.format === 'knockout'
                      ? `${getKnockoutRoundName(r.matches.length)} (R${r.number})`
                      : `Round ${r.number}`}
                  </span>
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
                  <span>
                    {config.format === 'knockout'
                      ? getKnockoutRoundName(activeRound.matches.length)
                      : `Partite Round ${activeRound.number}`}
                  </span>
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
                {activeRound.matches.map((match: Match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    roundId={activeRound.id}
                    teams={teams}
                    players={players}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Azione Genera Prossimo Round per formule sequenziali (Swiss & Knockout) */}
      {(config.format === 'swiss' || config.format === 'knockout') &&
        rounds.length > 0 &&
        rounds.length < config.totalRounds && (
          <div className="glass-card p-4 border-emerald-500/30 bg-emerald-500/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="font-bold text-white text-sm">
                Round {rounds.length} {rounds[rounds.length - 1].completed ? 'completato! 🎉' : 'in corso...'}
              </p>
              <p className="text-xs text-slate-300">
                {rounds[rounds.length - 1].completed
                  ? `Puoi ora generare il turno successivo con i vincitori qualificati.`
                  : `Completa tutti i risultati del Round ${rounds.length} per procedere.`}
              </p>
            </div>
            <button
              onClick={() => {
                dispatch({ type: 'GENERATE_NEXT_ROUND' });
                setActiveRoundNumber(rounds.length + 1);
              }}
              disabled={!rounds[rounds.length - 1].completed}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shadow-md shadow-emerald-600/20"
            >
              Genera Prossimo Turno →
            </button>
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
