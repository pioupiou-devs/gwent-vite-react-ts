import React, { useReducer } from 'react';
import Board from '@/components/Board';
import ProfilePanel from '@/components/ProfilePanel';
import { GameState, CardData, Row, Player } from '@/types/game';
import { gameReducer } from '@/reducer/gameReducer';

const sampleCard: CardData = { id: '1', name: 'Blue Stripes Commando', strength: 4, row: 'melee', faction: 'Northern Realms' };
const initialPlayer = (id: string, name: string): Player => ({
  id, name,
  deck: [sampleCard], hand: [sampleCard],
  board: { melee: [], ranged: [], siege: [] },
  score: 0, passed: false, roundsWon: 0
});
const initialState: GameState = {
  players: [initialPlayer('p1','Enemy'), initialPlayer('p2','You')],
  currentPlayerId: 'p2', round: 1
};

const App: React.FC = () => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const endTurn = () => {
    dispatch({ type: 'END_TURN', payload: { nextPlayerId: state.players.find(p => p.id !== state.currentPlayerId)!.id } });
  };

  const pass = () => {
    dispatch({ type: 'PASS', payload: { playerId: state.currentPlayerId } });
  };

  const handlePlay = (cardId: string, targetRow: Row) => {
    const player = state.players.find(p => p.id === state.currentPlayerId)!;
    const card = player.hand.find(c => c.id === cardId);
    if (card) dispatch({ type: 'PLAY_CARD', payload: { playerId: player.id, card: { ...card, row: targetRow } } });
  };

  return (
    <div className="app-layout">
      <div className="sidebar">
        <ProfilePanel player={state.players[0]} isCurrent={state.currentPlayerId===state.players[0].id} />
        <button className="end-turn-btn" onClick={endTurn}>End Turn</button>
        <button className="end-turn-btn" onClick={pass}>Pass</button>
        <ProfilePanel player={state.players[1]} isCurrent={state.currentPlayerId===state.players[1].id} />
      </div>
      <div className="main-board">
        <Board gameState={state} onPlay={handlePlay} />
      </div>
    </div>
  );
};

export default App;