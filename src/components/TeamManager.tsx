// ============================================================================
// TeamManager — Formazione e Gestione Coppie (2026 Edition)
// ============================================================================

import { useState } from 'react';
import { 
  Shuffle, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  AlertCircle, 
  UserCheck,
  RotateCcw
} from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { createTeam } from '../services/tournamentService';

export default function TeamManager() {
  const { state, dispatch } = useTournament();
  const tournament = state.currentTournament;
  const [manualMode, setManualMode] = useState(false);
  const [selectedPlayer1, setSelectedPlayer1] = useState<string>('');
  const [selectedPlayer2, setSelectedPlayer2] = useState<string>('');
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editCustomName, setEditCustomName] = useState('');

  if (!tournament) return null;

  const { players, teams } = tournament;
  const assignedPlayerIds = teams.flatMap((t) => t.playerIds);
  const unassignedPlayers = players.filter((p) => !assignedPlayerIds.includes(p.id));
  const canGenerateRandom = players.length >= 4 && players.length % 2 === 0 && teams.length === 0;
  const canAddManual = unassignedPlayers.length >= 2;

  const getPlayerName = (id: string): string => {
    return players.find((p) => p.id === id)?.name ?? '?';
  };

  const handleRandomGenerate = () => {
    dispatch({ type: 'GENERATE_RANDOM_TEAMS' });
  };

  const handleManualAdd = () => {
    if (!selectedPlayer1 || !selectedPlayer2 || selectedPlayer1 === selectedPlayer2) return;
    const p1 = players.find((p) => p.id === selectedPlayer1);
    const p2 = players.find((p) => p.id === selectedPlayer2);
    if (!p1 || !p2) return;

    const newTeam = createTeam(p1, p2);
    dispatch({ type: 'SET_TEAMS', payload: [...teams, newTeam] });
    setSelectedPlayer1('');
    setSelectedPlayer2('');
  };

  const handleRemoveTeam = (teamId: string) => {
    dispatch({ type: 'SET_TEAMS', payload: teams.filter((t) => t.id !== teamId) });
  };

  const handleClearAll = () => {
    if (confirm('Vuoi rimuovere tutte le coppie formate?')) {
      dispatch({ type: 'SET_TEAMS', payload: [] });
    }
  };

  const handleRenameTeam = (teamId: string) => {
    const name = editCustomName.trim();
    const updatedTeams = teams.map((t) =>
      t.id === teamId ? { ...t, customName: name || undefined } : t
    );
    dispatch({ type: 'SET_TEAMS', payload: updatedTeams });
    setEditingTeamId(null);
    setEditCustomName('');
  };

  return (
    <div className="space-y-6">
      
      {/* Validazioni prerequisiti */}
      {players.length < 4 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>Servono almeno <strong>4 giocatori</strong> per formare le coppie (attualmente: {players.length}). Torna al Passo 1.</span>
        </div>
      )}

      {players.length >= 4 && players.length % 2 !== 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>Il totale giocatori ({players.length}) è dispari. Aggiungi o rimuovi un giocatore per poter formare coppie eque.</span>
        </div>
      )}

      {/* Barra Azioni */}
      {players.length >= 4 && players.length % 2 === 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleRandomGenerate}
            disabled={!canGenerateRandom}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-emerald-500"
          >
            <Shuffle className="w-4 h-4 stroke-[2.5]" />
            <span>Genera Coppie Casuali</span>
          </button>

          <button
            onClick={() => setManualMode(!manualMode)}
            disabled={!canAddManual && teams.length === 0}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-slate-200 hover:text-white font-semibold text-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>{manualMode ? 'Chiudi Manuale' : 'Componi Manualmente'}</span>
          </button>
        </div>
      )}

      {/* Pannello Creazione Manuale */}
      {manualMode && canAddManual && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.1] space-y-3.5 animate-fade-in">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Seleziona i due giocatori per la coppia
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={selectedPlayer1}
              onChange={(e) => setSelectedPlayer1(e.target.value)}
              className="px-3.5 py-2.5 glass-input text-sm cursor-pointer [&>option]:bg-slate-900 [&>option]:text-white"
            >
              <option value="">Seleziona Giocatore 1...</option>
              {unassignedPlayers
                .filter((p) => p.id !== selectedPlayer2)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>

            <select
              value={selectedPlayer2}
              onChange={(e) => setSelectedPlayer2(e.target.value)}
              className="px-3.5 py-2.5 glass-input text-sm cursor-pointer [&>option]:bg-slate-900 [&>option]:text-white"
            >
              <option value="">Seleziona Giocatore 2...</option>
              {unassignedPlayers
                .filter((p) => p.id !== selectedPlayer1)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </div>

          <button
            onClick={handleManualAdd}
            disabled={!selectedPlayer1 || !selectedPlayer2}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Conferma Nuova Coppia</span>
          </button>
        </div>
      )}

      {/* Contatore & Rimuovi Tutte */}
      {teams.length > 0 && (
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">
              {teams.length} {teams.length === 1 ? 'coppia formata' : 'coppie formate'}
            </span>
            {unassignedPlayers.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[11px] font-semibold border border-amber-500/25">
                {unassignedPlayers.length} da assegnare
              </span>
            )}
          </div>

          <button
            onClick={handleClearAll}
            className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Resetta Tutte</span>
          </button>
        </div>
      )}

      {/* Griglia Coppie */}
      {teams.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {teams.map((team, index) => (
            <div
              key={team.id}
              className="group p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.15] transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black flex items-center justify-center shrink-0">
                  {index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  {editingTeamId === team.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={editCustomName}
                        onChange={(e) => setEditCustomName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameTeam(team.id);
                          if (e.key === 'Escape') setEditingTeamId(null);
                        }}
                        onBlur={() => handleRenameTeam(team.id)}
                        autoFocus
                        placeholder={team.name}
                        className="w-full px-2.5 py-1 glass-input text-xs font-semibold"
                      />
                      <button
                        onClick={() => handleRenameTeam(team.id)}
                        className="p-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h5 className="font-bold text-white text-sm truncate">
                        {team.customName ?? team.name}
                      </h5>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {getPlayerName(team.playerIds[0])} • {getPlayerName(team.playerIds[1])}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity shrink-0">
                {editingTeamId !== team.id && (
                  <button
                    onClick={() => {
                      setEditingTeamId(team.id);
                      setEditCustomName(team.customName || '');
                    }}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.08] transition-colors cursor-pointer"
                    title="Rinomina coppia"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => handleRemoveTeam(team.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Elimina coppia"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : players.length >= 4 && players.length % 2 === 0 ? (
        <div className="text-center py-10 rounded-2xl border border-dashed border-white/10 space-y-2">
          <UserCheck className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm text-slate-400">Nessuna coppia ancora formata.</p>
          <p className="text-xs text-slate-500">Usa il tasto "Genera Coppie Casuali" o componile manualmente.</p>
        </div>
      ) : null}

    </div>
  );
}
