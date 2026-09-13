// ============================================================================
// FormatSelector — Selezione Formula e Parametri Gara (2026 Edition)
// ============================================================================

import { 
  GitFork, 
  Repeat, 
  Swords, 
  Layers, 
  Lightbulb, 
  CheckCircle2, 
  Sliders
} from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import type { TournamentFormat } from '../models/types';
import { suggestTournamentSetup } from '../services/tournamentService';

const FORMAT_OPTIONS = [
  {
    id: 'swiss' as TournamentFormat,
    name: 'Sistema Svizzero',
    subtitle: 'Consigliato per serate e club',
    description: 'Abbinamenti equi basati sul punteggio live, nessun re-match e rotazione dei turni di riposo.',
    icon: GitFork,
    available: true,
  },
  {
    id: 'round-robin' as TournamentFormat,
    name: 'Round Robin',
    subtitle: 'Girone all\'Italiana',
    description: 'Tutti contro tutti con metodo Berger circle. Ogni coppia affronta tutte le altre.',
    icon: Repeat,
    available: true,
  },
  {
    id: 'knockout' as TournamentFormat,
    name: 'Eliminazione Diretta',
    subtitle: 'Tabellone Tennistico',
    description: 'Incontri a eliminazione secca: chi vince avanza verso Semifinali e Finale.',
    icon: Swords,
    available: true,
  },
  {
    id: 'groups-playoff' as TournamentFormat,
    name: 'Gironi + Playoff',
    subtitle: 'Fase Mista',
    description: 'Fase preliminare a gironi seguita da tabellone ad eliminazione diretta.',
    icon: Layers,
    available: false,
  },
];

export default function FormatSelector() {
  const { state, dispatch } = useTournament();
  const tournament = state.currentTournament;

  if (!tournament) return null;

  const { format, totalRounds } = tournament.config;
  const teamCount = tournament.teams.length;
  const suggestion = teamCount >= 2 ? suggestTournamentSetup(teamCount) : null;

  const handleFormatChange = (newFormat: TournamentFormat) => {
    const suggested = suggestTournamentSetup(teamCount);
    const rounds = newFormat === suggested.format ? suggested.rounds : getDefaultRounds(newFormat, teamCount);
    dispatch({ type: 'SET_FORMAT', payload: { format: newFormat, rounds } });
  };

  const handleRoundsChange = (rounds: number) => {
    dispatch({ type: 'SET_FORMAT', payload: { format, rounds } });
  };

  const maxRounds = getMaxRounds(format, teamCount);
  const minRounds = 1;

  return (
    <div className="space-y-6">
      
      {/* Suggerimento Algoritmico */}
      {suggestion && teamCount >= 2 && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
              Configurazione Consigliata
            </span>
            <p className="text-sm text-slate-200">
              Per <strong>{teamCount} coppie</strong> consigliamo il <strong>{FORMAT_OPTIONS.find((f) => f.id === suggestion.format)?.name}</strong> con <strong>{suggestion.rounds} round</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Griglia Selezione Formule */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Scegli la Formula di Gara
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {FORMAT_OPTIONS.map((opt) => {
            const isSelected = format === opt.id;
            const Icon = opt.icon;

            return (
              <button
                key={opt.id}
                onClick={() => opt.available && handleFormatChange(opt.id)}
                disabled={!opt.available}
                className={`p-4 sm:p-5 rounded-2xl text-left transition-all cursor-pointer border flex flex-col justify-between gap-3 relative ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500/50 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-400/40'
                    : opt.available
                    ? 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.15]'
                    : 'bg-white/[0.01] border-white/[0.04] opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                        : 'bg-white/[0.05] text-slate-400 border-white/[0.08]'
                    }`}>
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">
                        {opt.name}
                      </h4>
                      <p className="text-[11px] font-semibold text-emerald-400/90 uppercase tracking-wider">
                        {opt.subtitle}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 stroke-[2.5] shrink-0" />
                  )}

                  {!opt.available && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/[0.08] text-slate-400 uppercase tracking-wider shrink-0">
                      In Arrivo
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {opt.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Regolazione Round */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-white">Numero Totale di Round</span>
          </div>
          <span className="text-xl font-black text-emerald-400 font-[var(--font-display)]">
            {totalRounds} {totalRounds === 1 ? 'Round' : 'Round'}
          </span>
        </div>

        {format === 'knockout' ? (
          <p className="text-xs text-slate-400">
            Nel torneo a eliminazione diretta, il numero di round è calcolato automaticamente sulla base del tabellone tennistico ({totalRounds} turni per {teamCount} coppie).
          </p>
        ) : (
          <div className="space-y-2">
            <input
              type="range"
              min={minRounds}
              max={maxRounds}
              value={totalRounds}
              onChange={(e) => handleRoundsChange(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-white/10 rounded-lg"
            />
            <div className="flex justify-between text-xs text-slate-500 font-semibold">
              <span>{minRounds} Minimo</span>
              <span>{maxRounds} Massimo</span>
            </div>
          </div>
        )}

        <div className="text-xs text-slate-400 border-t border-white/[0.06] pt-3">
          {format === 'round-robin' && (
            <p>Con {teamCount} coppie, il Round Robin completo prevede {teamCount > 0 ? teamCount - 1 : 'N-1'} turni di gara.</p>
          )}
          {format === 'swiss' && (
            <p>Con il Sistema Svizzero disputerai {totalRounds} turni con abbinamenti di classifica sempre bilanciati.</p>
          )}
        </div>
      </div>

    </div>
  );
}

function getDefaultRounds(format: TournamentFormat, teamCount: number): number {
  if (teamCount < 2) return 1;
  switch (format) {
    case 'round-robin':
      return teamCount - 1;
    case 'swiss':
      return suggestTournamentSetup(teamCount).rounds;
    case 'knockout':
      return Math.ceil(Math.log2(teamCount));
    default:
      return 3;
  }
}

function getMaxRounds(format: TournamentFormat, teamCount: number): number {
  if (teamCount < 2) return 1;
  switch (format) {
    case 'round-robin':
      return Math.max(teamCount - 1, 1);
    case 'swiss':
      return Math.max(teamCount - 1, 1);
    case 'knockout':
      return Math.ceil(Math.log2(Math.max(teamCount, 2)));
    default:
      return 10;
  }
}
