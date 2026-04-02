import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/server';
import {
  getPlayerProfile,
  getPlayerGroups,
  getPlayerStats,
  getRecentMatches,
} from '@/lib/supabase/queries';
import { formatDatePtBr, getInitials, formatElo } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import LogoutButton from './LogoutButton';

export default async function ProfilePage() {
  // Get current authenticated user
  const authUser = await getCurrentUser();
  if (!authUser) {
    redirect('/auth/login');
  }

  const userId = authUser.id;

  // Get player profile
  const playerProfile = await getPlayerProfile(userId);

  // Get player's groups
  const playerGroups = await getPlayerGroups(userId);

  // Get first group (primary group)
  const firstGroupMember = playerGroups?.[0];
  const groupId = firstGroupMember?.group_id;

  if (!groupId) {
    redirect('/');
  }

  // Fetch stats and recent matches
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, recentMatchesRaw] = await Promise.all([
    getPlayerStats(userId, groupId),
    getRecentMatches(userId, groupId, 5),
  ]);

  // Transform Supabase join arrays to single objects
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentMatches: Array<{
    id: string;
    player1_id: string;
    player2_id: string;
    winner_id: string;
    played_at: string;
    player1_elo_before: number;
    player1_elo_after: number;
    player2_elo_before: number;
    player2_elo_after: number;
    player1: { id: string; display_name: string; avatar_url?: string } | null;
    player2: { id: string; display_name: string; avatar_url?: string } | null;
    match_games: Array<{ game_number: number; player1_score: number; player2_score: number; winner_id: string }>;
  }> = (recentMatchesRaw || []).map((m: any) => ({
    ...m,
    player1: Array.isArray(m.player1) ? m.player1[0] || null : m.player1 || null,
    player2: Array.isArray(m.player2) ? m.player2[0] || null : m.player2 || null,
    match_games: Array.isArray(m.match_games) ? m.match_games : [],
  }));

  // Get display information
  const displayName =
    playerProfile?.display_name || authUser.email?.split('@')[0] || 'Jogador';
  const email = authUser.email || 'email@example.com';
  const avatar = playerProfile?.avatar_url;
  const level = playerProfile?.level || 'INTERMEDIATE';
  const bio = playerProfile?.bio || '';

  // Get stats
  const eloRating = stats?.elo_rating || 1200;
  const totalMatches = stats?.total_matches || 0;
  const wins = stats?.wins || 0;
  const losses = stats?.losses || 0;
  const winPercentage = stats?.win_percentage || 0;

  // Level labels
  const levelLabels: Record<string, string> = {
    BEGINNER: 'Iniciante',
    INTERMEDIATE: 'Intermediário',
    ADVANCED: 'Avançado',
  };
  const levelLabel = levelLabels[level] || 'Intermediário';

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-[#0c0c0c] border-b border-[#1f1f1f] px-4 py-5 z-10">
        <h1 className="text-2xl font-bold text-[#f0f0f0]">Perfil</h1>
      </div>

      <div className="px-4 pt-6 space-y-6">
        {/* Profile Header */}
        <Card variant="default" className="text-center">
          <div className="flex flex-col items-center gap-4">
            {avatar ? (
              <img
                src={avatar}
                alt={displayName}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <Avatar initial={displayName.charAt(0)} size="lg" />
            )}
            <div>
              <h3 className="text-lg font-semibold text-[#f0f0f0]">
                {displayName}
              </h3>
              <p className="text-[#999] text-sm">{email}</p>
              {bio && <p className="text-[#999] text-sm mt-1">{bio}</p>}
              <div className="mt-3 inline-block px-3 py-1 bg-[#1F2937] rounded-full">
                <span className="text-[#10B981] text-xs font-semibold">
                  {levelLabel}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card variant="default" className="text-center">
            <div className="space-y-2">
              <p className="text-[#999] text-sm">ELO Rating</p>
              <p className="text-2xl font-bold text-[#10B981]">
                {formatElo(eloRating)}
              </p>
            </div>
          </Card>

          <Card variant="default" className="text-center">
            <div className="space-y-2">
              <p className="text-[#999] text-sm">Total de Jogos</p>
              <p className="text-2xl font-bold text-[#f0f0f0]">
                {totalMatches}
              </p>
            </div>
          </Card>

          <Card variant="default" className="text-center">
            <div className="space-y-2">
              <p className="text-[#999] text-sm">Vitórias</p>
              <p className="text-2xl font-bold text-[#10B981]">{wins}</p>
            </div>
          </Card>

          <Card variant="default" className="text-center">
            <div className="space-y-2">
              <p className="text-[#999] text-sm">Derrotas</p>
              <p className="text-2xl font-bold text-[#EF4444]">{losses}</p>
            </div>
          </Card>

          <Card variant="default" className="text-center col-span-2">
            <div className="space-y-2">
              <p className="text-[#999] text-sm">Taxa de Vitória</p>
              <p className="text-2xl font-bold text-[#FBBF24]">
                {winPercentage}%
              </p>
            </div>
          </Card>
        </div>

        {/* Recent Matches */}
        <Card variant="default">
          <h3 className="text-lg font-semibold text-[#f0f0f0] mb-4">
            Partidas Recentes
          </h3>
          <div className="space-y-2">
            {recentMatches && recentMatches.length > 0 ? (
              recentMatches.map((match) => {
                // Determine opponent
                const isPlayer1 = match.player1_id === userId;
                const opponent = isPlayer1 ? match.player2 : match.player1;
                const opponentName = opponent?.display_name || 'Adversário';
                const opponentInitials = getInitials(opponentName);

                // Calculate score from match games
                const player1Wins =
                  match.match_games?.filter(
                    (g) => g.winner_id === match.player1_id
                  ).length || 0;
                const player2Wins =
                  match.match_games?.filter(
                    (g) => g.winner_id === match.player2_id
                  ).length || 0;

                const playerWins = isPlayer1 ? player1Wins : player2Wins;
                const opponentWins = isPlayer1 ? player2Wins : player1Wins;
                const score = `${playerWins}-${opponentWins}`;

                // Determine if win or loss and ELO change
                const isWin = match.winner_id === userId;
                const eloBefore = isPlayer1
                  ? match.player1_elo_before
                  : match.player2_elo_before;
                const eloAfter = isPlayer1
                  ? match.player1_elo_after
                  : match.player2_elo_after;
                const eloChange = eloAfter - eloBefore;
                const playedDate = new Date(match.played_at);

                return (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-3 bg-[#0F172A] rounded"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-[#0c0c0c]">
                          {opponentInitials}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#f0f0f0] font-medium text-sm truncate">
                          {opponentName}
                        </p>
                        <p className="text-[#999] text-xs">
                          {formatDatePtBr(playedDate, 'dd MMM')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p
                          className={`font-bold text-sm ${
                            isWin ? 'text-[#10B981]' : 'text-[#EF4444]'
                          }`}
                        >
                          {isWin ? 'V' : 'D'}
                        </p>
                        <p className="text-[#999] text-sm">{score}</p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold text-sm ${
                            eloChange >= 0
                              ? 'text-[#10B981]'
                              : 'text-[#EF4444]'
                          }`}
                        >
                          {eloChange >= 0 ? '+' : ''}{eloChange}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-[#999]">Nenhuma partida registrada ainda</p>
              </div>
            )}
          </div>
        </Card>

        {/* Settings */}
        <Card variant="default">
          <h3 className="text-lg font-semibold text-[#f0f0f0] mb-4">
            Configurações
          </h3>
          <div className="space-y-2">
            <Link
              href="/profile/edit"
              className="block w-full px-4 py-2 text-left text-[#f0f0f0] hover:bg-[#1F2937] rounded transition-colors"
            >
              ✏️ Editar Perfil
            </Link>
            <Link
              href="/profile/notifications"
              className="block w-full px-4 py-2 text-left text-[#f0f0f0] hover:bg-[#1F2937] rounded transition-colors"
            >
              🔔 Notificações
            </Link>
            <LogoutButton />
          </div>
        </Card>
      </div>
    </div>
  );
}
