'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function JoinGroupPage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      setError('Código de convite é obrigatório');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const res = await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_code: inviteCode.trim().toUpperCase() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao entrar no grupo');
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="text-5xl mb-4">🔗</div>
          <h1 className="text-2xl font-bold text-[#f0f0f0]">Entrar em um Grupo</h1>
          <p className="text-sm text-[#999] mt-2">
            Insira o código de convite para entrar em um grupo existente
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            type="text"
            label="Código de Convite"
            placeholder="Ex: ABC123"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            required
          />

          {error && (
            <div className="p-3 rounded-lg bg-red-900/20 border border-red-500 text-sm text-red-200">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            disabled={isLoading || !inviteCode.trim()}
            className="w-full"
          >
            Entrar no Grupo
          </Button>
        </form>

        <div className="text-center">
          <button
            onClick={() => router.push('/groups/new')}
            className="text-sm text-emerald-400 hover:underline"
          >
            Ou crie um novo grupo
          </button>
        </div>
      </div>
    </div>
  );
}
