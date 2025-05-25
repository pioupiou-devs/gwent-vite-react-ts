export type Row = 'melee' | 'ranged' | 'siege';
export type Phase = 'mulligan' | 'play' | 'ended';

export interface CardData {
  typeId: string;
  instanceId: string;
  name: string;
  strength: number;
  row: Row;
  faction: string;
  isHero?: boolean;
}

export interface Player {
  id: string;
  name: string;
  deck: CardData[];
  hand: CardData[];
  mulliganHand: CardData[];
  board: Record<Row, CardData[]>;
  score: number;
  passed: boolean;
  roundsWon: number;
}

export interface GameState {
  players: [Player, Player];
  currentPlayerId: string;
  round: number;
  phase: Phase;
} 