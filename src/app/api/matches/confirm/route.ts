import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
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
    const { match_id, action } = body;

    if (!match_id || !action) {
      return NextResponse.json(
        { error: 'Missing match_id or action' },
        { status: 400 }
      );
    }

    if (!['confirm', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Get match to verify user is opponent (player2)
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', match_id)
      .single();

    if (matchError || !match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    // Verify user is the opponent (player2)
    if (match.player2_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the opponent can confirm or reject' },
        { status: 403 }
      );
    }

    // Verify match is still pending
    if (match.status !== 'pendente') {
      return NextResponse.json(
        { error: 'Match is no longer pending' },
        { status: 400 }
      );
    }

    // Update match based on action
    const newStatus = action === 'confirm' ? 'confirmado' : 'rejeitado';
    const { data: updatedMatch, error: updateError } = await supabase
      .from('matches')
      .update({
        status: newStatus,
        confirmed_by: action === 'confirm' ? user.id : null,
        confirmed_at: action === 'confirm' ? new Date().toISOString() : null,
      })
      .eq('id', match_id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to ${action} match` },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedMatch, { status: 200 });
  } catch (error) {
    console.error('Error confirming/rejecting match:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
