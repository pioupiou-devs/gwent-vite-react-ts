import { GameState, CardData, Player } from '@/types/game';

type Action =
  | { type: 'INIT'; payload: GameState }
  | { type: 'MULLIGAN'; payload: { keepIds: string[] } }
  | { type: 'PLAY_CARD'; payload: { playerId: string; card: CardData } }
  | { type: 'END_TURN'; payload: { nextPlayerId: string } }
  | { type: 'PASS'; payload: { playerId: string } }
  | { type: 'RESET' };

function shuffle<T>(array: T[]): T[] {
  return array.slice().sort(() => Math.random() - 0.5);
}

function resetBoard(players: GameState['players']): [Player, Player] {
  if (players.length !== 2) {
    throw new Error('Expected exactly 2 players');
  }
  const mapped = players.map(p => ({
    ...p,
    board: { melee: [], ranged: [], siege: [] },
    score: 0,
    passed: false,
  }));
  // Destructure to ensure tuple type
  const [p1, p2] = mapped;
  return [p1, p2];
}

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'INIT': {
      // shuffle decks, draw 10 cards per player for mulligan
      const mapped = state.players.map(p => {
        const deckShuffled = shuffle(p.deck);
        const mulliganCards = deckShuffled.slice(0, 10);
        const remainingDeck = deckShuffled.slice(10);
        return { ...p, deck: remainingDeck, mulliganHand: mulliganCards, hand: [] };
      });
      const [p1, p2] = mapped;
      const initPlayers: [typeof p1, typeof p2] = [p1, p2];
      return { ...state, players: initPlayers, phase: 'mulligan' };
    }
    case 'MULLIGAN':
      // apply mulligan for active player only
      {
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
        }) as [typeof state.players[0], typeof state.players[1]];
        // after both players mulligan, phase -> play; assume simultaneous for simplicity
        return { ...state, players: newPlayers, phase: 'play' };
      }
    case 'PLAY_CARD': {
      console.log('Playing card:', action.payload.card);
      const { playerId, card } = action.payload;
      const players = state.players.map(p => {
        if (p.id !== playerId) return p;
        const newHand = p.hand.filter(c => c.id !== card.id);
        const newBoard = { ...p.board, [card.row]: [...p.board[card.row], card] };
        const newScore = Object.values(newBoard).flat().reduce((sum, c) => sum + c.strength, 0);
        // auto-pass if no cards remain
        if (newHand.length === 0) {
          console.log(`${p.name} has no cards left, auto-passing`);
        }
        const passed = newHand.length === 0 ? true : p.passed;
        return { ...p, hand: newHand, board: newBoard, score: newScore, passed };
      }) as [typeof state.players[0], typeof state.players[1]];

      // if a player auto-passed due to empty hand, trigger PASS logic
      const [p1, p2] = players;
      if ((p1.passed || p2.passed) && p1.passed && p2.passed) {
        console.log('Both players passed, resolving round');
        // both passed, resolve round
        let winnerId: string | null = null;
        if (p1.score > p2.score) winnerId = p1.id;
        else if (p2.score > p1.score) winnerId = p2.id;
        const updatedPlayers = players.map(p => ({
          ...p,
          roundsWon: p.roundsWon + (winnerId === p.id ? 1 : 0),
          passed: false,
        })) as [typeof p1, typeof p2];
        const resetPlayers = resetBoard(updatedPlayers);
        const nextStarter = winnerId ?? state.currentPlayerId;
        return { players: resetPlayers, currentPlayerId: nextStarter, round: state.round + 1, phase: 'play' };
      }

      return { ...state, players };
    }
    case 'END_TURN': {
      console.log('Ending turn, switching to next player:', action.payload.nextPlayerId);
      // if current player has no cards, force pass
      const current = state.players.find(p => p.id === state.currentPlayerId)!;
      if (current.hand.length === 0) {
        console.log(`${current.name} has no cards left, auto-passing`);
        return gameReducer(state, { type: 'PASS', payload: { playerId: current.id } });
      }
      return { ...state, currentPlayerId: action.payload.nextPlayerId };
    }
    case 'PASS': {
      console.log('Player passing:', action.payload.playerId);
      const players = state.players.map(p => p.id === action.payload.playerId ? { ...p, passed: true } : p) as [typeof state.players[0], typeof state.players[1]];
      const [p1, p2] = players;
      // resolve round if both passed
      if (p1.passed && p2.passed) {
        console.log('Both players passed, resolving round');
        let winnerId: string | null = null;
        if (p1.score > p2.score) winnerId = p1.id;
        else if (p2.score > p1.score) winnerId = p2.id;
        const updatedPlayers = players.map(p => ({
          ...p,
          roundsWon: p.roundsWon + (winnerId === p.id ? 1 : 0),
          passed: false,
        })) as [typeof p1, typeof p2];
        console.log('Win goes to:', winnerId);
        const resetPlayers = resetBoard(updatedPlayers);
        const nextStarter = winnerId ?? state.currentPlayerId;
        console.log('Next starter:', nextStarter);
        return { players: resetPlayers, currentPlayerId: nextStarter, round: state.round + 1, phase: 'play' };
      }
      // switch turn
      const nextPlayer = players.find(p => p.id !== action.payload.playerId)!;
      console.log('Switching to next player:', nextPlayer.id);
      return { ...state, players, currentPlayerId: nextPlayer.id };
    }
    case 'RESET':
      console.log('Resetting game state');
      return {
        players: resetBoard(state.players),
        currentPlayerId: state.players[1].id,
        round: 1,
        phase: 'mulligan',
      };
    default:
      console.warn('Unknown action:', action);
      return state;
  }
}