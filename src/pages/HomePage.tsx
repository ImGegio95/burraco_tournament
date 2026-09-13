// ============================================================================
// HomePage — Dashboard Moderna dei Tornei (2026 Edition)
// ============================================================================

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  Plus, 
  Upload, 
  Trophy, 
  Users, 
  Calendar, 
  Trash2, 
  ArrowRight, 
  AlertCircle, 
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { validateAndImportTournament } from '../services/storageService';
import type { Tournament } from '../models/types';

export default function HomePage() {
  const { state, dispatch } = useTournament();
  const navigate = useNavigate();
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const handleCreate = () => {
    const name = newName.trim() || 'Torneo di Burraco';
    dispatch({ type: 'CREATE_TOURNAMENT', payload: { name } });
    setNewName('');
    setShowNewForm(false);
    navigate('/setup');
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = validateAndImportTournament(content);
      if (res.success && res.tournament) {
        dispatch({ type: 'IMPORT_TOURNAMENT', payload: res.tournament });
        setImportError(null);
        if (res.tournament.status === 'in-progress' || res.tournament.status === 'completed') {
          navigate('/tournament');
        } else {
          navigate('/setup');
        }
      } else {
        setImportError(res.error || 'Impossibile importare il torneo.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleOpen = (tournament: Tournament) => {
    dispatch({ type: 'SET_CURRENT_TOURNAMENT', payload: tournament });
    if (tournament.status === 'setup') {
      navigate('/setup');
    } else {
      navigate('/tournament');
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Sei sicuro di voler eliminare definitivamente il torneo "${name}"?`)) {
      dispatch({ type: 'DELETE_TOURNAMENT', payload: id });
    }
  };

  const sortedTournaments = [...state.tournaments].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="animate-fade-in space-y-8">
      {/* Hero Section Moderna */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 border border-white/[0.08] bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-emerald-950/20 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Burraco Championship Suite</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-[var(--font-display)]">
            Gestisci i tuoi tornei di Burraco con precisione
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Algoritmi professionali (Round Robin, Sistema Svizzero, Eliminazione Diretta), assegnazione tavoli, montepremi e classifiche in tempo reale con tie-break automatico.
          </p>

          {/* Quick Actions */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowNewForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>Nuovo Torneo</span>
            </button>

            <label className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-slate-200 hover:text-white font-semibold text-sm transition-all active:scale-[0.98] cursor-pointer">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Importa JSON</span>
              <input
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleFileImport}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Modal / Card di Creazione Nuovo Torneo */}
      {showNewForm && (
        <div className="glass-card p-6 sm:p-8 border-emerald-500/30 bg-slate-900/90 animate-fade-in shadow-2xl relative">
          <div className="max-w-md space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white font-[var(--font-display)]">
                Crea un nuovo Torneo
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Dai un nome al torneo. Potrai configurare squadre, formula e montepremi nel passaggio successivo.
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="Es. Torneo d'Autunno 2026"
                autoFocus
                className="w-full px-4 py-3.5 glass-input text-base placeholder-slate-500"
              />

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCreate}
                  className="flex-1 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Continua alla Configurazione
                </button>
                <button
                  onClick={() => {
                    setShowNewForm(false);
                    setNewName('');
                  }}
                  className="px-4 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white font-semibold text-sm transition-all cursor-pointer"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Error Banner */}
      {importError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{importError}</span>
        </div>
      )}

      {/* Griglia Tornei */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white font-[var(--font-display)]">
              I Tuoi Tornei
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/[0.06] text-slate-400 border border-white/[0.08]">
              {sortedTournaments.length}
            </span>
          </div>
        </div>

        {sortedTournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedTournaments.map((t) => {
              const completedRounds = t.rounds.filter((r) => r.completed).length;
              const totalRounds = t.rounds.length || t.config.totalRounds;
              const progressPct = totalRounds > 0 ? Math.round((completedRounds / totalRounds) * 100) : 0;

              return (
                <div
                  key={t.id}
                  onClick={() => handleOpen(t)}
                  className="glass-card glass-card-interactive p-5 sm:p-6 flex flex-col justify-between gap-5 cursor-pointer group relative overflow-hidden"
                >
                  <div className="space-y-3">
                    {/* Header card con Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <FormatBadge format={t.config.format} />
                      <StatusChip status={t.status} />
                    </div>

                    {/* Nome Torneo */}
                    <div>
                      <h4 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1 font-[var(--font-display)]">
                        {t.config.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Aggiornato {new Date(t.updatedAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {/* Metriche Rapide */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06]">
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <Users className="w-4 h-4 text-emerald-400/80 shrink-0" />
                        <span><strong>{t.teams.length}</strong> Coppie</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <Calendar className="w-4 h-4 text-emerald-400/80 shrink-0" />
                        <span><strong>{completedRounds}/{totalRounds}</strong> Round</span>
                      </div>
                    </div>

                    {/* Progress Bar Round */}
                    {t.status !== 'setup' && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-[11px] font-medium text-slate-400">
                          <span>Avanzamento</span>
                          <span className="text-emerald-400">{progressPct}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Azioni Card */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      {t.status === 'setup' ? 'Configura Torneo' : 'Apri Dashboard'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(t.id, t.config.name);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Elimina torneo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State Moderno */
          <div className="glass-card p-10 sm:p-14 text-center space-y-4 border-dashed border-white/10">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-emerald-400">
              <Trophy className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h4 className="text-lg font-bold text-white font-[var(--font-display)]">
                Nessun torneo presente
              </h4>
              <p className="text-sm text-slate-400">
                Inizia creando un nuovo torneo oppure importa un backup in formato JSON per visualizzare incontri e classifiche.
              </p>
            </div>
            <button
              onClick={() => setShowNewForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Crea il tuo Primo Torneo</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FormatBadge({ format }: { format: string }) {
  const map: Record<string, { label: string; bg: string }> = {
    'round-robin': { label: 'Round Robin', bg: 'bg-teal-500/10 text-teal-300 border-teal-500/20' },
    swiss: { label: 'Svizzero', bg: 'bg-sky-500/10 text-sky-300 border-sky-500/20' },
    knockout: { label: 'Eliminazione', bg: 'bg-amber-500/10 text-amber-300 border-amber-500/20' },
    'groups-playoff': { label: 'Gironi + Playoff', bg: 'bg-purple-500/10 text-purple-300 border-purple-500/20' },
  };

  const item = map[format] ?? { label: format, bg: 'bg-slate-500/10 text-slate-300 border-slate-500/20' };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${item.bg}`}>
      {item.label}
    </span>
  );
}

function StatusChip({ status }: { status: string }) {
  if (status === 'in-progress') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        In Corso
      </span>
    );
  }
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-500/15 text-slate-300 border border-slate-500/25">
        <CheckCircle2 className="w-3 h-3 text-slate-400" />
        Concluso
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/25">
      <Clock className="w-3 h-3 text-amber-400" />
      Setup
    </span>
  );
}
