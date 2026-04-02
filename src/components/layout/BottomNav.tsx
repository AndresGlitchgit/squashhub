'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, BarChart3, User } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export function BottomNav() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      label: 'Início',
      href: '/',
      icon: <Home size={24} />,
    },
    {
      label: 'Jogos',
      href: '/games',
      icon: <Calendar size={24} />,
    },
    {
      label: 'Ranking',
      href: '/ranking',
      icon: <BarChart3 size={24} />,
    },
    {
      label: 'Perfil',
      href: '/profile',
      icon: <User size={24} />,
    },
  ];

  const isActive = (href: string): boolean => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#161616] border-t border-[#1f1f1f] safe-area-inset-bottom">
      <div className="max-w-lg mx-auto">
        <ul className="flex items-center justify-around h-20">
          {navItems.map((item) => {
            const active = isActive(item.href);

            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className="flex flex-col items-center justify-center h-20 gap-1 group"
                >
                  <div
                    className={`transition-colors ${
                      active ? 'text-[#10B981]' : 'text-[#666] group-hover:text-[#999]'
                    }`}
                  >
                    {item.icon}
                  </div>
                  <span
                    className={`text-xs font-medium transition-colors ${
                      active
                        ? 'text-[#10B981] font-bold'
                        : 'text-[#666] group-hover:text-[#999]'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
