'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { LeaderboardTable } from '@/components/ranking/LeaderboardTable';
import { HeadToHead } from '@/components/ranking/HeadToHead';
import { EloChart } from '@/components/ranking/EloChart';
import type { RankPlayer } from '@/components/ranking/PlayerRankCard';

interface RankingClientProps {
  players: RankPlayer[];
  eloChartData: number[];
  currentPlayerId: string;
}

export function RankingClient({ players, eloChartData, currentPlayerId }: RankingClientProps) {
  const [activeTab, setActiveTab] = useState<'geral' | 'mensal' | 'h2h'>('geral');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#f0f0f0] mb-2">Ranking</h2>
        <p className="text-[#999]">Classificação dos jogadores</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-[#333]">
        {(['geral', 'mensal', 'h2h'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab
                ? 'text-[#10B981] border-b-2 border-[#10B981]'
                : 'text-[#999] hover:text-[#f0f0f0]'
            }`}
          >
            {tab === 'geral' && 'Geral'}
            {tab === 'mensal' && 'Mensal'}
            {tab === 'h2h' && 'H2H'}
          </button>
        ))}
      </div>

      {/* General Ranking Tab */}
      {activeTab === 'geral' && (
        <div className="space-y-6">
          {eloChartData.length > 1 && (
            <Card variant="default">
              <h3 className="text-lg font-semibold text-[#f0f0f0] mb-4">Evolução de ELO</h3>
              <div className="h-64">
                <EloChart data={eloChartData} height={250} />
              </div>
            </Card>
          )}

          <Card variant="default">
            <h3 className="text-lg font-semibold text-[#f0f0f0] mb-4">Top Jogadores</h3>
            <LeaderboardTable players={players} currentPlayerId={currentPlayerId} />
          </Card>
        </div>
      )}

      {/* Monthly Ranking Tab */}
      {activeTab === 'mensal' && (
        <Card variant="default">
          <h3 className="text-lg font-semibold text-[#f0f0f0] mb-4">Ranking Mensal</h3>
          <LeaderboardTable
            players={players.slice(0, 10)}
            currentPlayerId={currentPlayerId}
          />
        </Card>
      )}

      {/* Head to Head Tab */}
      {activeTab === 'h2h' && (
        <Card variant="default">
          <h3 className="text-lg font-semibold text-[#f0f0f0] mb-4">Confronto Direto</h3>
          <HeadToHead players={players} />
        </Card>
      )}
    </div>
  );
}
