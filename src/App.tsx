import React, { useReducer, useEffect } from 'react';
import Board from '@/components/Board';
import ProfilePanel from '@/components/ProfilePanel';
import MulliganModal from '@/components/MulliganModal';
import { Row } from '@/types/game';
import { gameReducer } from '@/reducer/gameReducer';
import { useCards } from '@/data/useCards';

const App: React.FC = () => {
  const { cards, loading } = useCards();
  const [state, dispatch] = useReducer(gameReducer, {
    players: [
      { id: 'p1', name: 'Enemy', deck: [], hand: [], mulliganHand: [], board: { melee: [], ranged: [], siege: [] }, score: 0, passed: false, roundsWon: 0 },
      { id: 'p2', name: 'You', deck: [], hand: [], mulliganHand: [], board: { melee: [], ranged: [], siege: [] }, score: 0, passed: false, roundsWon: 0 }
    ],
    currentPlayerId: 'p2',
    round: 1,
    phase: 'mulligan',
  });

  useEffect(() => {
    if (!loading && cards.length > 0) {
      dispatch({ type: 'INIT' });
    }
  }, [loading, cards]);

  if (loading || !state) return <div>Loading...</div>;

  if (state.phase === 'mulligan') {
    const player = state.players.find(p => p.id === state.currentPlayerId)!;
    return <MulliganModal cards={player.mulliganHand} onConfirm={keepIds => dispatch({ type:'MULLIGAN', payload: { keepInstanceIds: keepIds } })} />;
  }
  else if (state.phase === 'play') {
     const endTurn = () => {
    const nextPlayerId = state.players.find(p => p.id !== state.currentPlayerId)!.id;
    dispatch({ type: 'END_TURN', payload: { nextPlayerId } });
  };
  const pass = () => dispatch({ type: 'PASS', payload: { playerId: state.currentPlayerId } });
  const handlePlay = (cardId: string, targetRow: Row) => {
    const player = state.players.find(p => p.id === state.currentPlayerId)!;
    const card = player.hand.find(c => c.instanceId === cardId);
    if (card) dispatch({ type: 'PLAY_CARD', payload: { playerId: player.id, instanceId: card.instanceId, row: targetRow } });
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
  }
  else if (state.phase === 'ended') {
    const winner = state.players.reduce((prev, curr) => (curr.roundsWon > prev.roundsWon ? curr : prev));
    return (
      <div className="game-over">
        <h2>Game Over</h2>
        <h3>Winner: {winner.name}</h3>
        <button onClick={() => dispatch({ type: 'RESET' })}>Play Again</button>
      </div>
    );
  }
  // Default case, should not happen
  return <div className="error">Unexpected game state</div>;
  };

export default App;