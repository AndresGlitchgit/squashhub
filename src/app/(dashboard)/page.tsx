import { Calendar, Flame, Plus } from 'lucide-react';
import { redirect } from 'next/navigation';
import { formatDatePtBr, getInitials } from '@/lib/utils';
import { getCurrentUser } from '@/lib/supabase/server';
import {
  getPlayerProfile,
  getPlayerGroups,
  getPlayerStats,
  getRecentMatches,
  getUpcomingBookings,
} from '@/lib/supabase/queries';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Get the current authenticated user
  const authUser = await getCurrentUser();
  if (!authUser) {
    redirect('/auth/login');
  }

  const userId = authUser.id;

  // Get player profile
  const playerProfile = await getPlayerProfile(userId);

  // Get player's groups
  const playerGroups = await getPlayerGroups(userId);

  // If no group, show welcome screen
  if (!playerGroups || playerGroups.length === 0) {
    return (
      <main className="flex-1 overflow-y-auto pb-24 flex flex-col items-center justify-center min-h-screen">
        <div className="px-4 py-8 max-w-md w-full">
          <div className="bg-[#161616] border border-[#1f1f1f] rounded-lg p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 rounded-full bg-[#10B981] flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎾</span>
              </div>
              <h1 className="text-2xl font-bold text-[#f0f0f0] mb-2">
                Bem-vindo ao SquashHub!
              </h1>
              <p className="text-sm text-[#999] mb-6">
                Você ainda não faz parte de nenhum grupo. Crie um novo grupo ou junte-se a um existente.
              </p>
            </div>

            <div className="space-y-3">
              <a
                href="/groups/new"
                className="block w-full px-4 py-3 bg-[#10B981] text-[#0c0c0c] text-sm font-semibold rounded-lg hover:bg-[#0f9e6d] transition"
              >
                Criar Novo Grupo
              </a>
              <a
                href="/groups/join"
                className="block w-full px-4 py-3 bg-[#161616] border border-[#1f1f1f] text-[#f0f0f0] text-sm font-semibold rounded-lg hover:bg-[#1f1f1f] transition"
              >
                Entrar em um Grupo
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Get first group (primary group)
  const firstGroupMember = playerGroups[0];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groupRaw = firstGroupMember?.groups as any;
  const group = Array.isArray(groupRaw) ? groupRaw[0] : groupRaw;
  const groupId = group?.id;

  if (!groupId) {
    redirect('/groups/new');
  }

  // Fetch data for the group
  const [stats, recentMatchesRaw, upcomingBookingsRaw] = await Promise.all([
    getPlayerStats(userId, groupId),
    getRecentMatches(userId, groupId, 5),
    getUpcomingBookings(groupId, 1),
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const upcomingBookings: Array<{
    id: string;
    title: string;
    scheduled_at: string;
    max_players: number;
    venues: { id: string; name: string; address?: string; city?: string } | null;
    booking_rsvps: Array<{ player_id: string; status: string }>;
  }> = (upcomingBookingsRaw || []).map((b: any) => ({
    ...b,
    venues: Array.isArray(b.venues) ? b.venues[0] || null : b.venues || null,
    booking_rsvps: Array.isArray(b.booking_rsvps) ? b.booking_rsvps : [],
  }));

  const displayName = playerProfile?.display_name || authUser.email?.split('@')[0] || 'Jogador';
  const groupName = group?.name || 'Meu Grupo';
  const nextBooking = upcomingBookings?.[0];

  // Determine win streak and recent match results for activity feed
  const winStreak = stats?.win_streak || 0;
  const currentElo = stats?.elo_rating || 1200;

  return (
    <main className="flex-1 overflow-y-auto pb-24">
      {/* Header with greeting */}
      <div className="sticky top-0 bg-[#0c0c0c] border-b border-[#1f1f1f] px-4 py-5 z-10">
        <p className="text-xs text-[#999] uppercase tracking-wider mb-1">{groupName}</p>
        <h1 className="text-2xl font-bold text-[#f0f0f0]">
          Olá, {displayName}
        </h1>
      </div>

      <div className="px-4 pt-6">
        {/* Quick stats row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {/* Rating */}
          <div className="bg-[#161616] border border-[#1f1f1f] rounded-lg p-4 text-center">
            <p className="text-xs text-[#999] mb-2">Rating</p>
            <p className="text-2xl font-bold text-[#10B981] mb-1">
              {currentElo}
            </p>
            <p className="text-xs text-[#999]">Elo</p>
          </div>

          {/* Wins */}
          <div className="bg-[#161616] border border-[#1f1f1f] rounded-lg p-4 text-center">
            <p className="text-xs text-[#999] mb-2">Vitórias</p>
            <p className="text-2xl font-bold text-[#f0f0f0] mb-1">
              {stats?.wins || 0}
            </p>
            <p className="text-xs text-[#999]">de {stats?.total_matches || 0}</p>
          </div>

          {/* Win Streak */}
          <div className="bg-[#161616] border border-[#1f1f1f] rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Flame className="w-3 h-3 text-[#FBBF24]" />
            </div>
            <p className="text-2xl font-bold text-[#FBBF24] mb-1">
              {winStreak}
            </p>
            <p className="text-xs text-[#999]">Sequência</p>
          </div>
        </div>

        {/* Next match booking */}
        {nextBooking ? (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-[#f0f0f0] mb-3 uppercase tracking-wider">
              Próximo Jogo
            </h2>
            <div className="bg-[#161616] border border-[#1f1f1f] rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-[#f0f0f0] mb-1">
                    {nextBooking.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-[#999]">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {nextBooking.scheduled_at
                        ? formatDatePtBr(new Date(nextBooking.scheduled_at), 'EEEE, dd MMM')
                        : 'Data não definida'}
                    </span>
                  </div>
                </div>
                <button className="px-3 py-1 bg-[#10B981] text-[#0c0c0c] text-xs font-semibold rounded-md hover:bg-[#0f9e6d] transition">
                  RSVP
                </button>
              </div>

              <div className="text-sm text-[#999] mb-4">
                📍 {nextBooking.venues?.name || 'Local não definido'}
              </div>

              {/* Confirmed players avatars */}
              {nextBooking.booking_rsvps && nextBooking.booking_rsvps.length > 0 && (
                <div className="flex items-center gap-2">
                  <p className="text-xs text-[#999] font-medium">Confirmados:</p>
                  <div className="flex -space-x-2">
                    {nextBooking.booking_rsvps
                      .slice(0, 3)
                      .map((rsvp: { player_id: string; status: string }, index: number) => (
                        <div
                          key={rsvp.player_id}
                          className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center border-2 border-[#0c0c0c]"
                          title={`Player ${rsvp.player_id}`}
                        >
                          <span className="text-xs font-semibold text-[#0c0c0c]">
                            P{index + 1}
                          </span>
                        </div>
                      ))}
                  </div>
                  <span className="text-xs text-[#999]">
                    {nextBooking.booking_rsvps.length} de {nextBooking.max_players}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Recent matches */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-[#f0f0f0] mb-3 uppercase tracking-wider">
            Partidas Recentes
          </h2>
          {recentMatches && recentMatches.length > 0 ? (
            <div className="space-y-2">
              {recentMatches.map((match) => {
                const isWin = match.winner_id === userId;
                const opponent = match.player1_id === userId ? match.player2 : match.player1;
                const eloBefore = match.player1_id === userId ? match.player1_elo_before : match.player2_elo_before;
                const eloAfter = match.player1_id === userId ? match.player1_elo_after : match.player2_elo_after;
                const eloChange = eloAfter - eloBefore;

                // Calculate score from games
                const player1Score = match.match_games?.filter(
                  (g) => g.winner_id === match.player1_id
                ).length || 0;
                const player2Score = match.match_games?.filter(
                  (g) => g.winner_id === match.player2_id
                ).length || 0;
                const score = match.player1_id === userId ? `${player1Score}-${player2Score}` : `${player2Score}-${player1Score}`;

                return (
                  <div
                    key={match.id}
                    className="bg-[#161616] border border-[#1f1f1f] rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-[#0c0c0c]">
                          {opponent?.display_name ? getInitials(opponent.display_name) : 'OP'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#f0f0f0] truncate">
                          {opponent?.display_name || 'Adversário'}
                        </p>
                        <p className="text-xs text-[#999]">
                          {match.played_at ? formatDatePtBr(new Date(match.played_at), 'dd MMM') : 'Data desconhecida'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={`text-sm font-bold ${isWin ? 'text-[#10B981]' : 'text-[#999]'}`}>
                          {score}
                        </p>
                        <p className={`text-xs ${isWin ? 'text-[#10B981]' : 'text-red-500'}`}>
                          {isWin ? 'V' : 'D'}
                        </p>
                      </div>
                      <div className="text-xs text-right">
                        <p className={eloChange >= 0 ? 'text-[#10B981]' : 'text-red-500'}>
                          {eloChange >= 0 ? '+' : ''}{eloChange}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#161616] border border-[#1f1f1f] rounded-lg p-6 text-center">
              <p className="text-sm text-[#999]">Nenhuma partida registrada ainda</p>
            </div>
          )}
        </div>

        {/* Activity feed based on recent matches */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-[#f0f0f0] mb-3 uppercase tracking-wider">
            Atividade do Grupo
          </h2>
          {recentMatches && recentMatches.length > 0 ? (
            <div className="space-y-2">
              {recentMatches.slice(0, 5).map((match) => {
                const isWin = match.winner_id === userId;
                const opponent = match.player1_id === userId ? match.player2 : match.player1;
                const opponentName = opponent?.display_name || 'Adversário';
                const icon = isWin ? '🎾' : '💔';

                return (
                  <div
                    key={match.id}
                    className="bg-[#161616] border border-[#1f1f1f] rounded-lg p-3 flex items-start gap-3"
                  >
                    <div className="text-xl flex-shrink-0">
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#f0f0f0]">
                        {isWin
                          ? `Você venceu ${opponentName}`
                          : `Você perdeu para ${opponentName}`}
                      </p>
                      <p className="text-xs text-[#999] mt-1">
                        {match.played_at ? formatDatePtBr(new Date(match.played_at), 'dd MMM, HH:mm') : 'Data desconhecida'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#161616] border border-[#1f1f1f] rounded-lg p-6 text-center">
              <p className="text-sm text-[#999]">Nenhuma atividade registrada ainda</p>
            </div>
          )}
        </div>
      </div>

      {/* FAB - Floating Action Button */}
      <a
        href="/games/new-match"
        className="fixed bottom-6 right-4 w-14 h-14 bg-[#10B981] rounded-full flex items-center justify-center shadow-lg hover:bg-[#0f9e6d] transition text-[#0c0c0c] font-bold z-50"
        title="Registrar nova partida"
      >
        <Plus className="w-6 h-6" />
      </a>
    </main>
  );
}
