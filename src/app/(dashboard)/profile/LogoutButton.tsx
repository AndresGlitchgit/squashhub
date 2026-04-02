'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full px-4 py-2 text-left text-[#EF4444] hover:bg-[#1F2937] rounded transition-colors"
    >
      🚪 Sair
    </button>
  );
}
