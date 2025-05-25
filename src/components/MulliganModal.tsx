import React, { useState } from 'react';
import { CardData } from '@/types/game';

interface MulliganModalProps {
  cards: CardData[];
  onConfirm: (keepIds: string[]) => void;
}

const MulliganModal: React.FC<MulliganModalProps> = ({ cards, onConfirm }) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else if (next.size < 3) next.add(id);
    setSelected(next);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Mulligan: select up to 3 cards to redraw</h2>
        <div className="mulligan-grid">
          {cards.map(c => (
            <div
              key={c.id}
              className={`mulligan-card ${selected.has(c.id) ? 'marked' : ''}`}
              onClick={() => toggle(c.id)}
            >
              <h4>{c.name}</h4>
              <p>Strength: {c.strength}</p>
            </div>
          ))}
        </div>
        <button onClick={() => onConfirm(Array.from(selected))} disabled={false}>Confirm</button>
      </div>
    </div>
  );
};

export default MulliganModal;