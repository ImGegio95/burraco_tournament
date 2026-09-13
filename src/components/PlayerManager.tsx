// ============================================================================
// PlayerManager — Gestione Partecipanti (2026 Edition)
// ============================================================================

import { useState, useRef, useEffect } from 'react';
import { Plus, User, Trash2, Edit3, Check, AlertCircle, Users } from 'lucide-react';
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
    <div className="space-y-6">
      
      {/* Header & Input */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Aggiungi Giocatore
          </label>
          <span className="text-xs text-slate-400">
            {players.length} registrat{players.length === 1 ? 'o' : 'i'} • {Math.floor(players.length / 2)} coppie
          </span>
        </div>

        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Nome e cognome (es. Marco Rossi)..."
            disabled={hasTeams}
            className="flex-1 px-4 py-3 glass-input text-sm placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleAdd}
            disabled={!newName.trim() || hasTeams}
            className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-emerald-500"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Aggiungi</span>
          </button>
        </div>

        {hasTeams && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Le coppie sono già state formate. Elimina le coppie al Passo 2 se desideri modificare i giocatori.</span>
          </div>
        )}
      </div>

      {/* Lista Giocatori */}
      {players.length > 0 ? (
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {players.map((player) => {
              const initials = player.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <div
                  key={player.id}
                  className="group flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.15] transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">
                      {initials || <User className="w-4 h-4" />}
                    </div>

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
                        className="flex-1 px-2.5 py-1 glass-input text-xs font-semibold"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-white truncate">
                        {player.name}
                      </span>
                    )}
                  </div>

                  {!hasTeams && (
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      {editingId === player.id ? (
                        <button
                          onClick={() => handleEdit(player.id)}
                          className="p-1.5 text-emerald-400 hover:text-emerald-300 rounded-lg hover:bg-emerald-500/10 transition-colors cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingId(player.id);
                            setEditName(player.name);
                          }}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.08] transition-colors cursor-pointer"
                          title="Modifica"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleRemove(player.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Rimuovi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-10 rounded-2xl border border-dashed border-white/10 space-y-2">
          <Users className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm text-slate-400">Nessun giocatore registrato.</p>
          <p className="text-xs text-slate-500">Aggiungi almeno 4 giocatori per poter formare le coppie.</p>
        </div>
      )}

      {/* Avviso numero dispari */}
      {isOdd && players.length >= 3 && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            <strong>Numero dispari di giocatori ({players.length}):</strong> è necessario aggiungere un altro giocatore per completare le coppie.
          </span>
        </div>
      )}

    </div>
  );
}
