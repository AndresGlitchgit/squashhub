import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/server';
import { getPlayerGroups, getGroupLeaderboard, getEloHistory } from '@/lib/supabase/queries';
import { RankingClient } from './RankingClient';
import type { RankPlayer } from '@/components/ranking/PlayerRankCard';

export default async function RankingPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const groups = await getPlayerGroups(user.id);
  const firstGroup = groups[0];

  if (!firstGroup) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4">🏆</div>
        <h2 className="text-xl font-bold text-[#f0f0f0] mb-2">Sem ranking ainda</h2>
        <p className="text-[#999]">Entre em um grupo para ver o ranking</p>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groupId = (firstGroup.groups as any)?.id || firstGroup.group_id;
  const leaderboard = await getGroupLeaderboard(groupId);
  const eloHistory = await getEloHistory(user.id, groupId, 20);

  // Transform leaderboard to RankPlayer format
  const players: RankPlayer[] = leaderboard.map((entry) => ({
    id: entry.player_id,
    display_name: entry.display_name || 'Jogador',
    avatar_url: entry.avatar_url,
    elo_rating: entry.elo_rating || 1200,
    wins: Number(entry.wins) || 0,
    losses: Number(entry.losses) || 0,
    total_matches: Number(entry.total_matches) || 0,
    win_percentage: Number(entry.win_percentage) || 0,
  }));

  // Transform ELO history for chart
  const eloChartData = eloHistory.length > 0
    ? [eloHistory[0].rating_before, ...eloHistory.map((h) => h.rating_after)]
    : [1200];

  return (
    <RankingClient
      players={players}
      eloChartData={eloChartData}
      currentPlayerId={user.id}
    />
  );
}
