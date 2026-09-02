'use client';

import StatsCard from './StatsCard';
import type { StatsCardData } from '@/types/dashboard';

interface StatsCardsProps {
  cards: StatsCardData[];
}

export default function StatsCards({ cards }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, index) => (
        <StatsCard key={index} data={card} />
      ))}
    </div>
  );
}
