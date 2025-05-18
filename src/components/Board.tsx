import React from 'react';
import { GameState, Row } from '@/types/game';
import Card from './Card';

interface BoardProps {
  gameState: GameState;
  onPlay: (cardId: string, targetRow: Row) => void;
}

const orderedRows: { playerIndex: number; row: Row }[] = [
  { playerIndex: 0, row: 'siege' },
  { playerIndex: 0, row: 'ranged' },
  { playerIndex: 0, row: 'melee' },
  { playerIndex: 1, row: 'melee' },
  { playerIndex: 1, row: 'ranged' },
  { playerIndex: 1, row: 'siege' },
];

const Board: React.FC<BoardProps> = ({ gameState, onPlay }) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, row: Row) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain');
    onPlay(cardId, row);
  };

  return (
    <div className="board-wrapper">
      <div className="board-container">
        {orderedRows.map(({ playerIndex, row }) => {
          const isCurrentPlayer = gameState.currentPlayerId === gameState.players[playerIndex].id;
          return (
            <div
              key={`${playerIndex}-${row}`} 
              className={`row ${isCurrentPlayer ? 'draggable' : ''}`}
              onDragOver={isCurrentPlayer ? handleDragOver : undefined}
              onDrop={isCurrentPlayer ? (e) => handleDrop(e, row) : undefined}
            >
              <h4 className="row-title capitalize">{row}</h4>
              <div className="cards">
                {gameState.players[playerIndex].board[row].map((card) => (
                  <Card key={card.id} card={card} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="hand-row">
        {gameState.players[1].hand.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
};

export default Board;