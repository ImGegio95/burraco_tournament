// ============================================================================
// MatchCard — Card Incontro Moderna Stile Esports / Tabellone Sportivo (2026)
// ============================================================================

import { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Trophy, 
  Lock, 
  Unlock, 
  Coffee
} from 'lucide-react';
import type { Match, Team, Player } from '../models/types';
import { useTournament } from '../context/TournamentContext';

interface MatchCardProps {
  match: Match;
  roundId: string;
  teams: Team[];
  players: Player[];
}

export default function MatchCard({ match, roundId, teams, players }: MatchCardProps) {
  const { dispatch } = useTournament();

  const teamA = teams.find((t) => t.id === match.teamAId);
  const teamB = teams.find((t) => t.id === match.teamBId);
  const isBye = match.teamBId === null;

  const [inputA, setInputA] = useState<string>(
    match.scoreA !== null ? String(match.scoreA) : ''
  );
  const [inputB, setInputB] = useState<string>(
    match.scoreB !== null ? String(match.scoreB) : ''
  );
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const getPlayerNames = (team?: Team): string => {
    if (!team) return '';
    const p1 = players.find((p) => p.id === team.playerIds[0]);
    const p2 = players.find((p) => p.id === team.playerIds[1]);
    return `${p1?.name ?? '?'} • ${p2?.name ?? '?'}`;
  };

  const handleConfirm = () => {
    const sA = parseInt(inputA, 10);
    const sB = parseInt(inputB, 10);
    if (isNaN(sA) || isNaN(sB)) return;

    dispatch({
      type: 'CONFIRM_MATCH',
      payload: {
        roundId,
        matchId: match.id,
        scoreA: sA,
        scoreB: sB,
      },
    });
    setIsEditing(false);
  };

  const handleReset = () => {
    dispatch({
      type: 'RESET_MATCH',
      payload: {
        roundId,
        matchId: match.id,
      },
    });
    setShowConfirmReset(false);
    setIsEditing(true);
  };

  // Scheda Turno di Riposo (BYE)
  if (isBye) {
    return (
      <div className="glass-card p-4 sm:p-5 border-dashed border-amber-500/30 bg-amber-500/[0.03] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base">
                {teamA?.customName ?? teamA?.name ?? 'Coppia'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                BYE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {getPlayerNames(teamA)}
            </p>
          </div>
        </div>
        <div className="text-xs text-amber-300/80 sm:text-right font-medium">
          Turno di riposo per numero dispari di squadre
        </div>
      </div>
    );
  }

  const isConfirmed = match.status === 'confirmed' && !isEditing;
  const isScoreValid = inputA.trim() !== '' && inputB.trim() !== '' && !isNaN(Number(inputA)) && !isNaN(Number(inputB));

  const winner = isConfirmed
    ? match.scoreA! > match.scoreB!
      ? 'A'
      : match.scoreB! > match.scoreA!
      ? 'B'
      : 'draw'
    : null;

  return (
    <div className="glass-card p-4 sm:p-5 border-white/[0.08] hover:border-white/[0.16] transition-all space-y-4">
      {/* Header card: Tavolo & Stato */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>TAVOLO {match.table}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isConfirmed ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Concluso</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>In corso</span>
            </span>
          )}
        </div>
      </div>

      {/* Tabellone Squadra A vs Squadra B */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3">
        
        {/* Box Squadra A */}
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            winner === 'A'
              ? 'bg-emerald-500/[0.08] border-emerald-500/40 shadow-sm shadow-emerald-500/10'
              : 'bg-white/[0.02] border-white/[0.06]'
          }`}
        >
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md">
              SQUADRA 1
            </span>
            {winner === 'A' && (
              <span className="inline-flex items-center gap-1 text-[11px] uppercase font-black text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                <Trophy className="w-3 h-3" />
                Vinto
              </span>
            )}
          </div>

          <h5 className="font-bold text-white text-base mt-2 truncate">
            {teamA?.customName ?? teamA?.name ?? 'Coppia A'}
          </h5>
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            {getPlayerNames(teamA)}
          </p>

          {/* Punteggio o Input */}
          <div className="mt-3">
            {isConfirmed ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-white tracking-tight font-[var(--font-display)]">
                  {match.scoreA}
                </span>
                <span className="text-xs font-semibold text-slate-400 uppercase">punti</span>
              </div>
            ) : (
              <input
                type="number"
                inputMode="numeric"
                placeholder="Punteggio..."
                value={inputA}
                onChange={(e) => setInputA(e.target.value)}
                className="w-full px-3 py-2 glass-input text-base font-bold placeholder-slate-500"
              />
            )}
          </div>
        </div>

        {/* Separatore VS centrale */}
        <div className="text-center py-1 sm:py-0 flex sm:flex-col items-center justify-center gap-1">
          <div className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.1] text-slate-300 text-xs font-black inline-flex items-center justify-center">
            VS
          </div>
          {isConfirmed && match.scoreA !== null && match.scoreB !== null && (
            <span className="text-[11px] text-slate-400 font-mono font-medium">
              Δ {Math.abs(match.scoreA - match.scoreB)}
            </span>
          )}
        </div>

        {/* Box Squadra B */}
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            winner === 'B'
              ? 'bg-emerald-500/[0.08] border-emerald-500/40 shadow-sm shadow-emerald-500/10'
              : 'bg-white/[0.02] border-white/[0.06]'
          }`}
        >
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-md">
              SQUADRA 2
            </span>
            {winner === 'B' && (
              <span className="inline-flex items-center gap-1 text-[11px] uppercase font-black text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                <Trophy className="w-3 h-3" />
                Vinto
              </span>
            )}
          </div>

          <h5 className="font-bold text-white text-base mt-2 truncate">
            {teamB?.customName ?? teamB?.name ?? 'Coppia B'}
          </h5>
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            {getPlayerNames(teamB)}
          </p>

          {/* Punteggio o Input */}
          <div className="mt-3">
            {isConfirmed ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-white tracking-tight font-[var(--font-display)]">
                  {match.scoreB}
                </span>
                <span className="text-xs font-semibold text-slate-400 uppercase">punti</span>
              </div>
            ) : (
              <input
                type="number"
                inputMode="numeric"
                placeholder="Punteggio..."
                value={inputB}
                onChange={(e) => setInputB(e.target.value)}
                className="w-full px-3 py-2 glass-input text-base font-bold placeholder-slate-500"
              />
            )}
          </div>
        </div>

      </div>

      {/* Footer / Azioni di Blocco e Conferma */}
      <div className="pt-2 flex items-center justify-between border-t border-white/[0.06]">
        {isConfirmed ? (
          <div className="flex items-center justify-between w-full">
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Risultato registrato</span>
            </span>

            {showConfirmReset ? (
              <div className="flex items-center gap-2 animate-fade-in">
                <span className="text-xs text-rose-300 font-medium hidden sm:inline">Vuoi riaprire la partita?</span>
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Sì, sblocca
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="px-2.5 py-1.5 text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  Annulla
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer py-1.5 px-3 rounded-lg hover:bg-white/[0.06]"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Modifica</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-end gap-2.5 w-full">
            {isEditing && (
              <button
                onClick={() => {
                  setInputA(String(match.scoreA ?? ''));
                  setInputB(String(match.scoreB ?? ''));
                  setIsEditing(false);
                }}
                className="px-3 py-2 text-slate-400 hover:text-white text-xs font-medium cursor-pointer"
              >
                Annulla
              </button>
            )}
            <button
              onClick={handleConfirm}
              disabled={!isScoreValid}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-emerald-500"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>Conferma Risultato</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
