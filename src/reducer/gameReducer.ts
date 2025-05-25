import { GameState, CardData, Player } from '@/types/game';

type Action =
  | { type: 'INIT'; payload: GameState }
  | { type: 'MULLIGAN'; payload: { keepIds: string[] } }
  | { type: 'PLAY_CARD'; payload: { playerId: string; card: CardData } }
  | { type: 'END_TURN'; payload: { nextPlayerId: string } }
  | { type: 'PASS'; payload: { playerId: string } }
  | { type: 'RESET' };

// helper to shuffle array
function shuffle<T>(array: T[]): T[] {
  return array.slice().sort(() => Math.random() - 0.5);
}

// resets boards and scores
function resetBoard(players: [Player, Player]): [Player, Player] {
  const mapped = players.map(p => ({
    ...p,
    board: { melee: [], ranged: [], siege: [] },
    score: 0,
    passed: false,
    mulliganHand: [],
  }));
  const [p1, p2] = mapped;
  return [p1, p2];
}

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'INIT': {
      // initialize state using payload
      const { players, currentPlayerId, round } = action.payload;
      // shuffle decks and draw 10 cards per player for mulligan
      const mapped = players.map(p => {
        const deckShuffled = shuffle(p.deck);
        const mulliganCards = deckShuffled.slice(0, 10);
        const remainingDeck = deckShuffled.slice(10);
        return { ...p, deck: remainingDeck, mulliganHand: mulliganCards, hand: [], board: { melee: [], ranged: [], siege: [] }, score: 0, passed: false, roundsWon: 0 };
      });
      const [p1, p2] = mapped;
      const initPlayers: [typeof p1, typeof p2] = [p1, p2];
      return { players: initPlayers, currentPlayerId, round, phase: 'mulligan' };
    }
    case 'MULLIGAN': {
      const { keepIds } = action.payload;
      const newPlayers = state.players.map(p => {
        if (p.id !== state.currentPlayerId) return p;
        const kept = p.mulliganHand.filter(c => keepIds.includes(c.id));
        const toRedrawCount = p.mulliganHand.length - kept.length;
        const newDraws = shuffle(p.deck).slice(0, toRedrawCount);
        const newDeck = p.deck.filter(c => !newDraws.includes(c));
        return {
          ...p,
          hand: [...kept, ...newDraws],
          deck: newDeck,
          mulliganHand: [],
        };
      }) as [Player, Player];
      return { ...state, players: newPlayers, phase: 'play' };
    }

    case 'PLAY_CARD': {
      const { playerId, card } = action.payload;
      const players = state.players.map(p => {
        if (p.id !== playerId) return p;
        const newHand = p.hand.filter(c => c.id !== card.id);
        const newBoard = { ...p.board, [card.row]: [...p.board[card.row], card] };
        const newScore = Object.values(newBoard).flat().reduce((sum, c) => sum + c.strength, 0);
        const passed = newHand.length === 0 ? true : p.passed;
        return { ...p, hand: newHand, board: newBoard, score: newScore, passed };
      }) as [Player, Player];

      const [p1, p2] = players;
      if (p1.passed && p2.passed) {
        let winnerId: string | null = null;
        if (p1.score > p2.score) winnerId = p1.id;
        else if (p2.score > p1.score) winnerId = p2.id;
        const updated = players.map(p => ({
          ...p,
          roundsWon: p.roundsWon + (p.id === winnerId ? 1 : 0),
          passed: false,
        })) as [Player, Player];
        const reset = resetBoard(updated);
        return { players: reset, currentPlayerId: winnerId ?? state.currentPlayerId, round: state.round + 1, phase: 'play' };
      }
      return { ...state, players };
    }

    case 'END_TURN': {
      const current = state.players.find(p => p.id === state.currentPlayerId)!;
      if (current.hand.length === 0) {
        return gameReducer(state, { type: 'PASS', payload: { playerId: current.id } });
      }
      const next = state.players.find(p => p.id !== state.currentPlayerId)!.id;
      return { ...state, currentPlayerId: next };
    }

    case 'PASS': {
      const players = state.players.map(p => p.id === action.payload.playerId ? { ...p, passed: true } : p) as [Player, Player];
      const [p1, p2] = players;
      if (p1.passed && p2.passed) {
        let winnerId: string | null = null;
        if (p1.score > p2.score) winnerId = p1.id;
        else if (p2.score > p1.score) winnerId = p2.id;
        const updated = players.map(p => ({
          ...p,
          roundsWon: p.roundsWon + (p.id === winnerId ? 1 : 0),
          passed: false,
        })) as [Player, Player];
        const reset = resetBoard(updated);
        return { players: reset, currentPlayerId: winnerId ?? state.currentPlayerId, round: state.round + 1, phase: 'play' };
      }
      const next = players.find(p => p.id !== action.payload.playerId)!.id;
      return { ...state, players, currentPlayerId: next };
    }

    case 'RESET': {
      const resetPlayers = resetBoard(state.players);
      return { players: resetPlayers, currentPlayerId: state.players[1].id, round: 1, phase: 'mulligan' };
    }

    default:
      return state;
  }
}