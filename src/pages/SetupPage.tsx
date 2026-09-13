// ============================================================================
// SetupPage — Wizard configurazione torneo a 4 step
// ============================================================================

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTournament } from '../context/TournamentContext';
import PlayerManager from '../components/PlayerManager';
import TeamManager from '../components/TeamManager';
import FormatSelector from '../components/FormatSelector';
import PrizeConfig from '../components/PrizeConfig';
import { validateTournamentForStart } from '../utils/validation';

const STEPS = [
  { id: 'players', label: 'Giocatori', icon: '👥', description: 'Aggiungi i partecipanti' },
  { id: 'teams', label: 'Coppie', icon: '🤝', description: 'Forma le coppie' },
  { id: 'format', label: 'Formula', icon: '🏆', description: 'Scegli la formula di torneo' },
  { id: 'prizes', label: 'Premi', icon: '💰', description: 'Configura il montepremi' },
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
    <div className="animate-fade-in space-y-6">
      {/* Header con nome torneo editabile */}
      <div>
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
              className="text-2xl font-bold font-[var(--font-display)] bg-transparent border-b-2 
                         border-emerald-400 text-white outline-none pb-1 w-full"
            />
          </div>
        ) : (
          <h2
            className="text-2xl font-bold font-[var(--font-display)] cursor-pointer 
                       hover:text-emerald-400 transition-colors group flex items-center gap-2"
            onClick={() => {
              setNameValue(tournament.config.name);
              setEditingName(true);
            }}
          >
            {tournament.config.name}
            <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
              ✏️
            </span>
          </h2>
        )}
        <p className="text-slate-400 mt-1">{step.description}</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1 sm:gap-2">
        {STEPS.map((s, i) => {
          const isActive = i === currentStep;
          const isCompleted = i < currentStep;
          const isClickable = i <= getMaxReachableStep(tournament);

          return (
            <button
              key={s.id}
              onClick={() => isClickable && setCurrentStep(i)}
              disabled={!isClickable}
              className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all cursor-pointer
                ${isActive
                  ? 'bg-emerald-600/20 border border-emerald-400/30'
                  : isCompleted
                    ? 'bg-white/[0.06] border border-white/10'
                    : 'bg-transparent border border-transparent'
                }
                ${!isClickable ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/[0.06]'}
              `}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                  ${isActive
                    ? 'bg-emerald-600 text-white'
                    : isCompleted
                      ? 'bg-emerald-600/40 text-emerald-400'
                      : 'bg-white/10 text-slate-500'
                  }`}
              >
                {isCompleted ? '✓' : s.icon}
              </div>
              <span
                className={`text-[11px] font-medium hidden sm:block
                  ${isActive ? 'text-emerald-400' : isCompleted ? 'text-slate-300' : 'text-slate-500'}
                `}
              >
                {s.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Contenuto step */}
      <div className="min-h-[300px]">
        <div key={step.id} className="animate-fade-in">
          {currentStep === 0 && <PlayerManager />}
          {currentStep === 1 && <TeamManager />}
          {currentStep === 2 && <FormatSelector />}
          {currentStep === 3 && <PrizeConfig />}
        </div>
      </div>

      {/* Navigazione */}
      <div className="flex items-center gap-3 pt-2 border-t border-white/10">
        {currentStep > 0 && (
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="px-5 py-3 text-slate-400 hover:text-white transition-colors cursor-pointer 
                       flex items-center gap-1"
          >
            <span>←</span>
            <span>Indietro</span>
          </button>
        )}

        <div className="flex-1" />

        {currentStep < STEPS.length - 1 ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canGoNext}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold 
                       rounded-lg transition-all active:scale-[0.97] cursor-pointer 
                       flex items-center gap-2
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-emerald-600"
          >
            <span>Avanti</span>
            <span>→</span>
          </button>
        ) : (
          <button
            onClick={handleStartTournament}
            disabled={!canStart}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold 
                       rounded-lg transition-all active:scale-[0.97] cursor-pointer 
                       flex items-center gap-2 text-lg
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-emerald-600
                       shadow-lg shadow-emerald-600/20"
          >
            <span>🚀</span>
            <span>Avvia Torneo</span>
          </button>
        )}
      </div>

      {/* Errori validazione (solo sull'ultimo step) */}
      {currentStep === STEPS.length - 1 && validationErrors.length > 0 && (
        <div className="glass-card p-3 border-rose-400/20 bg-rose-400/5 space-y-1">
          <p className="text-xs font-semibold text-rose-400">Prima di avviare il torneo:</p>
          {validationErrors.map((err, i) => (
            <p key={i} className="text-xs text-rose-300 flex items-center gap-1.5">
              <span>•</span>
              {err.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Verifica se il passo corrente è valido per poter procedere.
 */
function checkStepValid(step: number, tournament: any): boolean {
  switch (step) {
    case 0: // Giocatori
      return tournament.players.length >= 4 && tournament.players.length % 2 === 0;
    case 1: // Coppie
      return tournament.teams.length >= 2;
    case 2: // Formula
      return true; // La formula ha sempre un default
    case 3: // Premi
      return true; // I premi sono opzionali
    default:
      return false;
  }
}

/**
 * Calcola lo step massimo raggiungibile in base ai dati inseriti.
 */
function getMaxReachableStep(tournament: any): number {
  if (tournament.players.length < 4 || tournament.players.length % 2 !== 0) return 0;
  if (tournament.teams.length < 2) return 1;
  return 3; // Tutti gli step accessibili
}
