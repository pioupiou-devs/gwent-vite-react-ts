import React from 'react';
import { CardData } from '@/types/game';

interface CardProps {
  card: CardData;
  onPlay?: (card: CardData) => void;
}

const Card: React.FC<CardProps> = ({ card, onPlay }) => {
  const handleClick = () => {
    onPlay?.(card);
  };

  return (
    <div
      className="card p-2 border rounded shadow cursor-pointer"
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <h3 className="font-bold">{card.name}</h3>
      <div>Strength: {card.strength}</div>
      <div>Row: {card.row}</div>
      {card.isHero && <div className="text-red-600">Hero</div>}
    </div>
  );
};

export default Card;