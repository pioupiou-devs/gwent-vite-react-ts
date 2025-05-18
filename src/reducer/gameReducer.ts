import { GameState, CardData } from '@/types/game';

type Action =
  | { type: 'PLAY_CARD'; payload: { playerId: string; card: CardData } };

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'PLAY_CARD': {
      const { playerId, card } = action.payload;
      const players = state.players.map((p) => {
        if (p.id !== playerId) return p;
        const newHand = p.hand.filter((c) => c.id !== card.id);
        const newBoard = { ...p.board, [card.row]: [...p.board[card.row], card] };
        const newScore = Object.values(newBoard)
          .flat()
          .reduce((sum, c) => sum + c.strength, 0);
        return { ...p, hand: newHand, board: newBoard, score: newScore };
      }) as [typeof state.players[0], typeof state.players[1]];

      return { ...state, players };
    }
    default:
      return state;
  }
}