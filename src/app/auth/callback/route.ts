import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || 'Erro desconhecido')}`,
        requestUrl.origin
      )
    );
  }

  if (code) {
    // Create the redirect response FIRST so cookies can be set on it
    const redirectUrl = new URL('/', requestUrl.origin);
    const response = NextResponse.redirect(redirectUrl);

    // Create Supabase client that sets cookies directly on the response
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options as CookieOptions);
            });
          },
        },
      },
    );

    try {
      const { data, error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('Exchange error:', exchangeError);
        return NextResponse.redirect(
          new URL('/login?error=invalid_code', requestUrl.origin)
        );
      }

      if (data.user) {
        // Check if player profile exists, create if not
        const { data: existingPlayer } = await supabase
          .from('players')
          .select('id')
          .eq('id', data.user.id)
          .single();

        if (!existingPlayer) {
          const displayName =
            data.user.user_metadata?.name ||
            data.user.email?.split('@')[0] ||
            'Jogador';

          const { error: insertError } = await supabase
            .from('players')
            .insert({
              id: data.user.id,
              display_name: displayName,
              avatar_url: data.user.user_metadata?.avatar_url || null,
              level: 'intermediario',
              phone: null,
              whatsapp_opt_in: false,
              bio: null,
              is_discoverable: false,
            } as Record<string, unknown>);

          if (insertError) {
            console.error('Player creation error:', insertError);
          }
        }
      }

      // Return the response WITH cookies already set by Supabase
      return response;
    } catch (err) {
      console.error('Callback error:', err);
      return NextResponse.redirect(
        new URL('/login?error=callback_error', requestUrl.origin)
      );
    }
  }

  return NextResponse.redirect(new URL('/login', requestUrl.origin));
}
