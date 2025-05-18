import React from 'react';
import Card from '@/components/Card';
import { CardData, Row } from '@/types/game';

const sampleCard: CardData = {
  id: '1',
  name: 'Blue Stripes Commando',
  strength: 4,
  row: 'melee' as Row,
  faction: 'Northern Realms',
};

const App: React.FC = () => {
  const handlePlay = (card: CardData) => {
    console.log('Played card:', card);
  };

  return (
    <div className="app-container">
      <h1>Gwent Clone</h1>
      <Card card={sampleCard} onPlay={handlePlay} />
    </div>
  );
};

export default App;