'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function NewGroupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nome do grupo é obrigatório');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao criar grupo');
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
          <div className="text-5xl mb-4">🏸</div>
          <h1 className="text-2xl font-bold text-[#f0f0f0]">Criar Novo Grupo</h1>
          <p className="text-sm text-[#999] mt-2">
            Crie um grupo para jogar squash com seus amigos
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            type="text"
            label="Nome do Grupo"
            placeholder="Ex: Squash Club SP"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="w-full">
            <label className="block text-sm font-medium text-[#f0f0f0] mb-2">
              Descrição (opcional)
            </label>
            <textarea
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-[#f0f0f0] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
              rows={3}
              placeholder="Descreva seu grupo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

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
            disabled={isLoading || !name.trim()}
            className="w-full"
          >
            Criar Grupo
          </Button>
        </form>

        <div className="text-center">
          <button
            onClick={() => router.push('/groups/join')}
            className="text-sm text-emerald-400 hover:underline"
          >
            Ou entre em um grupo existente
          </button>
        </div>
      </div>
    </div>
  );
}
