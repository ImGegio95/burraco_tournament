// ============================================================================
// PlayerManager — Gestione giocatori (aggiunta, modifica, eliminazione)
// ============================================================================

import { useState, useRef, useEffect } from 'react';
import { useTournament } from '../context/TournamentContext';

export default function PlayerManager() {
  const { state, dispatch } = useTournament();
  const tournament = state.currentTournament;
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editRef.current) {
      editRef.current.focus();
      editRef.current.select();
    }
  }, [editingId]);

  if (!tournament) return null;

  const players = tournament.players;
  const hasTeams = tournament.teams.length > 0;

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;

    // Verifica duplicati
    const duplicate = players.find(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    );
    if (duplicate) {
      inputRef.current?.focus();
      return;
    }

    dispatch({ type: 'ADD_PLAYER', payload: { name } });
    setNewName('');
    inputRef.current?.focus();
  };

  const handleEdit = (id: string) => {
    const name = editName.trim();
    if (!name) return;
    dispatch({ type: 'UPDATE_PLAYER', payload: { id, name } });
    setEditingId(null);
    setEditName('');
  };

  const handleRemove = (id: string) => {
    dispatch({ type: 'REMOVE_PLAYER', payload: id });
  };

  const isOdd = players.length % 2 !== 0;

  return (
    <div className="space-y-5">
      {/* Input aggiunta giocatore */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Nome giocatore..."
          disabled={hasTeams}
          className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg 
                     text-white placeholder-slate-400 outline-none focus:border-emerald-400 
                     focus:ring-2 focus:ring-emerald-400/20 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleAdd}
          disabled={!newName.trim() || hasTeams}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold 
                     rounded-lg transition-all active:scale-[0.97] cursor-pointer
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-emerald-600"
        >
          Aggiungi
        </button>
      </div>

      {hasTeams && (
        <p className="text-xs text-amber-400/80 flex items-center gap-1.5">
          <span>⚠️</span>
          Elimina le coppie per modificare i giocatori.
        </p>
      )}

      {/* Contatore */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">
          {players.length} giocator{players.length !== 1 ? 'i' : 'e'}
          {players.length >= 4 && (
            <span className="text-emerald-400 ml-1">
              → {Math.floor(players.length / 2)} coppie possibili
            </span>
          )}
        </span>
        {isOdd && players.length > 0 && (
          <span className="text-amber-400 text-xs font-medium">
            ⚠️ Numero dispari
          </span>
        )}
      </div>

      {/* Lista giocatori */}
      {players.length > 0 ? (
        <div className="space-y-1.5">
          {players.map((player, index) => (
            <div
              key={player.id}
              className="group flex items-center gap-3 px-4 py-2.5 rounded-lg 
                         bg-white/[0.04] hover:bg-white/[0.08] transition-all"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <span className="text-sm text-slate-500 w-6 text-right font-mono">
                {index + 1}.
              </span>

              {editingId === player.id ? (
                <input
                  ref={editRef}
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEdit(player.id);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  onBlur={() => handleEdit(player.id)}
                  className="flex-1 px-2 py-1 bg-white/10 border border-emerald-400/50 rounded 
                             text-white outline-none text-sm"
                />
              ) : (
                <span className="flex-1 text-white text-sm font-medium">
                  {player.name}
                </span>
              )}

              {!hasTeams && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingId(player.id);
                      setEditName(player.name);
                    }}
                    className="p-1.5 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                    title="Modifica"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleRemove(player.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded transition-colors cursor-pointer"
                    title="Rimuovi"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500">
          <div className="text-3xl mb-2">👥</div>
          <p>Aggiungi almeno 4 giocatori per formare le coppie.</p>
        </div>
      )}

      {/* Avviso numero dispari */}
      {isOdd && players.length >= 3 && (
        <div className="glass-card p-3 border-amber-400/30 bg-amber-400/5">
          <p className="text-sm text-amber-300">
            <strong>Numero dispari di giocatori.</strong> Aggiungi un altro giocatore 
            per formare coppie complete.
          </p>
        </div>
      )}
    </div>
  );
}
