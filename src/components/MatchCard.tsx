// ============================================================================
// MatchCard — Card singola partita con inserimento e conferma risultati
// ============================================================================

import { useState } from 'react';
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
    return `${p1?.name ?? '?'} e ${p2?.name ?? '?'}`;
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

  if (isBye) {
    return (
      <div className="glass-card p-4 border-dashed border-amber-400/30 bg-amber-400/5 
                     flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 text-xs font-semibold">
            💤 Turno di Riposo
          </span>
          <div>
            <p className="font-semibold text-white">
              {teamA?.customName ?? teamA?.name ?? 'Coppia'}
            </p>
            <p className="text-xs text-slate-400">
              {getPlayerNames(teamA)}
            </p>
          </div>
        </div>
        <span className="text-xs text-amber-300/80">
          Questa coppia riposa in questo round (BYE)
        </span>
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
    <div className="glass-card p-4 hover:border-white/20 transition-all space-y-4">
      {/* Header partita */}
      <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-emerald-400 flex items-center gap-1.5 bg-emerald-400/10 px-2 py-0.5 rounded">
            <span>🪑</span>
            <span>Tavolo {match.table}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isConfirmed ? (
            <span className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">
              <span>✓</span> Concluso
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium">
              <span>⏱</span> In attesa punteggio
            </span>
          )}
        </div>
      </div>

      {/* Scontro coppie */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3">
        {/* Squadra A */}
        <div
          className={`p-3 rounded-lg border transition-all ${
            winner === 'A'
              ? 'bg-emerald-600/15 border-emerald-500/40'
              : 'bg-white/[0.03] border-white/5'
          }`}
        >
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-emerald-400 font-bold text-xs bg-emerald-400/10 px-1.5 py-0.5 rounded">A</span>
            {winner === 'A' && (
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                Vincitore
              </span>
            )}
          </div>
          <p className="font-semibold text-white truncate mt-1">
            {teamA?.customName ?? teamA?.name ?? 'Coppia A'}
          </p>
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            {getPlayerNames(teamA)}
          </p>

          {/* Punteggio visualizzato o input */}
          <div className="mt-2.5">
            {isConfirmed ? (
              <div className="text-xl font-black text-white">
                {match.scoreA} <span className="text-xs font-normal text-slate-400">pt</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Punti A"
                  value={inputA}
                  onChange={(e) => setInputA(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white/10 border border-white/20 rounded text-white text-base font-bold outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                />
              </div>
            )}
          </div>
        </div>

        {/* VS centrale */}
        <div className="text-center my-1 sm:my-0 flex sm:flex-col items-center justify-center gap-1">
          <span className="w-8 h-8 rounded-full bg-white/10 text-slate-300 text-xs font-bold inline-flex items-center justify-center border border-white/15">
            VS
          </span>
          {isConfirmed && match.scoreA !== null && match.scoreB !== null && (
            <span className="text-[11px] text-slate-400 font-mono">
              Δ {Math.abs(match.scoreA - match.scoreB)}
            </span>
          )}
        </div>

        {/* Squadra B */}
        <div
          className={`p-3 rounded-lg border transition-all ${
            winner === 'B'
              ? 'bg-emerald-600/15 border-emerald-500/40'
              : 'bg-white/[0.03] border-white/5'
          }`}
        >
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-amber-400 font-bold text-xs bg-amber-400/10 px-1.5 py-0.5 rounded">B</span>
            {winner === 'B' && (
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                Vincitore
              </span>
            )}
          </div>
          <p className="font-semibold text-white truncate mt-1">
            {teamB?.customName ?? teamB?.name ?? 'Coppia B'}
          </p>
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            {getPlayerNames(teamB)}
          </p>

          {/* Punteggio visualizzato o input */}
          <div className="mt-2.5">
            {isConfirmed ? (
              <div className="text-xl font-black text-white">
                {match.scoreB} <span className="text-xs font-normal text-slate-400">pt</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Punti B"
                  value={inputB}
                  onChange={(e) => setInputB(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white/10 border border-white/20 rounded text-white text-base font-bold outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Azioni del match */}
      <div className="pt-1 flex items-center justify-end gap-2 border-t border-white/5">
        {isConfirmed ? (
          <div>
            {showConfirmReset ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-300">Confermi la modifica?</span>
                <button
                  onClick={handleReset}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold cursor-pointer"
                >
                  Sì, modifica
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="px-2.5 py-1 text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  Annulla
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 py-1 px-2 rounded hover:bg-white/5"
              >
                <span>✏️</span>
                <span>Modifica Risultato</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isEditing && (
              <button
                onClick={() => {
                  setInputA(String(match.scoreA ?? ''));
                  setInputB(String(match.scoreB ?? ''));
                  setIsEditing(false);
                }}
                className="px-3 py-2 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Annulla
              </button>
            )}
            <button
              onClick={handleConfirm}
              disabled={!isScoreValid}
              className="flex-1 sm:flex-initial px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white 
                         text-xs font-bold rounded-lg transition-all active:scale-[0.98] cursor-pointer
                         disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-emerald-600
                         flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <span>✓</span>
              <span>Conferma Risultato</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
