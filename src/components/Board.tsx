import React from 'react';
import { GameState, Row } from '@/types/game';
import Card from './Card';

interface BoardProps {
  gameState: GameState;
}

const orderedRows: { playerIndex: number; row: Row }[] = [
  { playerIndex: 0, row: 'siege' },
  { playerIndex: 0, row: 'ranged' },
  { playerIndex: 0, row: 'melee' },
  { playerIndex: 1, row: 'melee' },
  { playerIndex: 1, row: 'ranged' },
  { playerIndex: 1, row: 'siege' },
];

const Board: React.FC<BoardProps> = ({ gameState }) => (
  <div className="board-wrapper">
    <div className="board-container">
      {orderedRows.map(({ playerIndex, row }) => {
        const player = gameState.players[playerIndex];
        return (
          <div key={`${player.id}-${row}`} className="row">
            <h4 className="row-title capitalize">{row}</h4>
            <div className="cards">
              {player.board[row].map((card) => (
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

export default Board;