import Image from 'next/image';
import { ArrowUp, ArrowDown } from 'lucide-react';

export interface RankPlayer {
  id: string;
  display_name: string;
  avatar_url?: string | null;
  elo_rating: number;
  wins: number;
  losses: number;
  total_matches: number;
  win_percentage: number;
}

interface PlayerRankCardProps {
  player: RankPlayer;
  rank: number;
  trend?: number;
  isCurrentUser?: boolean;
}

export function PlayerRankCard({
  player,
  rank,
  trend = 0,
  isCurrentUser = false,
}: PlayerRankCardProps) {
  const getMedalEmoji = (rank: number): string => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  const getPodiumColor = (rank: number): string => {
    if (rank === 1) return 'from-yellow-400 to-yellow-500';
    if (rank === 2) return 'from-gray-300 to-gray-400';
    if (rank === 3) return 'from-orange-500 to-orange-600';
    return '';
  };

  const isPodium = rank <= 3;
  const initial = player.display_name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isCurrentUser
          ? 'bg-gradient-to-r from-emerald-900/30 to-transparent border border-emerald-500/50'
          : isPodium
            ? `bg-gradient-to-r ${getPodiumColor(rank)} bg-opacity-10 border border-yellow-400/20`
            : 'bg-[#161616] hover:bg-[#1f1f1f] border border-[#1f1f1f]'
      }`}
    >
      {/* Rank */}
      <div className="flex items-center justify-center w-10 flex-shrink-0">
        {isPodium ? (
          <span className="text-2xl">{getMedalEmoji(rank)}</span>
        ) : (
          <span className="text-sm font-bold text-[#9CA3AF] w-6">{rank}</span>
        )}
      </div>

      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center overflow-hidden">
          {player.avatar_url ? (
            <Image
              src={player.avatar_url}
              alt={player.display_name}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-bold text-white">{initial}</span>
          )}
        </div>
      </div>

      {/* Player Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#f0f0f0] truncate text-sm">
          {player.display_name}
        </p>
        <p className="text-xs text-[#9CA3AF]">
          {player.wins}V {player.losses}D • {player.win_percentage.toFixed(1)}%
        </p>
      </div>

      {/* Elo Rating */}
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-[#FBBF24] text-sm">{player.elo_rating}</p>
      </div>

      {/* Trend */}
      {trend !== 0 && (
        <div className="flex items-center gap-1 flex-shrink-0">
          {trend > 0 ? (
            <>
              <ArrowUp className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-500">+{trend}</span>
            </>
          ) : (
            <>
              <ArrowDown className="w-4 h-4 text-red-500" />
              <span className="text-xs font-semibold text-red-500">{trend}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
