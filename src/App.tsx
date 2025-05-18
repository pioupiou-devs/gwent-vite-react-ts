import React, { useReducer } from 'react';
import Board from '@/components/Board';
import ProfilePanel from '@/components/ProfilePanel';
import { GameState, CardData, Row } from '@/types/game';
import { gameReducer } from '@/reducer/gameReducer';

// Initial sample card
const sampleCard: CardData = {
  id: '1',
  name: 'Blue Stripes Commando',
  strength: 4,
  row: 'melee' as Row,
  faction: 'Northern Realms',
};

// Initial game state with two players
const initialState: GameState = {
  players: [
    {
      id: 'p1',
      name: 'Player 1',
      deck: [],
      hand: [],
      board: { melee: [], ranged: [], siege: [] },
      score: 0,
    },
    {
      id: 'p2',
      name: 'Player 2',
      deck: [sampleCard],
      hand: [sampleCard],
      board: { melee: [], ranged: [], siege: [] },
      score: 0,
    },
  ],
  currentPlayerId: 'p1',
  round: 1,
  passed: { p1: false, p2: false },
};


const App: React.FC = () => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const current = state.players[1];
  const enemy = state.players[1];

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
        <ProfilePanel player={enemy} isCurrent={false} roundsWon={0} />
        <ProfilePanel player={current} isCurrent={true} roundsWon={1} />
      </div>
      <div className="main-board">
        <Board gameState={state} onPlay={handlePlay} />
      </div>
    </div>
  );
};

export default App;