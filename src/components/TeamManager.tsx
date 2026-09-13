// ============================================================================
// TeamManager — Gestione coppie (creazione manuale, casuale, rinomina)
// ============================================================================

import { useState } from 'react';
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
    dispatch({ type: 'SET_TEAMS', payload: [] });
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
    <div className="space-y-5">
      {/* Validazione pre-requisiti */}
      {players.length < 4 && (
        <div className="glass-card p-4 border-amber-400/30 bg-amber-400/5 text-center">
          <p className="text-sm text-amber-300">
            Servono almeno <strong>4 giocatori</strong> per formare le coppie.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Attualmente: {players.length} giocator{players.length !== 1 ? 'i' : 'e'}
          </p>
        </div>
      )}

      {players.length >= 4 && players.length % 2 !== 0 && (
        <div className="glass-card p-4 border-amber-400/30 bg-amber-400/5 text-center">
          <p className="text-sm text-amber-300">
            Il numero di giocatori deve essere <strong>pari</strong> per formare coppie complete.
          </p>
        </div>
      )}

      {/* Azioni generazione */}
      {players.length >= 4 && players.length % 2 === 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleRandomGenerate}
            disabled={!canGenerateRandom}
            className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold 
                       rounded-lg transition-all active:scale-[0.97] cursor-pointer flex items-center 
                       justify-center gap-2
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-emerald-600"
          >
            <span>🎲</span>
            Genera Coppie Casuali
          </button>
          <button
            onClick={() => setManualMode(!manualMode)}
            disabled={!canAddManual && teams.length === 0}
            className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold 
                       rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2
                       border border-white/20
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>✋</span>
            {manualMode ? 'Chiudi Manuale' : 'Crea Manualmente'}
          </button>
        </div>
      )}

      {/* Creazione manuale */}
      {manualMode && canAddManual && (
        <div className="glass-card-light p-4 space-y-3 animate-slide-up">
          <h4 className="text-sm font-semibold text-slate-300">Nuova Coppia</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={selectedPlayer1}
              onChange={(e) => setSelectedPlayer1(e.target.value)}
              className="px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white 
                         outline-none focus:border-emerald-400 transition-all cursor-pointer
                         [&>option]:bg-slate-800 [&>option]:text-white"
            >
              <option value="">Giocatore 1...</option>
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
              className="px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white 
                         outline-none focus:border-emerald-400 transition-all cursor-pointer
                         [&>option]:bg-slate-800 [&>option]:text-white"
            >
              <option value="">Giocatore 2...</option>
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
            className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold 
                       rounded-lg transition-all cursor-pointer
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-emerald-600"
          >
            Crea Coppia
          </button>
        </div>
      )}

      {/* Contatore */}
      {teams.length > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">
            {teams.length} coppi{teams.length !== 1 ? 'e' : 'a'}
            {unassignedPlayers.length > 0 && (
              <span className="text-amber-400 ml-2">
                ({unassignedPlayers.length} giocator{unassignedPlayers.length !== 1 ? 'i' : 'e'} non assegnat{unassignedPlayers.length !== 1 ? 'i' : 'o'})
              </span>
            )}
          </span>
          <button
            onClick={handleClearAll}
            className="text-xs text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
          >
            Rimuovi tutte
          </button>
        </div>
      )}

      {/* Lista coppie */}
      {teams.length > 0 ? (
        <div className="space-y-2">
          {teams.map((team, index) => (
            <div
              key={team.id}
              className="group glass-card p-4 flex items-center gap-3 hover:bg-white/[0.08] transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-600/20 flex items-center justify-center 
                              text-emerald-400 text-sm font-bold shrink-0">
                {index + 1}
              </div>

              <div className="flex-1 min-w-0">
                {editingTeamId === team.id ? (
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
                    className="w-full px-2 py-1 bg-white/10 border border-emerald-400/50 rounded 
                               text-white text-sm outline-none"
                  />
                ) : (
                  <>
                    {team.customName && (
                      <p className="text-white font-semibold text-sm">{team.customName}</p>
                    )}
                    <p className={`text-sm ${team.customName ? 'text-slate-400' : 'text-white font-medium'}`}>
                      {getPlayerName(team.playerIds[0])} / {getPlayerName(team.playerIds[1])}
                    </p>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setEditingTeamId(team.id);
                    setEditCustomName(team.customName || '');
                  }}
                  className="p-1.5 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                  title="Rinomina"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleRemoveTeam(team.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded transition-colors cursor-pointer"
                  title="Rimuovi coppia"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : players.length >= 4 && players.length % 2 === 0 ? (
        <div className="text-center py-6 text-slate-500">
          <div className="text-3xl mb-2">🤝</div>
          <p>Genera le coppie casualmente o creale manualmente.</p>
        </div>
      ) : null}
    </div>
  );
}
