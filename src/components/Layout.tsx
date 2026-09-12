// ============================================================================
// Layout — Shell principale dell'app
// ============================================================================

import { Outlet, Link, useLocation } from 'react-router';

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="glass-card sticky top-0 z-50 border-x-0 border-t-0 rounded-none">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 no-underline text-white hover:opacity-90 transition-opacity"
          >
            <span className="text-2xl">🃏</span>
            <div>
              <h1 className="text-lg font-bold font-[var(--font-display)] leading-tight tracking-tight">
                Burraco
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 leading-none">
                Tournament Manager
              </p>
            </div>
          </Link>

          {!isHome && (
            <Link
              to="/"
              className="text-sm text-slate-400 hover:text-white transition-colors no-underline flex items-center gap-1"
            >
              <span>←</span>
              <span>Tornei</span>
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-600">
        <p>Burraco Tournament Manager v1.0</p>
      </footer>
    </div>
  );
}
