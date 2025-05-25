import { useState, useEffect } from 'react';
import type { CardType } from '@/types/game';

export function useCards(): { cards: CardType[]; loading: boolean; error: unknown } {
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/data/cards.json')
      .then(res => res.json())
      .then((data: CardType[]) => setCards(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { cards, loading, error };
}