/**
 * Supabase data-fetching helpers for SquashHub
 * All queries run server-side via createServerSupabaseClient
 */

import { createServerSupabaseClient } from './server';

// ==========================================
// PLAYER QUERIES
// ==========================================

export async function getPlayerProfile(userId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching player profile:', error);
  }
  return data;
}

export async function upsertPlayerProfile(userId: string, profile: {
  display_name: string;
  avatar_url?: string | null;
  level?: string;
}) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('players')
    .upsert({
      id: userId,
      ...profile,
    })
    .select()
    .single();

  if (error) console.error('Error upserting player:', error);
  return data;
}

// ==========================================
// GROUP QUERIES
// ==========================================

export async function getPlayerGroups(userId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      group_id,
      role,
      elo_rating,
      groups (
        id,
        name,
        description,
        image_url,
        invite_code,
        max_members,
        is_public,
        created_by
      )
    `)
    .eq('player_id', userId);

  if (error) {
    console.error('Error fetching player groups:', error);
  }
  return data || [];
}

export async function getGroupMembers(groupId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      player_id,
      role,
      elo_rating,
      joined_at,
      players (
        id,
        display_name,
        avatar_url,
        level
      )
    `)
    .eq('group_id', groupId)
    .order('elo_rating', { ascending: false });

  if (error) console.error('Error fetching group members:', error);
  return data || [];
}

export async function createGroup(name: string, userId: string, description?: string) {
  const supabase = await createServerSupabaseClient();

  // Create the group
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .insert({
      name,
      description: description || null,
      created_by: userId,
    })
    .select()
    .single();

  if (groupError || !group) {
    console.error('Error creating group:', groupError);
    return null;
  }

  // Add creator as admin member
  const { error: memberError } = await supabase
    .from('group_members')
    .insert({
      group_id: group.id,
      player_id: userId,
      role: 'admin',
      elo_rating: 1200,
    });

  if (memberError) console.error('Error adding creator as member:', memberError);
  return group;
}

export async function joinGroup(inviteCode: string, userId: string) {
  const supabase = await createServerSupabaseClient();

  // Find group by invite code
  const { data: group, error: findError } = await supabase
    .from('groups')
    .select('id, max_members')
    .eq('invite_code', inviteCode)
    .single();

  if (findError || !group) return { error: 'Grupo não encontrado' };

  // Check member count
  const { count } = await supabase
    .from('group_members')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', group.id);

  if (count && count >= group.max_members) return { error: 'Grupo lotado' };

  // Join
  const { error: joinError } = await supabase
    .from('group_members')
    .insert({
      group_id: group.id,
      player_id: userId,
      role: 'membro',
      elo_rating: 1200,
    });

  if (joinError) {
    if (joinError.code === '23505') return { error: 'Você já faz parte deste grupo' };
    return { error: 'Erro ao entrar no grupo' };
  }

  return { groupId: group.id };
}

// ==========================================
// MATCH QUERIES
// ==========================================

export async function getRecentMatches(userId: string, groupId?: string, limit = 10) {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from('matches')
    .select(`
      id,
      player1_id,
      player2_id,
      winner_id,
      format,
      status,
      played_at,
      player1_elo_before,
      player2_elo_before,
      player1_elo_after,
      player2_elo_after,
      notes,
      player1:players!matches_player1_id_fkey (id, display_name, avatar_url),
      player2:players!matches_player2_id_fkey (id, display_name, avatar_url),
      match_games (game_number, player1_score, player2_score, winner_id)
    `)
    .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
    .in('status', ['finalizado', 'confirmado'])
    .order('played_at', { ascending: false })
    .limit(limit);

  if (groupId) {
    query = query.eq('group_id', groupId);
  }

  const { data, error } = await query;
  if (error) console.error('Error fetching matches:', error);
  return data || [];
}

export async function getPendingMatches(userId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('matches')
    .select(`
      id,
      player1_id,
      player2_id,
      format,
      status,
      played_at,
      registered_by,
      player1:players!matches_player1_id_fkey (id, display_name, avatar_url),
      player2:players!matches_player2_id_fkey (id, display_name, avatar_url),
      match_games (game_number, player1_score, player2_score, winner_id)
    `)
    .eq('player2_id', userId)
    .eq('status', 'pendente')
    .order('played_at', { ascending: false });

  if (error) console.error('Error fetching pending matches:', error);
  return data || [];
}

export async function createMatch(matchData: {
  group_id: string;
  player1_id: string;
  player2_id: string;
  winner_id: string;
  format: string;
  registered_by: string;
  played_at?: string;
  games: Array<{
    game_number: number;
    player1_score: number;
    player2_score: number;
    winner_id: string;
  }>;
}) {
  const supabase = await createServerSupabaseClient();

  // Get current ELO ratings
  const { data: p1Member } = await supabase
    .from('group_members')
    .select('elo_rating')
    .eq('group_id', matchData.group_id)
    .eq('player_id', matchData.player1_id)
    .single();

  const { data: p2Member } = await supabase
    .from('group_members')
    .select('elo_rating')
    .eq('group_id', matchData.group_id)
    .eq('player_id', matchData.player2_id)
    .single();

  const p1Elo = p1Member?.elo_rating || 1200;
  const p2Elo = p2Member?.elo_rating || 1200;

  // Calculate new ELO
  const { data: eloResult } = await supabase.rpc('calculate_elo', {
    winner_rating: matchData.winner_id === matchData.player1_id ? p1Elo : p2Elo,
    loser_rating: matchData.winner_id === matchData.player1_id ? p2Elo : p1Elo,
    k_factor: 32,
  });

  const newWinnerElo = eloResult?.[0]?.new_winner_rating || (matchData.winner_id === matchData.player1_id ? p1Elo + 16 : p2Elo + 16);
  const newLoserElo = eloResult?.[0]?.new_loser_rating || (matchData.winner_id === matchData.player1_id ? p2Elo - 16 : p1Elo - 16);

  const p1EloAfter = matchData.winner_id === matchData.player1_id ? newWinnerElo : newLoserElo;
  const p2EloAfter = matchData.winner_id === matchData.player1_id ? newLoserElo : newWinnerElo;

  // Insert match with pending status - needs opponent confirmation
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .insert({
      group_id: matchData.group_id,
      player1_id: matchData.player1_id,
      player2_id: matchData.player2_id,
      winner_id: matchData.winner_id,
      format: matchData.format,
      status: 'pendente',
      played_at: matchData.played_at || new Date().toISOString(),
      player1_elo_before: p1Elo,
      player2_elo_before: p2Elo,
      player1_elo_after: p1EloAfter,
      player2_elo_after: p2EloAfter,
      registered_by: matchData.registered_by,
    })
    .select()
    .single();

  if (matchError || !match) {
    console.error('Error creating match:', matchError);
    return { error: matchError?.message || 'Erro ao criar partida' };
  }

  // Insert game scores
  const gamesInsert = matchData.games.map((g) => ({
    match_id: match.id,
    game_number: g.game_number,
    player1_score: g.player1_score,
    player2_score: g.player2_score,
    winner_id: g.winner_id,
  }));

  await supabase.from('match_games').insert(gamesInsert);

  // Update ELO ratings in group_members
  await supabase
    .from('group_members')
    .update({ elo_rating: p1EloAfter })
    .eq('group_id', matchData.group_id)
    .eq('player_id', matchData.player1_id);

  await supabase
    .from('group_members')
    .update({ elo_rating: p2EloAfter })
    .eq('group_id', matchData.group_id)
    .eq('player_id', matchData.player2_id);

  // Record ELO history
  await supabase.from('elo_history').insert([
    {
      player_id: matchData.player1_id,
      group_id: matchData.group_id,
      match_id: match.id,
      rating_before: p1Elo,
      rating_after: p1EloAfter,
    },
    {
      player_id: matchData.player2_id,
      group_id: matchData.group_id,
      match_id: match.id,
      rating_before: p2Elo,
      rating_after: p2EloAfter,
    },
  ]);

  return { match, p1EloAfter, p2EloAfter };
}

// ==========================================
// BOOKING QUERIES
// ==========================================

export async function getUpcomingBookings(groupId: string, limit = 5) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      id,
      title,
      scheduled_at,
      duration_minutes,
      max_players,
      status,
      notes,
      venues (id, name, address, city),
      booking_rsvps (player_id, status)
    `)
    .eq('group_id', groupId)
    .gte('scheduled_at', new Date().toISOString())
    .in('status', ['agendado', 'confirmado'])
    .order('scheduled_at', { ascending: true })
    .limit(limit);

  if (error) console.error('Error fetching bookings:', error);
  return data || [];
}

// ==========================================
// RANKING / LEADERBOARD QUERIES
// ==========================================

export async function getGroupLeaderboard(groupId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('group_leaderboard')
    .select('*')
    .eq('group_id', groupId)
    .order('elo_rating', { ascending: false });

  if (error) console.error('Error fetching leaderboard:', error);
  return data || [];
}

export async function getEloHistory(playerId: string, groupId: string, limit = 20) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('elo_history')
    .select('rating_before, rating_after, recorded_at')
    .eq('player_id', playerId)
    .eq('group_id', groupId)
    .order('recorded_at', { ascending: true })
    .limit(limit);

  if (error) console.error('Error fetching elo history:', error);
  return data || [];
}

export async function getPlayerStats(userId: string, groupId: string) {
  const supabase = await createServerSupabaseClient();

  // Get member info
  const { data: member } = await supabase
    .from('group_members')
    .select('elo_rating, joined_at')
    .eq('group_id', groupId)
    .eq('player_id', userId)
    .single();

  // Get match stats
  const { data: matches } = await supabase
    .from('matches')
    .select('id, winner_id, player1_id, player2_id')
    .eq('group_id', groupId)
    .eq('status', 'finalizado')
    .or(`player1_id.eq.${userId},player2_id.eq.${userId}`);

  const totalMatches = matches?.length || 0;
  const wins = matches?.filter((m) => m.winner_id === userId).length || 0;
  const losses = totalMatches - wins;
  const winPercentage = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  // Calculate win streak
  let winStreak = 0;
  if (matches && matches.length > 0) {
    for (const m of matches) {
      if (m.winner_id === userId) {
        winStreak++;
      } else {
        break;
      }
    }
  }

  return {
    elo_rating: member?.elo_rating || 1200,
    total_matches: totalMatches,
    wins,
    losses,
    win_percentage: winPercentage,
    win_streak: winStreak,
    joined_at: member?.joined_at,
  };
}
