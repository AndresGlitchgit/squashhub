'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Toggle';
import { Toast } from '@/components/ui/Toast';

interface PlayerProfile {
  id: string;
  display_name: string;
  bio?: string;
  level?: string;
  phone?: string;
  whatsapp_opt_in?: boolean;
  avatar_url?: string;
}

const LEVEL_OPTIONS = [
  { value: 'BEGINNER', label: 'Iniciante' },
  { value: 'INTERMEDIATE', label: 'Intermediário' },
  { value: 'ADVANCED', label: 'Avançado' },
  { value: 'PROFESSIONAL', label: 'Profissional' },
];

export default function EditProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    level: 'INTERMEDIATE',
    phone: '',
    whatsapp_opt_in: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // Fetch current profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/player');
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data: PlayerProfile = await response.json();
        setFormData({
          display_name: data.display_name || '',
          bio: data.bio || '',
          level: data.level || 'INTERMEDIATE',
          phone: data.phone || '',
          whatsapp_opt_in: data.whatsapp_opt_in || false,
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        setToast({
          message: 'Erro ao carregar perfil',
          type: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.display_name.trim()) {
      newErrors.display_name = 'Nome de exibição é obrigatório';
    }

    if (formData.display_name.length > 100) {
      newErrors.display_name = 'Nome deve ter no máximo 100 caracteres';
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Biografia deve ter no máximo 500 caracteres';
    }

    if (formData.phone && formData.phone.length > 20) {
      newErrors.phone = 'Telefone deve ter no máximo 20 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      whatsapp_opt_in: e.target.checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/player', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          display_name: formData.display_name,
          bio: formData.bio,
          level: formData.level,
          phone: formData.phone,
          whatsapp_opt_in: formData.whatsapp_opt_in,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setToast({
        message: 'Perfil atualizado com sucesso',
        type: 'success',
      });

      // Redirect back to profile page after success
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (error) {
      console.error('Error updating profile:', error);
      setToast({
        message: 'Erro ao salvar perfil. Tente novamente.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="sticky top-0 bg-[#0c0c0c] border-b border-[#1f1f1f] px-4 py-5 z-10">
          <h1 className="text-2xl font-bold text-[#f0f0f0]">Editar Perfil</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-[#999]">Carregando perfil...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-[#0c0c0c] border-b border-[#1f1f1f] px-4 py-5 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#f0f0f0]">Editar Perfil</h1>
          <button
            onClick={handleBack}
            className="text-[#999] hover:text-[#f0f0f0] transition-colors"
            aria-label="Voltar"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Display Name */}
          <Card variant="default">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#f0f0f0]">
                Informações Básicas
              </h3>

              <Input
                label="Nome de Exibição"
                name="display_name"
                type="text"
                value={formData.display_name}
                onChange={handleInputChange}
                placeholder="Seu nome"
                maxLength={100}
                error={errors.display_name}
                variant={errors.display_name ? 'error' : 'default'}
              />

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Nível ({formData.display_name ? formData.display_name : 'seu nome'})
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-text-primary hover:border-gray-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                >
                  {LEVEL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Biografia
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Conte um pouco sobre você..."
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-text-primary placeholder:text-text-tertiary hover:border-gray-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors resize-none"
                />
                <p className="mt-1 text-xs text-text-tertiary text-right">
                  {formData.bio.length}/500
                </p>
                {errors.bio && (
                  <p className="mt-1 text-sm text-red-400">{errors.bio}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card variant="default">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#f0f0f0]">
                Informações de Contato
              </h3>

              <Input
                label="Telefone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+55 (11) 99999-9999"
                maxLength={20}
                error={errors.phone}
                variant={errors.phone ? 'error' : 'default'}
              />

              <div className="pt-2 pb-1">
                <Toggle
                  label="Aceitar contato via WhatsApp"
                  description="Permite que outros jogadores e administradores do grupo entrem em contato com você via WhatsApp"
                  name="whatsapp_opt_in"
                  checked={formData.whatsapp_opt_in}
                  onChange={handleToggleChange}
                />
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <Card variant="default" className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={handleBack}
              disabled={isSaving}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </Card>
        </form>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={toast.type === 'success' ? 2000 : 4000}
        />
      )}
    </div>
  );
}
