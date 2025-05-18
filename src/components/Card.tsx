import React from 'react';
import { CardData } from '@/types/game';

interface CardProps {
  card: CardData;
}

const Card: React.FC<CardProps> = ({ card }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', card.id);
  };

  return (
    <div
      className="card"
      draggable
      onDragStart={handleDragStart}
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