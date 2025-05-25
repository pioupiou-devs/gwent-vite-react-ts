import { GameState, CardData } from '@/types/game';

type Action =
  | { type: 'PLAY_CARD'; payload: { playerId: string; card: CardData } }
  | { type: 'END_TURN'; payload: { nextPlayerId: string } }
  | { type: 'PASS'; payload: { playerId: string } };

function resetBoard(players: GameState['players']) {
  return players.map(p => ({
    ...p,
    board: { melee: [], ranged: [], siege: [] },
    score: 0,
    passed: false,
  })) as unknown as [typeof players[0], typeof players[1]];
}

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'PLAY_CARD': {
      const { playerId, card } = action.payload;
      const players = state.players.map(p => {
        if (p.id !== playerId) return p;
        const newHand = p.hand.filter(c => c.id !== card.id);
        const newBoard = { ...p.board, [card.row]: [...p.board[card.row], card] };
        const newScore = Object.values(newBoard).flat().reduce((sum, c) => sum + c.strength, 0);
        return { ...p, hand: newHand, board: newBoard, score: newScore };
      }) as [typeof state.players[0], typeof state.players[1]];
      return { ...state, players };
    }
    case 'END_TURN': {
      return { ...state, currentPlayerId: action.payload.nextPlayerId };
    }
    case 'PASS': {
      // mark passed
      const players = state.players.map(p => p.id === action.payload.playerId ? { ...p, passed: true } : p) as [typeof state.players[0], typeof state.players[1]];
      const [p1, p2] = players;
      // if both passed, resolve round
      if (p1.passed && p2.passed) {
        const winnerId = p1.score > p2.score ? p1.id : p2.score > p1.score ? p2.id : null;
        const updatedPlayers = players.map(p => {
          const roundsWon = p.roundsWon + (winnerId === p.id ? 1 : 0);
          return { ...p, roundsWon };
        }) as [typeof p1, typeof p2];
        // prepare next round
        const resetPlayers = resetBoard(updatedPlayers);
        const nextStarter = winnerId ?? state.currentPlayerId;
        return { players: resetPlayers, currentPlayerId: nextStarter, round: state.round + 1 };
      }
      // otherwise switch turn to the other player
      const nextPlayer = players.find(p => p.id !== action.payload.playerId)!;
      return { ...state, players, currentPlayerId: nextPlayer.id };
    }
    default:
      return state;
  }
}