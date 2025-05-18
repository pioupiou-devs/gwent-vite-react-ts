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
      className="card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <h3 className="card-title">{card.name}</h3>
      <div className="card-detail">Strength: <span className="card-strength">{card.strength}</span></div>
      <div className="card-detail">Row: <span className="card-row">{card.row}</span></div>
      {card.isHero && <div className="card-hero">Hero</div>}
    </div>
  );
};

export default Card;