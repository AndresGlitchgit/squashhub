import { Player } from '@/types';
import { formatDatePtBr, getInitials } from '@/lib/utils';
import { Trophy, TrendingDown } from 'lucide-react';

interface MatchCardProps {
  player1: Player;
  player2: Player;
  player1Score: number;
  player2Score: number;
  winnerId: string;
  date: Date;
  eloChange: number;
  currentPlayerId: string;
}

export function MatchCard({
  player1,
  player2,
  player1Score,
  player2Score,
  winnerId,
  date,
  eloChange,
  currentPlayerId,
}: MatchCardProps) {
  const isCurrentPlayerWinner = winnerId === currentPlayerId;
  const opponent = player1.id === currentPlayerId ? player2 : player1;

  return (
    <div className="bg-[#161616] border border-[#1f1f1f] rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1">
        {/* Opponent avatar */}
        <div className="w-10 h-10 rounded-full bg-[#10B981] flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold text-[#0c0c0c]">
            {getInitials(opponent.firstName ? `${opponent.firstName} ${opponent.lastName}` : opponent.username)}
          </span>
        </div>

        {/* Match details */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#f0f0f0] truncate">
            {opponent.firstName ? `${opponent.firstName} ${opponent.lastName}` : opponent.username}
          </p>
          <p className="text-xs text-[#999] mt-0.5">
            {formatDatePtBr(date, 'PPp')}
          </p>
        </div>
      </div>

      {/* Score and result */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className={`text-lg font-bold ${isCurrentPlayerWinner ? 'text-[#10B981]' : 'text-[#999]'}`}>
            {player1.id === currentPlayerId ? player1Score : player2Score}
            {' '}
            -
            {' '}
            {player1.id === currentPlayerId ? player2Score : player1Score}
          </p>
          <p className="text-xs mt-1 flex items-center gap-1 justify-end">
            {isCurrentPlayerWinner ? (
              <Trophy className="w-3 h-3 text-[#FBBF24]" />
            ) : (
              <TrendingDown className="w-3 h-3 text-[#999]" />
            )}
            <span className={isCurrentPlayerWinner ? 'text-[#10B981]' : 'text-[#999]'}>
              {isCurrentPlayerWinner ? '+' : ''}{eloChange}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
