import { useState, useEffect } from 'react';
import type { CardData } from '@/types/game';

export function useCards(): { cards: CardData[]; loading: boolean; error: unknown } {
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/data/cards.json')
      .then(res => res.json())
      .then((data: CardData[]) => setCards(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { cards, loading, error };
}