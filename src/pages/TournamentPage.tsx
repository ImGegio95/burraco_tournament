// ============================================================================
// TournamentPage — Dashboard torneo (placeholder FASE 0)
// ============================================================================

import { useNavigate } from 'react-router';
import { useTournament } from '../context/TournamentContext';

export default function TournamentPage() {
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

  const completedRounds = tournament.rounds.filter((r) => r.completed).length;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header torneo */}
      <div>
        <h2 className="text-2xl font-bold font-[var(--font-display)]">
          {tournament.config.name}
        </h2>
        <p className="text-slate-400 mt-1 flex items-center gap-2">
          <span className="capitalize">
            {tournament.config.format === 'round-robin' && 'Round Robin'}
            {tournament.config.format === 'swiss' && 'Sistema Svizzero'}
            {tournament.config.format === 'knockout' && 'Eliminazione Diretta'}
          </span>
          <span>•</span>
          <span>{tournament.teams.length} coppie</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Round',
            value: `${completedRounds} / ${tournament.config.totalRounds}`,
            icon: '🔄',
          },
          {
            label: 'Coppie',
            value: tournament.teams.length.toString(),
            icon: '👥',
          },
          {
            label: 'Partite',
            value: tournament.rounds
              .flatMap((r) => r.matches)
              .filter((m) => m.status === 'confirmed')
              .length.toString(),
            icon: '🎯',
          },
          {
            label: 'Stato',
            value: tournament.status === 'in-progress' ? 'In corso' : 'Setup',
            icon: '📊',
          },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder contenuti */}
      <div className="glass-card p-8 text-center">
        <div className="text-5xl mb-4">🏆</div>
        <h3 className="text-xl font-semibold mb-2">Dashboard Torneo</h3>
        <p className="text-slate-400 mb-4">
          Le seguenti funzionalità saranno implementate nelle fasi successive:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto text-left">
          <div className="glass-card p-4">
            <p className="font-medium text-amber-400 mb-1">Fase 2-3</p>
            <p className="text-sm text-slate-300">Partite e risultati</p>
          </div>
          <div className="glass-card p-4">
            <p className="font-medium text-emerald-400 mb-1">Fase 3</p>
            <p className="text-sm text-slate-300">Classifica live</p>
          </div>
          <div className="glass-card p-4">
            <p className="font-medium text-rose-400 mb-1">Fase 5</p>
            <p className="text-sm text-slate-300">Montepremi</p>
          </div>
          <div className="glass-card p-4">
            <p className="font-medium text-slate-400 mb-1">Fase 7</p>
            <p className="text-sm text-slate-300">Import / Export</p>
          </div>
        </div>
      </div>

      {/* Link classifica */}
      <button
        onClick={() => navigate('/standings')}
        className="w-full glass-card-light p-4 text-center hover:bg-white/[0.12] 
                   transition-all cursor-pointer flex items-center justify-center gap-2"
      >
        <span className="text-xl">📊</span>
        <span className="font-semibold">Vai alla Classifica</span>
      </button>
    </div>
  );
}
