// ============================================================================
// Burraco Tournament Manager — Modello Dati
// ============================================================================

// --- Enums / Union Types ---

/** Formule di torneo supportate */
export type TournamentFormat =
  | 'round-robin'
  | 'swiss'
  | 'knockout'
  | 'groups-playoff';

/** Stato di un singolo match */
export type MatchStatus = 'pending' | 'confirmed';

/** Stato complessivo del torneo */
export type TournamentStatus = 'setup' | 'in-progress' | 'completed';

/** Criteri di tie-break, in ordine di priorità configurabile */
export type TieBreakCriterion =
  | 'totalPoints'
  | 'wins'
  | 'pointDiff'
  | 'headToHead'
  | 'playoff';

// --- Entità ---

/** Giocatore individuale */
export interface Player {
  id: string;
  name: string;
}

/** Coppia (team di 2 giocatori) */
export interface Team {
  id: string;
  /** Nome generato automaticamente (es. "Giocatore1 / Giocatore2") */
  name: string;
  /** Nome personalizzato opzionale */
  customName?: string;
  /** Esattamente 2 giocatori */
  playerIds: [string, string];
}

/** Singola partita */
export interface Match {
  id: string;
  roundId: string;
  /** Numero del tavolo */
  table: number;
  teamAId: string;
  /** null = BYE (la coppia riposa) */
  teamBId: string | null;
  scoreA: number | null;
  scoreB: number | null;
  status: MatchStatus;
}

/** Round di partite */
export interface Round {
  id: string;
  number: number;
  matches: Match[];
  completed: boolean;
}

// --- Montepremi ---

/** Premio per una posizione in classifica */
export interface Prize {
  position: number;
  label: string;
  percentage: number;
  amount: number;
}

// --- Configurazione ---

/** Configurazione del torneo */
export interface TournamentConfig {
  name: string;
  format: TournamentFormat;
  totalRounds: number;
  /** Quota per giocatore in euro (null = non impostata) */
  playerFee: number | null;
  /** Montepremi totale in euro (null = non impostato) */
  prizePool: number | null;
  /** Distribuzione percentuale dei premi */
  prizeDistribution: Prize[];
  /** Ordine di priorità dei criteri di tie-break */
  tieBreakOrder: TieBreakCriterion[];
}

// --- Classifica ---

/** Riga della classifica */
export interface StandingsEntry {
  teamId: string;
  position: number;
  previousPosition?: number;
  played: number;
  wins: number;
  losses: number;
  draws: number;
  totalPoints: number;
  pointDiff: number;
}

// --- Torneo ---

/** Torneo completo */
export interface Tournament {
  id: string;
  /** Versione schema per migrazioni future */
  version: number;
  createdAt: string;
  updatedAt: string;
  status: TournamentStatus;
  config: TournamentConfig;
  players: Player[];
  teams: Team[];
  rounds: Round[];
  standings: StandingsEntry[];
}

// --- Costanti ---

/** Versione corrente del modello dati */
export const CURRENT_MODEL_VERSION = 1;

/** Distribuzione premi predefinita */
export const DEFAULT_PRIZE_DISTRIBUTION: Prize[] = [
  { position: 1, label: '1° posto', percentage: 60, amount: 0 },
  { position: 2, label: '2° posto', percentage: 30, amount: 0 },
  { position: 3, label: '3° posto', percentage: 10, amount: 0 },
];

/** Ordine tie-break predefinito */
export const DEFAULT_TIEBREAK_ORDER: TieBreakCriterion[] = [
  'totalPoints',
  'wins',
  'pointDiff',
  'headToHead',
  'playoff',
];
