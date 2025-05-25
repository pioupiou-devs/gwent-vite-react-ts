import { GameState, CardData, Player, CardType } from '@/types/game';
import { v4 as uuidv4 } from 'uuid';

type Action =
  | { type: 'INIT'; payload: Omit<GameState, 'phase'> }
  | { type: 'MULLIGAN'; payload: { keepInstanceIds: string[] } }
  | { type: 'PLAY_CARD'; payload: { playerId: string; instanceId: string; row: keyof Player['board'] } }
  | { type: 'END_TURN'; payload: { nextPlayerId: string } }
  | { type: 'PASS'; payload: { playerId: string } }
  | { type: 'RESET'; payload: object };

// sample a number of instances with unique instanceIds
function sampleInstances(pool: CardType[], count: number): CardData[] {
  const result: CardData[] = [];
  for (let i = 0; i < count; i++) {
    const base = pool[Math.floor(Math.random() * pool.length)];
    result.push({ id: uuidv4(), type: base });
  }
  return result;
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
  if (action.type === 'INIT') {
    // Initialize game: draw 10 instances for each player
    const mapped = action.payload.players.map(p => ({
      ...p,
      hand: [],
      mulliganHand: sampleInstances(p.deck, 10),
      board: { melee: [], ranged: [], siege: [] },
      score: 0,
      passed: false,
      roundsWon: 0,
    }));
    const [p1, p2] = mapped;
    const initPlayers: [typeof p1, typeof p2] = [p1, p2];

    return { players: initPlayers, currentPlayerId: action.payload.currentPlayerId, round: action.payload.round, phase: 'mulligan' };
  }

  switch (action.type) {
    case 'MULLIGAN': {
      const players = state.players.map(p => {
        if (p.id !== state.currentPlayerId) return p;
        // keep unmarked, redraw marked
        const keep = p.mulliganHand.filter(c => !action.payload.keepInstanceIds.includes(c.id));
        const redrawCount = p.mulliganHand.length - keep.length;
        const redraws = sampleInstances(p.deck, redrawCount);
        return { ...p, hand: [...keep, ...redraws], mulliganHand: [] };
      }) as [Player, Player];
      return { ...state, players, phase: 'play' };
    }

    case 'PLAY_CARD': {
      const players = state.players.map(p => {
        if (p.id !== action.payload.playerId) return p;
        // play instance with instanceId
        const card = p.hand.find(c => c.id === action.payload.instanceId)!;
        const newHand = p.hand.filter(c => c.id !== action.payload.instanceId);
        const newBoard = { ...p.board, [action.payload.row]: [...p.board[action.payload.row], card] };
        const newScore = Object.values(newBoard).flat().reduce((s, c) => s + c.type.strength, 0);
        return { ...p, hand: newHand, board: newBoard, score: newScore, passed: newHand.length === 0 };
      }) as [Player, Player];

      // resolve if both passed
      if (players.every(p => p.passed)) {
        return gameReducer({ ...state, players }, { type: 'PASS', payload: { playerId: '' } });
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