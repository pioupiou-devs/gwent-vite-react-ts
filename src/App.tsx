import React, { useReducer } from 'react';
import Board from '@/components/Board';
import ProfilePanel from '@/components/ProfilePanel';
import { GameState, CardData, Row, Player } from '@/types/game';
import { gameReducer } from '@/reducer/gameReducer';

// Sample setup
const sampleCard: CardData = { id: '1', name: 'Blue Stripes Commando', strength: 4, row: 'melee', faction: 'Northern Realms' };

const initialPlayer = (id: string, name: string): Player => ({
  id,
  name,
  deck: [sampleCard],
  hand: [sampleCard],
  board: { melee: [], ranged: [], siege: [] },
  score: 0,
  passed: false,
  roundsWon: 0,
});

const initialState: GameState = {
  players: [initialPlayer('p1', 'Enemy'), initialPlayer('p2', 'You')],
  currentPlayerId: 'p2',
  round: 1,
};

const App: React.FC = () => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const endTurn = () => {
    const nextPlayerId = state.players.find((p) => p.id !== state.currentPlayerId)!.id;
    dispatch({ type: 'END_TURN', payload: { nextPlayerId } });
  };

  const handlePlay = (cardId: string, targetRow: Row) => {
    const card = state.players[1].hand.find((c) => c.id === cardId);
    if (card) {
      const playedCard = { ...card, row: targetRow };
      dispatch({ type: 'PLAY_CARD', payload: { playerId: 'p2', card: playedCard } });
    }
  };

  return (
    <div className="app-layout">
      <div className="sidebar">
        <ProfilePanel player={state.players[0]} isCurrent={false} />
        <button className="end-turn-btn" onClick={endTurn}>End Turn</button>
        <ProfilePanel player={state.players[1]} isCurrent={true} />
      </div>
      <div className="main-board">
        <Board gameState={state} onPlay={handlePlay} />
      </div>
    </div>
  );
};

export default App;