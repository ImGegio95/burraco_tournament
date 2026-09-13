// ============================================================================
// TournamentPage — Dashboard Incontri e Calendario Round (2026 Edition)
// ============================================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  Trophy, 
  Download, 
  BarChart3, 
  Users, 
  Layers, 
  CheckCircle2, 
  TableProperties, 
  Sparkles, 
  ArrowRight,
  Clock
} from 'lucide-react';
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
      <div className="text-center py-16 animate-fade-in glass-card max-w-lg mx-auto p-8 space-y-4">
        <p className="text-slate-400 text-base">Nessun torneo attualmente selezionato.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer"
        >
          Torna all'Elenco Tornei
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
    'round-robin': 'Round Robin (Girone all\'Italiana)',
    swiss: 'Sistema Svizzero',
    knockout: 'Eliminazione Diretta',
    'groups-playoff': 'Gironi + Playoff',
  };

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* Header del Torneo */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 glass-card p-5 sm:p-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-2xl sm:text-3xl font-black text-white font-[var(--font-display)] tracking-tight">
              {config.name}
            </h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
              tournament.status === 'in-progress' 
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                : 'bg-slate-500/15 text-slate-300 border-slate-500/25'
            }`}>
              {tournament.status === 'in-progress' ? '● In Corso' : '✓ Concluso'}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-emerald-400">{formatLabels[config.format] ?? config.format}</span>
            <span>•</span>
            <span>{teams.length} Coppie</span>
            <span>•</span>
            <span>{rounds.length} Round programmati</span>
          </p>
        </div>

        {/* Azioni Rapide */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => downloadTournamentFile(tournament)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-slate-200 hover:text-white font-semibold text-xs sm:text-sm transition-all active:scale-[0.98] cursor-pointer"
            title="Scarica backup JSON del torneo"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Esporta JSON</span>
          </button>

          <button
            onClick={() => navigate('/standings')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 stroke-[2.5]" />
            <span>Classifica Live</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          {
            label: 'Round Disputati',
            value: `${completedRounds} / ${rounds.length || config.totalRounds}`,
            icon: Layers,
            accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
          },
          {
            label: 'Coppie Iscritte',
            value: teams.length.toString(),
            icon: Users,
            accent: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
          },
          {
            label: 'Partite Concluse',
            value: `${confirmedMatches} / ${totalMatches}`,
            icon: CheckCircle2,
            accent: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
          },
          {
            label: 'Tavoli di Gioco',
            value: Math.floor(teams.length / 2).toString(),
            icon: TableProperties,
            accent: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card p-4 sm:p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${stat.accent}`}>
                <Icon className="w-6 h-6 stroke-[2]" />
              </div>
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl font-black text-white font-[var(--font-display)] tracking-tight">
                  {stat.value}
                </div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 truncate">
                  {stat.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sezione Round & Incontri */}
      {rounds.length === 0 ? (
        <div className="glass-card p-10 sm:p-14 text-center space-y-4 max-w-lg mx-auto border-dashed border-white/10">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-white font-[var(--font-display)]">
              Calendario non ancora generato
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Genera automaticamente tutti i turni e gli incontri per le coppie partecipanti secondo la formula prescelta.
            </p>
          </div>
          <button
            onClick={() => dispatch({ type: 'GENERATE_ROUNDS' })}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            <span>Genera Incontri Ora</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Selettore Round (Segmented Control) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {rounds.map((r) => {
              const isSelected = r.number === activeRoundNumber;
              const roundTitle = config.format === 'knockout'
                ? `${getKnockoutRoundName(r.matches.length)} (R${r.number})`
                : `Round ${r.number}`;

              return (
                <button
                  key={r.id}
                  onClick={() => setActiveRoundNumber(r.number)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/25'
                      : r.completed
                      ? 'bg-white/[0.04] text-emerald-400 border-emerald-500/20 hover:bg-white/[0.08]'
                      : 'bg-white/[0.03] text-slate-300 border-white/[0.08] hover:bg-white/[0.06]'
                  }`}
                >
                  <span>{roundTitle}</span>
                  {r.completed && (
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950 stroke-[2.5]' : 'text-emerald-400'}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Dettaglio del Round attivo */}
          {activeRound && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs sm:text-sm px-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-base">
                    {config.format === 'knockout'
                      ? getKnockoutRoundName(activeRound.matches.length)
                      : `Incontri Round ${activeRound.number}`}
                  </span>
                  <span className="text-xs text-slate-400">
                    ({activeRound.matches.length} partite in programma)
                  </span>
                </div>

                {activeRound.completed ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Round Completato
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    <Clock className="w-3.5 h-3.5" />
                    In Svolgimento
                  </span>
                )}
              </div>

              {/* Lista delle Partite */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

      {/* Banner Generazione Prossimo Round per formule sequenziali */}
      {(config.format === 'swiss' || config.format === 'knockout') &&
        rounds.length > 0 &&
        rounds.length < config.totalRounds && (
          <div className="glass-card p-5 border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-slate-900/40 to-emerald-500/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-white text-sm sm:text-base">
                  Round {rounds.length} {rounds[rounds.length - 1].completed ? 'Completato!' : 'in corso...'}
                </h4>
              </div>
              <p className="text-xs text-slate-300">
                {rounds[rounds.length - 1].completed
                  ? `Tutti i risultati del turno sono registrati. Puoi generare gli abbinamenti del Round ${rounds.length + 1}.`
                  : `Completa e conferma tutti i punteggi del Round ${rounds.length} per abilitare il turno successivo.`}
              </p>
            </div>
            <button
              onClick={() => {
                dispatch({ type: 'GENERATE_NEXT_ROUND' });
                setActiveRoundNumber(rounds.length + 1);
              }}
              disabled={!rounds[rounds.length - 1].completed}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-emerald-500/20 whitespace-nowrap"
            >
              <span>Genera Round {rounds.length + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      {/* Footer Banner Navigazione Classifica */}
      <div className="pt-2">
        <button
          onClick={() => navigate('/standings')}
          className="w-full glass-card p-4 sm:p-5 text-center hover:border-emerald-500/40 transition-all cursor-pointer flex items-center justify-center gap-2.5 font-bold text-sm sm:text-base text-white group"
        >
          <Trophy className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
          <span>Apri la Classifica Live Completa & Podio</span>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </div>
  );
}
