import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/server';
import { getPlayerGroups, getGroupMembers, getPlayerProfile } from '@/lib/supabase/queries';
import { NewMatchWizard } from './NewMatchWizard';

// SimpleMember type for client component
interface SimpleMember {
  id: string;
  display_name: string;
  avatar_url: string | null;
  elo_rating: number;
  level: string;
}

export default async function NewMatchPage() {
  // Get current user
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's groups
  const groups = await getPlayerGroups(user.id);

  if (!groups || groups.length === 0) {
    return (
      <main className="flex-1 flex flex-col h-screen bg-[#0c0c0c]">
        <div className="flex items-center justify-center h-full px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#f0f0f0] mb-2">Nenhum Grupo</h1>
            <p className="text-[#999] mb-6">Você precisa estar em um grupo para registrar uma partida.</p>
            <a
              href="/"
              className="inline-block px-6 py-2 bg-[#10B981] text-[#0c0c0c] font-semibold rounded-lg hover:bg-[#0f9e6d] transition"
            >
              Voltar ao Dashboard
            </a>
          </div>
        </div>
      </main>
    );
  }

  // Get the first group (for now, assuming user wants to register in the first group)
  // In a real app, you might want to let the user select which group
  const groupId = groups[0]?.group_id;

  if (!groupId) {
    return (
      <main className="flex-1 flex flex-col h-screen bg-[#0c0c0c]">
        <div className="flex items-center justify-center h-full px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#f0f0f0] mb-2">Erro</h1>
            <p className="text-[#999]">Não foi possível carregar o grupo.</p>
          </div>
        </div>
      </main>
    );
  }

  // Get group members
  const groupMembersRaw = await getGroupMembers(groupId);

  // Get current user's profile
  const userProfile = await getPlayerProfile(user.id);

  // Transform group members to SimpleMember format
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const members: SimpleMember[] = groupMembersRaw
    .filter((member) => member.player_id !== user.id) // Filter out current user
    .map((member) => {
      // Supabase returns the joined table as an object (single FK) or array
      const p = member.players as any;
      return {
        id: member.player_id,
        display_name: p?.display_name || 'Jogador',
        avatar_url: p?.avatar_url || null,
        elo_rating: member.elo_rating,
        level: p?.level || 'intermediario',
      };
    });

  return (
    <NewMatchWizard
      members={members}
      userId={user.id}
      groupId={groupId}
      userName={userProfile?.display_name || 'Você'}
    />
  );
}
