import React from 'react';
import { GameState, Row } from '@/types/game';
import Card from './Card';

interface BoardProps {
  gameState: GameState;
}

const rows: Row[] = ['siege','ranged','melee'];

const Board: React.FC<BoardProps> = ({ gameState }) => (
  <div className="board-container">
    {gameState.players.map((player) => (
      <div key={player.id} className="player-rows">
        {rows.map((row) => (
          <div key={row} className="row">
            <h4 className="row-title capitalize">{row}</h4>
            <div className="cards">
              {player.board[row].map((card) => (
                <Card key={card.id} card={card} />
              ))}
            </div>
          </div>
        ))}
      </div>
    ))}
  </div>
);

export default Board;