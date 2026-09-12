// ============================================================================
// SetupPage — Configurazione torneo (placeholder FASE 0)
// ============================================================================

import { useNavigate } from 'react-router';
import { useTournament } from '../context/TournamentContext';

export default function SetupPage() {
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

  return (
    <div className="animate-fade-in space-y-6">
      {/* Titolo */}
      <div>
        <h2 className="text-2xl font-bold font-[var(--font-display)]">
          {tournament.config.name}
        </h2>
        <p className="text-slate-400 mt-1">Configura il tuo torneo</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {['Giocatori', 'Coppie', 'Formula', 'Premi'].map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${i === 0
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/10 text-slate-500'
                }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-sm hidden sm:inline ${
                i === 0 ? 'text-white' : 'text-slate-500'
              }`}
            >
              {step}
            </span>
            {i < 3 && (
              <div className="w-8 h-px bg-white/10" />
            )}
          </div>
        ))}
      </div>

      {/* Placeholder per il contenuto della FASE 1 */}
      <div className="glass-card p-8 text-center">
        <div className="text-5xl mb-4">👥</div>
        <h3 className="text-xl font-semibold mb-2">Gestione Giocatori</h3>
        <p className="text-slate-400 mb-6">
          Questa sezione sarà implementata nella <strong>FASE 1</strong>.
        </p>
        <div className="space-y-3 text-left max-w-sm mx-auto text-slate-300">
          <div className="flex items-center gap-3">
            <span className="text-emerald-400">✓</span>
            <span>Aggiunta e rimozione giocatori</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-emerald-400">✓</span>
            <span>Creazione coppie manuale</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-emerald-400">✓</span>
            <span>Generazione coppie casuale</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-emerald-400">✓</span>
            <span>Scelta formula di torneo</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-emerald-400">✓</span>
            <span>Configurazione premi</span>
          </div>
        </div>
      </div>
    </div>
  );
}
