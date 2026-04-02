import { Player } from '@/types';
import { MatchCard } from './MatchCard';

export interface MatchHistoryItem {
  id: string;
  player1: Player;
  player2: Player;
  player1Score: number;
  player2Score: number;
  winnerId: string;
  date: Date;
  eloChange: number;
}

interface MatchHistoryProps {
  matches: MatchHistoryItem[];
  currentPlayerId: string;
  filter?: string;
}

export function MatchHistory({
  matches,
  currentPlayerId,
  filter,
}: MatchHistoryProps) {
  let filteredMatches = matches;

  if (filter) {
    filteredMatches = matches.filter((match) => {
      const opponent = match.player1.id === currentPlayerId ? match.player2 : match.player1;
      return opponent.username.toLowerCase().includes(filter.toLowerCase());
    });
  }

  if (filteredMatches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-[#161616] flex items-center justify-center mb-4">
          <span className="text-2xl">🎾</span>
        </div>
        <p className="text-[#f0f0f0] font-medium">Nenhuma partida encontrada</p>
        <p className="text-[#999] text-sm mt-1">Registre sua primeira partida para começar</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredMatches.map((match) => (
        <MatchCard
          key={match.id}
          player1={match.player1}
          player2={match.player2}
          player1Score={match.player1Score}
          player2Score={match.player2Score}
          winnerId={match.winnerId}
          date={match.date}
          eloChange={match.eloChange}
          currentPlayerId={currentPlayerId}
        />
      ))}
    </div>
  );
}
