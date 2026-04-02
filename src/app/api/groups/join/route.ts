import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { joinGroup } from '@/lib/supabase/queries';

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
    const { invite_code } = body;

    if (!invite_code) {
      return NextResponse.json(
        { error: 'Missing invite_code' },
        { status: 400 }
      );
    }

    const result = await joinGroup(invite_code, user.id);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error joining group:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
