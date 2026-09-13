// ============================================================================
// Layout — Shell moderna con Navbar Frosted Glass e Responsive Grid (2026)
// ============================================================================

import { Outlet, Link, useLocation } from 'react-router';
import { Trophy, Layers, ChevronLeft, Sparkles } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';

export default function Layout() {
  const location = useLocation();
  const { state } = useTournament();
  const isHome = location.pathname === '/';
  const currentTournament = state.currentTournament;

  return (
    <div className="min-h-dvh flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Navbar con Frosted Glass */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/75 border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <Link
            to="/"
            className="flex items-center gap-3 no-underline group transition-transform active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-shadow">
              <Trophy className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-white font-[var(--font-display)]">
                  Burraco
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="w-2.5 h-2.5" />
                  Pro Manager
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400 hidden sm:block leading-none">
                Gestione Tornei & Classifiche Live
              </p>
            </div>
          </Link>

          {/* Navigazione Destra */}
          <div className="flex items-center gap-3">
            {currentTournament && !isHome && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs">
                <span className="text-slate-400">Torneo:</span>
                <span className="font-semibold text-white truncate max-w-[160px]">
                  {currentTournament.config.name}
                </span>
                <span className={`w-2 h-2 rounded-full ${currentTournament.status === 'in-progress' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
              </div>
            )}

            {!isHome ? (
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-slate-200 hover:text-white transition-all no-underline"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Tutti i Tornei</span>
              </Link>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/[0.03] border border-white/[0.06] px-3 py-1.5 rounded-xl">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>{state.tournaments.length} {state.tournaments.length === 1 ? 'Torneo' : 'Tornei'}</span>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* Modern Minimal Footer */}
      <footer className="border-t border-white/[0.06] py-5 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Burraco Tournament Manager &copy; 2026</span>
          <span className="text-slate-600 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Salvataggio locale automatico attivo
          </span>
        </div>
      </footer>
    </div>
  );
}
