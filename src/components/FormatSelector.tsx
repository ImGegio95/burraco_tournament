// ============================================================================
// FormatSelector — Selezione formula di torneo e numero round
// ============================================================================

import { useTournament } from '../context/TournamentContext';
import type { TournamentFormat } from '../models/types';
import { suggestTournamentSetup } from '../services/tournamentService';

const FORMAT_OPTIONS: {
  id: TournamentFormat;
  name: string;
  description: string;
  icon: string;
  available: boolean;
}[] = [
  {
    id: 'swiss',
    name: 'Sistema Svizzero',
    description: 'Abbinamenti basati sulla classifica. Ideale per tornei brevi tra amici.',
    icon: '🇨🇭',
    available: true,
  },
  {
    id: 'round-robin',
    name: 'Round Robin',
    description: 'Tutti contro tutti. Ogni coppia affronta tutte le altre.',
    icon: '🔄',
    available: true,
  },
  {
    id: 'knockout',
    name: 'Eliminazione Diretta',
    description: 'Chi perde è eliminato. Quarti, semifinali, finale.',
    icon: '⚡',
    available: true,
  },
  {
    id: 'groups-playoff',
    name: 'Gironi + Playoff',
    description: 'Fase a gironi seguita da semifinali e finale.',
    icon: '🏟️',
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
    <div className="space-y-5">
      {/* Suggerimento automatico */}
      {suggestion && teamCount >= 2 && (
        <div className="glass-card p-4 border-emerald-400/20 bg-emerald-400/5">
          <p className="text-sm text-emerald-300 flex items-center gap-2">
            <span>💡</span>
            <span>
              <strong>Suggerimento:</strong>{' '}
              {FORMAT_OPTIONS.find((f) => f.id === suggestion.format)?.name} con{' '}
              {suggestion.rounds} round per {teamCount} coppie.
            </span>
          </p>
        </div>
      )}

      {/* Selezione formula */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FORMAT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => opt.available && handleFormatChange(opt.id)}
            disabled={!opt.available}
            className={`p-4 rounded-xl text-left transition-all cursor-pointer border
              ${format === opt.id
                ? 'bg-emerald-600/20 border-emerald-400/50 ring-1 ring-emerald-400/30'
                : opt.available
                  ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20'
                  : 'bg-white/[0.02] border-white/5 opacity-50 cursor-not-allowed'
              }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl">{opt.icon}</span>
              <span className="font-semibold text-white text-sm">{opt.name}</span>
              {!opt.available && (
                <span className="text-[10px] bg-white/10 text-slate-400 px-1.5 py-0.5 rounded-full ml-auto">
                  Prossimamente
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{opt.description}</p>
          </button>
        ))}
      </div>

      {/* Numero round */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-300">
            Numero di round
          </label>
          <span className="text-lg font-bold text-emerald-400">{totalRounds}</span>
        </div>

        {format === 'knockout' ? (
          <p className="text-xs text-slate-400">
            Il numero di round è determinato automaticamente dal numero di coppie.
          </p>
        ) : (
          <>
            <input
              type="range"
              min={minRounds}
              max={maxRounds}
              value={totalRounds}
              onChange={(e) => handleRoundsChange(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>{minRounds}</span>
              <span>{maxRounds}</span>
            </div>
          </>
        )}

        {/* Info round */}
        <div className="text-xs text-slate-400 space-y-1">
          {format === 'round-robin' && (
            <p>
              Round Robin standard: {teamCount > 0 ? teamCount - 1 : 'N-1'} round 
              per far incontrare tutte le coppie.
            </p>
          )}
          {format === 'swiss' && (
            <p>
              {totalRounds} round con abbinamenti basati sulla classifica.
              Partite totali: ~{teamCount > 0 ? Math.floor(teamCount / 2) * totalRounds : 0}.
            </p>
          )}
          {format === 'knockout' && teamCount > 0 && (
            <p>
              {teamCount} coppie → {Math.ceil(Math.log2(teamCount))} turni eliminatori.
            </p>
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
