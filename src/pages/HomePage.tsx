// ============================================================================
// HomePage — Lista tornei e creazione nuovo torneo
// ============================================================================

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTournament } from '../context/TournamentContext';

export default function HomePage() {
  const { state, dispatch } = useTournament();
  const navigate = useNavigate();
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = () => {
    const name = newName.trim() || 'Torneo di Burraco';
    dispatch({ type: 'CREATE_TOURNAMENT', payload: { name } });
    setNewName('');
    setShowNewForm(false);
    // Il torneo viene impostato come corrente dal reducer
    // Navigheremo alla pagina di setup nella FASE 1
    navigate('/setup');
  };

  const handleOpen = (id: string) => {
    const tournament = state.tournaments.find((t) => t.id === id);
    if (tournament) {
      dispatch({ type: 'SET_CURRENT_TOURNAMENT', payload: tournament });
      if (tournament.status === 'setup') {
        navigate('/setup');
      } else {
        navigate('/tournament');
      }
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo torneo?')) {
      dispatch({ type: 'DELETE_TOURNAMENT', payload: id });
    }
  };

  const sortedTournaments = [...state.tournaments].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="animate-fade-in space-y-8">
      {/* Hero */}
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🃏</div>
        <h2 className="text-3xl font-bold font-[var(--font-display)] mb-2">
          Burraco Tournament
        </h2>
        <p className="text-slate-400 text-lg">
          Gestisci i tuoi tornei di burraco tra amici
        </p>
      </div>

      {/* Nuovo Torneo */}
      <div className="flex justify-center">
        {!showNewForm ? (
          <button
            onClick={() => setShowNewForm(true)}
            className="group relative px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold 
                       rounded-xl text-lg transition-all duration-250 shadow-lg hover:shadow-xl 
                       hover:shadow-emerald-500/20 active:scale-[0.98] cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span className="text-2xl">+</span>
              Nuovo Torneo
            </span>
          </button>
        ) : (
          <div className="glass-card-light p-6 w-full max-w-md animate-slide-up">
            <h3 className="text-lg font-semibold mb-4">Crea Nuovo Torneo</h3>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Nome del torneo..."
              autoFocus
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg 
                         text-white placeholder-slate-400 outline-none focus:border-emerald-400 
                         focus:ring-2 focus:ring-emerald-400/20 transition-all"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCreate}
                className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white 
                           font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Crea Torneo
              </button>
              <button
                onClick={() => {
                  setShowNewForm(false);
                  setNewName('');
                }}
                className="px-4 py-3 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Annulla
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lista tornei */}
      {sortedTournaments.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm uppercase tracking-widest text-slate-500 font-semibold px-1">
            I tuoi tornei
          </h3>
          {sortedTournaments.map((t, index) => (
            <div
              key={t.id}
              className="glass-card p-4 flex items-center justify-between gap-4 
                         hover:bg-white/[0.08] transition-all cursor-pointer group"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => handleOpen(t.id)}
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white truncate group-hover:text-emerald-400 transition-colors">
                  {t.config.name}
                </h4>
                <div className="flex items-center gap-3 text-sm text-slate-400 mt-1">
                  <span>{t.teams.length} coppie</span>
                  <span>•</span>
                  <span className="capitalize">
                    {t.config.format === 'round-robin' && 'Round Robin'}
                    {t.config.format === 'swiss' && 'Sistema Svizzero'}
                    {t.config.format === 'knockout' && 'Eliminazione Diretta'}
                    {t.config.format === 'groups-playoff' && 'Gironi + Playoff'}
                  </span>
                  <span>•</span>
                  <StatusBadge status={t.status} />
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(t.id);
                }}
                className="p-2 text-slate-500 hover:text-rose-400 transition-colors 
                           opacity-0 group-hover:opacity-100 cursor-pointer"
                title="Elimina torneo"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {sortedTournaments.length === 0 && !showNewForm && (
        <div className="text-center py-8 text-slate-500">
          <p className="text-lg">Nessun torneo ancora.</p>
          <p className="text-sm mt-1">Crea il tuo primo torneo!</p>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    setup: { label: 'In preparazione', color: 'text-amber-400' },
    'in-progress': { label: 'In corso', color: 'text-emerald-400' },
    completed: { label: 'Completato', color: 'text-slate-400' },
  }[status] ?? { label: status, color: 'text-slate-400' };

  return <span className={`${config.color} text-xs font-medium`}>{config.label}</span>;
}
