// ============================================================================
// Tournament Context — Stato globale del torneo con React Context + Reducer
// ============================================================================

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from 'react';
import type {
  Tournament,
  Team,
  TournamentFormat,
} from '../models/types';
import {
  createTournament,
  createPlayer,
  generateRandomTeams,
} from '../services/tournamentService';
import { confirmMatchResult, resetMatchResult } from '../services/scoringService';
import { calculateStandings } from '../services/standingsService';
import {
  saveTournament,
  loadTournaments,
  saveTournaments,
  getActiveTournamentId,
  setActiveTournament,
  deleteTournament as deleteTournamentStorage,
} from '../services/storageService';
import { generateAllRoundRobinRounds } from '../algorithms/roundRobin';
import { generateSwissRound } from '../algorithms/swiss';
import { generateId } from '../utils/id';

// --- Stato ---

interface TournamentState {
  /** Lista di tutti i tornei salvati */
  tournaments: Tournament[];
  /** Torneo attualmente attivo/in modifica */
  currentTournament: Tournament | null;
}

const initialState: TournamentState = {
  tournaments: [],
  currentTournament: null,
};

// --- Azioni ---

type TournamentAction =
  | { type: 'LOAD_TOURNAMENTS'; payload: Tournament[] }
  | { type: 'CREATE_TOURNAMENT'; payload: { name: string } }
  | { type: 'SET_CURRENT_TOURNAMENT'; payload: Tournament | null }
  | { type: 'UPDATE_TOURNAMENT'; payload: Tournament }
  | { type: 'DELETE_TOURNAMENT'; payload: string }
  | { type: 'ADD_PLAYER'; payload: { name: string } }
  | { type: 'REMOVE_PLAYER'; payload: string }
  | { type: 'UPDATE_PLAYER'; payload: { id: string; name: string } }
  | { type: 'SET_TEAMS'; payload: Team[] }
  | { type: 'GENERATE_RANDOM_TEAMS' }
  | { type: 'SET_FORMAT'; payload: { format: TournamentFormat; rounds: number } }
  | { type: 'UPDATE_CONFIG'; payload: Partial<Tournament['config']> }
  | { type: 'CONFIRM_MATCH'; payload: { roundId: string; matchId: string; scoreA: number; scoreB: number } }
  | { type: 'RESET_MATCH'; payload: { roundId: string; matchId: string } }
  | { type: 'RECALCULATE_STANDINGS' }
  | { type: 'START_TOURNAMENT' }
  | { type: 'GENERATE_ROUNDS' }
  | { type: 'GENERATE_NEXT_ROUND' }
  | { type: 'ADD_ROUND'; payload: Tournament['rounds'][0] };

// --- Reducer ---

function tournamentReducer(
  state: TournamentState,
  action: TournamentAction
): TournamentState {
  switch (action.type) {
    case 'LOAD_TOURNAMENTS': {
      const activeId = getActiveTournamentId();
      const current =
        action.payload.find((t) => t.id === activeId) ??
        action.payload[0] ??
        null;
      return {
        ...state,
        tournaments: action.payload,
        currentTournament: current,
      };
    }

    case 'CREATE_TOURNAMENT': {
      const tournament = createTournament(action.payload.name);
      const newTournaments = [...state.tournaments, tournament];
      saveTournaments(newTournaments);
      setActiveTournament(tournament.id);
      return {
        ...state,
        tournaments: newTournaments,
        currentTournament: tournament,
      };
    }

    case 'SET_CURRENT_TOURNAMENT': {
      setActiveTournament(action.payload?.id ?? null);
      return { ...state, currentTournament: action.payload };
    }

    case 'UPDATE_TOURNAMENT': {
      if (!state.currentTournament) return state;
      const updated = action.payload;
      saveTournament(updated);
      return {
        ...state,
        currentTournament: updated,
        tournaments: state.tournaments.map((t) =>
          t.id === updated.id ? updated : t
        ),
      };
    }

    case 'DELETE_TOURNAMENT': {
      deleteTournamentStorage(action.payload);
      const remaining = state.tournaments.filter((t) => t.id !== action.payload);
      const isCurrent = state.currentTournament?.id === action.payload;
      const nextCurrent = isCurrent ? (remaining[0] ?? null) : state.currentTournament;
      setActiveTournament(nextCurrent?.id ?? null);
      return {
        ...state,
        tournaments: remaining,
        currentTournament: nextCurrent,
      };
    }

    case 'ADD_PLAYER': {
      if (!state.currentTournament) return state;
      const newPlayer = createPlayer(action.payload.name);
      const updated = {
        ...state.currentTournament,
        players: [...state.currentTournament.players, newPlayer],
      };
      return { ...state, currentTournament: updated };
    }

    case 'REMOVE_PLAYER': {
      if (!state.currentTournament) return state;
      const updated = {
        ...state.currentTournament,
        players: state.currentTournament.players.filter(
          (p) => p.id !== action.payload
        ),
        // Rimuovi anche le coppie che includevano il giocatore
        teams: state.currentTournament.teams.filter(
          (t) => !t.playerIds.includes(action.payload)
        ),
      };
      return { ...state, currentTournament: updated };
    }

    case 'UPDATE_PLAYER': {
      if (!state.currentTournament) return state;
      const updatedPlayers = state.currentTournament.players.map((p) =>
        p.id === action.payload.id ? { ...p, name: action.payload.name } : p
      );
      // Aggiorna anche i nomi delle coppie
      const updatedTeams = state.currentTournament.teams.map((team) => {
        if (!team.playerIds.includes(action.payload.id)) return team;
        const p1 = updatedPlayers.find((p) => p.id === team.playerIds[0]);
        const p2 = updatedPlayers.find((p) => p.id === team.playerIds[1]);
        return {
          ...team,
          name: `${p1?.name ?? '?'} / ${p2?.name ?? '?'}`,
        };
      });
      return {
        ...state,
        currentTournament: {
          ...state.currentTournament,
          players: updatedPlayers,
          teams: updatedTeams,
        },
      };
    }

    case 'SET_TEAMS': {
      if (!state.currentTournament) return state;
      return {
        ...state,
        currentTournament: {
          ...state.currentTournament,
          teams: action.payload,
        },
      };
    }

    case 'GENERATE_RANDOM_TEAMS': {
      if (!state.currentTournament) return state;
      try {
        const teams = generateRandomTeams(state.currentTournament.players);
        return {
          ...state,
          currentTournament: {
            ...state.currentTournament,
            teams,
          },
        };
      } catch {
        return state;
      }
    }

    case 'SET_FORMAT': {
      if (!state.currentTournament) return state;
      return {
        ...state,
        currentTournament: {
          ...state.currentTournament,
          config: {
            ...state.currentTournament.config,
            format: action.payload.format,
            totalRounds: action.payload.rounds,
          },
        },
      };
    }

    case 'UPDATE_CONFIG': {
      if (!state.currentTournament) return state;
      return {
        ...state,
        currentTournament: {
          ...state.currentTournament,
          config: {
            ...state.currentTournament.config,
            ...action.payload,
          },
        },
      };
    }

    case 'CONFIRM_MATCH': {
      if (!state.currentTournament) return state;
      const updated = confirmMatchResult(
        state.currentTournament,
        action.payload.roundId,
        action.payload.matchId,
        action.payload.scoreA,
        action.payload.scoreB
      );
      return {
        ...state,
        currentTournament: {
          ...updated,
          standings: calculateStandings(updated),
        },
      };
    }

    case 'RESET_MATCH': {
      if (!state.currentTournament) return state;
      const updated = resetMatchResult(
        state.currentTournament,
        action.payload.roundId,
        action.payload.matchId
      );
      return {
        ...state,
        currentTournament: {
          ...updated,
          standings: calculateStandings(updated),
        },
      };
    }

    case 'RECALCULATE_STANDINGS': {
      if (!state.currentTournament) return state;
      return {
        ...state,
        currentTournament: {
          ...state.currentTournament,
          standings: calculateStandings(state.currentTournament),
        },
      };
    }

    case 'START_TOURNAMENT': {
      if (!state.currentTournament) return state;
      let rounds = state.currentTournament.rounds;
      if (state.currentTournament.config.format === 'round-robin') {
        rounds = generateAllRoundRobinRounds(state.currentTournament);
      } else if (state.currentTournament.config.format === 'swiss' && rounds.length === 0) {
        const r1Matches = generateSwissRound(state.currentTournament, 1);
        rounds = [
          {
            id: generateId(),
            number: 1,
            matches: r1Matches,
            completed: false,
          },
        ];
      }
      const updated: Tournament = {
        ...state.currentTournament,
        status: 'in-progress',
        rounds,
      };
      return {
        ...state,
        currentTournament: {
          ...updated,
          standings: calculateStandings(updated),
        },
      };
    }

    case 'GENERATE_ROUNDS': {
      if (!state.currentTournament) return state;
      let rounds = state.currentTournament.rounds;
      if (state.currentTournament.config.format === 'round-robin') {
        rounds = generateAllRoundRobinRounds(state.currentTournament);
      } else if (state.currentTournament.config.format === 'swiss' && rounds.length === 0) {
        const r1Matches = generateSwissRound(state.currentTournament, 1);
        rounds = [
          {
            id: generateId(),
            number: 1,
            matches: r1Matches,
            completed: false,
          },
        ];
      }
      return {
        ...state,
        currentTournament: {
          ...state.currentTournament,
          rounds,
        },
      };
    }

    case 'GENERATE_NEXT_ROUND': {
      if (!state.currentTournament) return state;
      const tournament = state.currentTournament;
      if (tournament.rounds.length >= tournament.config.totalRounds) return state;

      if (tournament.config.format === 'swiss') {
        const nextRoundNumber = tournament.rounds.length + 1;
        const newMatches = generateSwissRound(tournament, nextRoundNumber);
        const newRound = {
          id: generateId(),
          number: nextRoundNumber,
          matches: newMatches,
          completed: false,
        };
        const updated = {
          ...tournament,
          rounds: [...tournament.rounds, newRound],
        };
        return {
          ...state,
          currentTournament: {
            ...updated,
            standings: calculateStandings(updated),
          },
        };
      }
      return state;
    }

    case 'ADD_ROUND': {
      if (!state.currentTournament) return state;
      return {
        ...state,
        currentTournament: {
          ...state.currentTournament,
          rounds: [...state.currentTournament.rounds, action.payload],
        },
      };
    }

    default:
      return state;
  }
}

// --- Context ---

interface TournamentContextValue {
  state: TournamentState;
  dispatch: React.Dispatch<TournamentAction>;
}

const TournamentContext = createContext<TournamentContextValue | null>(null);

// --- Provider ---

export function TournamentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tournamentReducer, initialState);

  // Carica i tornei da localStorage all'avvio
  useEffect(() => {
    const tournaments = loadTournaments();
    dispatch({ type: 'LOAD_TOURNAMENTS', payload: tournaments });
  }, []);

  // Auto-save su localStorage ogni volta che il torneo corrente cambia
  useEffect(() => {
    if (state.currentTournament) {
      saveTournament(state.currentTournament);
    }
  }, [state.currentTournament]);

  return (
    <TournamentContext.Provider value={{ state, dispatch }}>
      {children}
    </TournamentContext.Provider>
  );
}

// --- Hook ---

/**
 * Hook per accedere allo stato e al dispatch del torneo.
 */
export function useTournament() {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournament deve essere usato dentro un TournamentProvider');
  }
  return context;
}
