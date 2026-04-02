import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/server';
import {
  getPlayerGroups,
  getUpcomingBookings,
  getRecentMatches,
  getPendingMatches,
} from '@/lib/supabase/queries';
import GamesClient from './GamesClient';

export default async function GamesPage() {
  // Get current authenticated user
  const authUser = await getCurrentUser();
  if (!authUser) {
    redirect('/auth/login');
  }

  const userId = authUser.id;

  // Get player's groups
  const playerGroups = await getPlayerGroups(userId);

  // Get first group (primary group)
  const firstGroupMember = playerGroups?.[0];
  const groupId = firstGroupMember?.group_id;

  if (!groupId) {
    redirect('/');
  }

  // Fetch upcoming bookings, recent matches, and pending matches
  const [upcomingBookingsRaw, recentMatchesRaw, pendingMatchesRaw] = await Promise.all([
    getUpcomingBookings(groupId, 10),
    getRecentMatches(userId, groupId, 20),
    getPendingMatches(userId),
  ]);

  // Transform Supabase join arrays to single objects for client component types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookings = (upcomingBookingsRaw || []).map((b: any) => ({
    ...b,
    venues: Array.isArray(b.venues) ? b.venues[0] || null : b.venues || null,
    booking_rsvps: Array.isArray(b.booking_rsvps) ? b.booking_rsvps : [],
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const matches = (recentMatchesRaw || []).map((m: any) => ({
    ...m,
    player1: Array.isArray(m.player1) ? m.player1[0] || null : m.player1 || null,
    player2: Array.isArray(m.player2) ? m.player2[0] || null : m.player2 || null,
    match_games: Array.isArray(m.match_games) ? m.match_games : [],
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingMatches = (pendingMatchesRaw || []).map((m: any) => ({
    ...m,
    player1: Array.isArray(m.player1) ? m.player1[0] || null : m.player1 || null,
    player2: Array.isArray(m.player2) ? m.player2[0] || null : m.player2 || null,
    match_games: Array.isArray(m.match_games) ? m.match_games : [],
  }));

  return (
    <GamesClient
      bookings={bookings}
      matches={matches}
      pendingMatches={pendingMatches}
      userId={userId}
    />
  );
}
