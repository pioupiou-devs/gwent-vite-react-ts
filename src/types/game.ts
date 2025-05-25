export type Row = 'melee' | 'ranged' | 'siege';
export type Phase = 'mulligan' | 'play' | 'ended';

export interface CardType {
  id: string;
  name: string;
  strength: number;
  row: string;
  faction: string;
  isHero?: boolean;
  imageUrl?: string;
}

export interface CardData {
  id: string;
  type: CardType;
}

export interface Player {
  id: string;
  name: string;
  deck: CardType[];
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