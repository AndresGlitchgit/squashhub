import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/server';
import { getPlayerProfile, upsertPlayerProfile } from '@/lib/supabase/queries';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  // Fetch current user and redirect if not authenticated
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Auto-create player profile if it doesn't exist (works for any login method)
  const existingProfile = await getPlayerProfile(user.id);
  if (!existingProfile) {
    const displayName =
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Jogador';
    await upsertPlayerProfile(user.id, {
      display_name: displayName,
      avatar_url: user.user_metadata?.avatar_url || null,
      level: 'intermediario',
    });
  }

  // Extract user initial from email or user metadata
  const userInitial = (user.email?.[0] || 'S').toUpperCase();

  return (
    <div className="flex flex-col min-h-screen bg-[#0c0c0c]">
      {/* Header */}
      <Header
        groupName="Squash Hub"
        playerInitial={userInitial}
        playerAvatarUrl={user.user_metadata?.avatar_url}
        unreadNotifications={0}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 pb-24 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
