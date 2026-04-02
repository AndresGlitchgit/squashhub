import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: player, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Player profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(player, { status: 200 });
  } catch (error) {
    console.error('Error fetching player profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      display_name,
      bio,
      level,
      phone,
      whatsapp_opt_in,
      push_notifications,
      email_notifications,
      email,
      booking_reminders,
      match_confirmations,
      ranking_updates,
      tournament_updates,
    } = body;

    const updateData: any = {};

    if (display_name !== undefined) updateData.display_name = display_name;
    if (bio !== undefined) updateData.bio = bio;
    if (level !== undefined) updateData.level = level;
    if (phone !== undefined) updateData.phone = phone;
    if (whatsapp_opt_in !== undefined) updateData.whatsapp_opt_in = whatsapp_opt_in;
    if (push_notifications !== undefined) updateData.push_notifications = push_notifications;
    if (email_notifications !== undefined) updateData.email_notifications = email_notifications;
    if (email !== undefined) updateData.email = email;
    if (booking_reminders !== undefined) updateData.booking_reminders = booking_reminders;
    if (match_confirmations !== undefined) updateData.match_confirmations = match_confirmations;
    if (ranking_updates !== undefined) updateData.ranking_updates = ranking_updates;
    if (tournament_updates !== undefined) updateData.tournament_updates = tournament_updates;

    const { data: updatedPlayer, error } = await supabase
      .from('players')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update player profile' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedPlayer, { status: 200 });
  } catch (error) {
    console.error('Error updating player profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
