import { PlayerRankCard, type RankPlayer } from './PlayerRankCard';

interface LeaderboardTableProps {
  players: RankPlayer[];
  currentPlayerId?: string;
  trend?: Record<string, number>;
}

export function LeaderboardTable({
  players,
  currentPlayerId,
  trend = {},
}: LeaderboardTableProps) {
  if (players.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-[#161616] flex items-center justify-center mb-4">
          <span className="text-2xl">🏆</span>
        </div>
        <p className="text-[#9CA3AF] text-sm">Nenhum jogador no ranking ainda</p>
        <p className="text-[#666666] text-xs mt-1">Complete partidas para aparecer no ranking</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {players.map((player, index) => (
        <PlayerRankCard
          key={player.id}
          player={player}
          rank={index + 1}
          trend={trend[player.id] || 0}
          isCurrentUser={currentPlayerId === player.id}
        />
      ))}
    </div>
  );
}
