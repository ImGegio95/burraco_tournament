// ============================================================================
// SetupPage — Wizard di Configurazione a 4 Step (2026 Edition)
// ============================================================================

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  Users, 
  UserCheck, 
  Trophy, 
  Coins, 
  ArrowLeft, 
  ArrowRight, 
  Rocket, 
  Edit3, 
  Check, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import PlayerManager from '../components/PlayerManager';
import TeamManager from '../components/TeamManager';
import FormatSelector from '../components/FormatSelector';
import PrizeConfig from '../components/PrizeConfig';
import { validateTournamentForStart } from '../utils/validation';

const STEPS = [
  { id: 'players', label: 'Giocatori', icon: Users, description: 'Inserisci i partecipanti individuali' },
  { id: 'teams', label: 'Coppie', icon: UserCheck, description: 'Forma le coppie (casuali o manuali)' },
  { id: 'format', label: 'Formula', icon: Trophy, description: 'Seleziona la formula di gara e i round' },
  { id: 'prizes', label: 'Montepremi', icon: Coins, description: 'Configura quote di iscrizione e premi' },
] as const;

export default function SetupPage() {
  const { state, dispatch } = useTournament();
  const navigate = useNavigate();
  const tournament = state.currentTournament;
  const [currentStep, setCurrentStep] = useState(0);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');

  if (!tournament) {
    return (
      <div className="text-center py-16 animate-fade-in glass-card max-w-lg mx-auto p-8 space-y-4">
        <p className="text-slate-400 text-base">Nessun torneo attualmente in configurazione.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer"
        >
          Torna all'Elenco Tornei
        </button>
      </div>
    );
  }

  const step = STEPS[currentStep];
  const canGoNext = checkStepValid(currentStep, tournament);
  const validationErrors = validateTournamentForStart(tournament);
  const canStart = validationErrors.length === 0 && tournament.teams.length >= 2;

  const handleNameSave = () => {
    const name = nameValue.trim();
    if (name) {
      dispatch({ type: 'UPDATE_CONFIG', payload: { name } });
    }
    setEditingName(false);
  };

  const handleStartTournament = () => {
    if (!canStart) return;
    dispatch({ type: 'START_TOURNAMENT' });
    navigate('/tournament');
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl mx-auto">
      
      {/* Header con nome torneo editabile */}
      <div className="glass-card p-5 sm:p-6 border-white/[0.08] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNameSave();
                  if (e.key === 'Escape') setEditingName(false);
                }}
                onBlur={handleNameSave}
                autoFocus
                className="text-2xl font-bold font-[var(--font-display)] bg-transparent border-b-2 border-emerald-400 text-white outline-none pb-1 w-full"
              />
            </div>
          ) : (
            <h2
              className="text-2xl sm:text-3xl font-black text-white font-[var(--font-display)] tracking-tight cursor-pointer hover:text-emerald-300 transition-colors group flex items-center gap-2"
              onClick={() => {
                setNameValue(tournament.config.name);
                setEditingName(true);
              }}
              title="Clicca per modificare il nome del torneo"
            >
              <span>{tournament.config.name}</span>
              <Edit3 className="w-4 h-4 text-slate-500 opacity-60 group-hover:opacity-100 group-hover:text-emerald-400 transition-all" />
            </h2>
          )}
          <p className="text-xs sm:text-sm text-slate-400">
            Passo {currentStep + 1} di {STEPS.length}: {step.description}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Configurazione Guidata</span>
        </div>
      </div>

      {/* Stepper a 4 fasi */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {STEPS.map((s, i) => {
          const isActive = i === currentStep;
          const isCompleted = i < currentStep;
          const isClickable = i <= getMaxReachableStep(tournament);
          const Icon = s.icon;

          return (
            <button
              key={s.id}
              onClick={() => isClickable && setCurrentStep(i)}
              disabled={!isClickable}
              className={`p-3.5 rounded-2xl transition-all cursor-pointer text-left border flex items-center gap-3 ${
                isActive
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-white shadow-lg shadow-emerald-500/10'
                  : isCompleted
                  ? 'bg-white/[0.04] border-emerald-500/20 text-slate-300 hover:bg-white/[0.06]'
                  : 'bg-white/[0.02] border-white/[0.06] text-slate-500'
              } ${!isClickable ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : isCompleted
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-white/[0.05] text-slate-500'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4 stroke-[2]" />}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Step {i + 1}
                </div>
                <div className="text-xs sm:text-sm font-bold truncate">
                  {s.label}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Pannello Contenuto Step */}
      <div className="glass-card p-6 sm:p-8 min-h-[360px] border-white/[0.08]">
        <div key={step.id} className="animate-fade-in">
          {currentStep === 0 && <PlayerManager />}
          {currentStep === 1 && <TeamManager />}
          {currentStep === 2 && <FormatSelector />}
          {currentStep === 3 && <PrizeConfig />}
        </div>
      </div>

      {/* Navigazione tra Step */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {currentStep > 0 ? (
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-slate-300 hover:text-white font-semibold text-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Indietro</span>
          </button>
        ) : (
          <div />
        )}

        {currentStep < STEPS.length - 1 ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canGoNext}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-emerald-500"
          >
            <span>Passo Successivo</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        ) : (
          <button
            onClick={handleStartTournament}
            disabled={!canStart}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-base shadow-xl shadow-emerald-500/30 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Rocket className="w-5 h-5 stroke-[2.5]" />
            <span>Avvia il Torneo</span>
          </button>
        )}
      </div>

      {/* Errori di Validazione Finale */}
      {currentStep === STEPS.length - 1 && validationErrors.length > 0 && (
        <div className="glass-card p-4 border-rose-500/30 bg-rose-500/[0.05] space-y-2 animate-fade-in">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
            <AlertTriangle className="w-4 h-4" />
            <span>Verifiche richieste prima dell'avvio:</span>
          </div>
          <ul className="space-y-1 text-xs text-rose-300 list-disc list-inside">
            {validationErrors.map((err, i) => (
              <li key={i}>{err.message}</li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}

function checkStepValid(step: number, tournament: any): boolean {
  switch (step) {
    case 0:
      return tournament.players.length >= 4 && tournament.players.length % 2 === 0;
    case 1:
      return tournament.teams.length >= 2;
    case 2:
      return true;
    case 3:
      return true;
    default:
      return false;
  }
}

function getMaxReachableStep(tournament: any): number {
  if (tournament.players.length < 4 || tournament.players.length % 2 !== 0) return 0;
  if (tournament.teams.length < 2) return 1;
  return 3;
}
