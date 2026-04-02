import React from 'react';
import { Bell } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

interface HeaderProps {
  groupName?: string;
  playerInitial?: string;
  playerAvatarUrl?: string;
  unreadNotifications?: number;
}

export function Header({
  groupName = 'Squash Hub',
  playerInitial = 'S',
  playerAvatarUrl,
  unreadNotifications = 0,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#161616] border-b border-[#1f1f1f] backdrop-blur-sm">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        {/* Group Name */}
        <div className="flex-1">
          <h1 className="text-lg font-bold text-[#f0f0f0]">{groupName}</h1>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <button className="relative p-2 hover:bg-[#1f1f1f] rounded-full transition-colors">
            <Bell size={20} className="text-[#999]" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#FBBF24] rounded-full" />
            )}
          </button>

          {/* Player Avatar */}
          <Avatar initial={playerInitial} imageUrl={playerAvatarUrl} size="md" />
        </div>
      </div>
    </header>
  );
}
