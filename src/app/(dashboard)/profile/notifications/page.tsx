'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface NotificationPreferences {
  pushNotifications: boolean;
  whatsappNotifications: boolean;
  emailNotifications: boolean;
  whatsappPhone: string;
  email: string;
  notificationTypes: {
    bookingReminders: boolean;
    matchConfirmations: boolean;
    rankingUpdates: boolean;
    tournamentUpdates: boolean;
  };
}

interface PlayerData {
  id: string;
  push_notifications?: boolean;
  whatsapp_opt_in?: boolean;
  email_notifications?: boolean;
  phone?: string;
  email?: string;
  booking_reminders?: boolean;
  match_confirmations?: boolean;
  ranking_updates?: boolean;
  tournament_updates?: boolean;
  [key: string]: unknown;
}

/**
 * Toggle component for notification preferences
 */
function NotificationToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between py-3 px-3 rounded-lg hover:bg-[#1f1f1f] transition-colors">
      <div className="flex-1">
        <p className="text-[#f0f0f0] font-medium">{label}</p>
        <p className="text-[#999] text-sm mt-1">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900 ml-4 ${
          checked ? 'bg-emerald-600' : 'bg-gray-700'
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export default function NotificationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    pushNotifications: true,
    whatsappNotifications: false,
    emailNotifications: false,
    whatsappPhone: '',
    email: '',
    notificationTypes: {
      bookingReminders: true,
      matchConfirmations: true,
      rankingUpdates: true,
      tournamentUpdates: true,
    },
  });

  // Load preferences on component mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch user preferences from API
        const response = await fetch('/api/player', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Falha ao carregar preferências');
        }

        const playerData: PlayerData = await response.json();

        // Map database fields to component state
        setPreferences({
          pushNotifications: playerData.push_notifications ?? true,
          whatsappNotifications: playerData.whatsapp_opt_in ?? false,
          emailNotifications: playerData.email_notifications ?? false,
          whatsappPhone: playerData.phone || '',
          email: playerData.email || '',
          notificationTypes: {
            bookingReminders: playerData.booking_reminders ?? true,
            matchConfirmations: playerData.match_confirmations ?? true,
            rankingUpdates: playerData.ranking_updates ?? true,
            tournamentUpdates: playerData.tournament_updates ?? true,
          },
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Falha ao carregar preferências';
        setError(errorMessage);
        console.error('Error loading preferences:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  /**
   * Validate Brazilian phone number
   */
  const validatePhone = (phone: string): boolean => {
    if (!phone.trim()) {
      setPhoneError('Número de telefone é obrigatório');
      return false;
    }

    const cleaned = phone.replace(/\D/g, '');

    // Accept 10 or 11 digit Brazilian numbers
    if (cleaned.length !== 10 && cleaned.length !== 11) {
      setPhoneError('Número de telefone inválido (use formato: 48 99999-9999)');
      return false;
    }

    // If WhatsApp is enabled but phone is invalid, show error
    if (preferences.whatsappNotifications && cleaned.length === 10) {
      setPhoneError('Para WhatsApp, use um número com DDD e 9 dígitos');
      return false;
    }

    setPhoneError(null);
    return true;
  };

  /**
   * Handle phone number change with formatting
   */
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleaned = value.replace(/\D/g, '');

    // Limit to 11 digits
    if (cleaned.length <= 11) {
      let formatted = cleaned;

      // Format as (XX) 9XXXX-XXXX or (XX) XXXX-XXXX
      if (cleaned.length >= 2) {
        formatted = `(${cleaned.slice(0, 2)})`;

        if (cleaned.length > 2) {
          formatted += ` ${cleaned.slice(2, 7)}`;

          if (cleaned.length > 7) {
            formatted += `-${cleaned.slice(7, 11)}`;
          }
        }
      }

      setPreferences({
        ...preferences,
        whatsappPhone: formatted,
      });

      setPhoneError(null);
    }
  };

  /**
   * Handle email change
   */
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences({
      ...preferences,
      email: e.target.value,
    });
  };

  /**
   * Handle toggle changes
   */
  const handleToggleChange = (
    field: keyof Omit<
      NotificationPreferences,
      'notificationTypes' | 'whatsappPhone' | 'email'
    >,
    value: boolean,
  ) => {
    // If enabling WhatsApp, validate phone
    if (field === 'whatsappNotifications' && value) {
      if (!preferences.whatsappPhone.trim()) {
        setPhoneError('Adicione um número de telefone para ativar WhatsApp');
        return;
      }
    }

    setPreferences({
      ...preferences,
      [field]: value,
    });
  };

  /**
   * Handle notification type toggle
   */
  const handleNotificationTypeChange = (
    type: keyof NotificationPreferences['notificationTypes'],
    value: boolean,
  ) => {
    setPreferences({
      ...preferences,
      notificationTypes: {
        ...preferences.notificationTypes,
        [type]: value,
      },
    });
  };

  /**
   * Save preferences to database
   */
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      // Validate phone if WhatsApp is enabled
      if (preferences.whatsappNotifications) {
        if (!validatePhone(preferences.whatsappPhone)) {
          return;
        }
      }

      // Prepare update payload
      const updatePayload = {
        push_notifications: preferences.pushNotifications,
        whatsapp_opt_in: preferences.whatsappNotifications,
        email_notifications: preferences.emailNotifications,
        phone: preferences.whatsappPhone,
        email: preferences.email,
        booking_reminders: preferences.notificationTypes.bookingReminders,
        match_confirmations: preferences.notificationTypes.matchConfirmations,
        ranking_updates: preferences.notificationTypes.rankingUpdates,
        tournament_updates: preferences.notificationTypes.tournamentUpdates,
      };

      // Save to database via API
      const response = await fetch('/api/player', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar preferências');
      }

      setSuccessMessage('Preferências de notificações salvas com sucesso!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar preferências';
      setError(errorMessage);
      console.error('Error saving preferences:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[#f0f0f0] mb-2">Notificações</h2>
          <p className="text-[#999]">Carregando suas preferências...</p>
        </div>
        <Card variant="default" className="h-32 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#f0f0f0] mb-2">Notificações</h2>
        <p className="text-[#999]">Gerencie suas preferências de notificação</p>
      </div>

      {/* Error Message */}
      {error && (
        <Card variant="default" className="bg-red-900/20 border-red-800">
          <p className="text-red-400">{error}</p>
        </Card>
      )}

      {/* Success Message */}
      {successMessage && (
        <Card variant="default" className="bg-emerald-900/20 border-emerald-800">
          <p className="text-emerald-400">{successMessage}</p>
        </Card>
      )}

      {/* Notification Channels */}
      <Card variant="default">
        <h3 className="text-lg font-semibold text-[#f0f0f0] mb-4">Canais de Notificação</h3>
        <div className="space-y-2">
          <NotificationToggle
            label="Notificações Push"
            description="Receba notificações no navegador"
            checked={preferences.pushNotifications}
            onChange={(checked) => handleToggleChange('pushNotifications', checked)}
          />

          <NotificationToggle
            label="WhatsApp"
            description="Receba mensagens via WhatsApp (Brasil)"
            checked={preferences.whatsappNotifications}
            onChange={(checked) => handleToggleChange('whatsappNotifications', checked)}
          />

          {preferences.whatsappNotifications && (
            <div className="mt-4 ml-4 p-3 bg-[#1f1f1f] rounded-lg border border-[#2a2a2a]">
              <Input
                label="Número de WhatsApp"
                type="tel"
                placeholder="(48) 99999-9999"
                value={preferences.whatsappPhone}
                onChange={handlePhoneChange}
                error={phoneError || undefined}
                maxLength={17}
              />
              <p className="text-xs text-[#999] mt-2">
                Use seu número do Brasil no formato (DDD) 9XXXX-XXXX
              </p>
            </div>
          )}

          <NotificationToggle
            label="Email"
            description="Receba notificações por email"
            checked={preferences.emailNotifications}
            onChange={(checked) => handleToggleChange('emailNotifications', checked)}
          />

          {preferences.emailNotifications && (
            <div className="mt-4 ml-4 p-3 bg-[#1f1f1f] rounded-lg border border-[#2a2a2a]">
              <Input
                label="Email"
                type="email"
                placeholder="seu@email.com"
                value={preferences.email}
                onChange={handleEmailChange}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Notification Types */}
      <Card variant="default">
        <h3 className="text-lg font-semibold text-[#f0f0f0] mb-4">Tipos de Notificação</h3>
        <div className="space-y-2">
          <NotificationToggle
            label="Lembretes de Reserva"
            description="Lembrete quando uma reserva está se aproximando"
            checked={preferences.notificationTypes.bookingReminders}
            onChange={(checked) => handleNotificationTypeChange('bookingReminders', checked)}
          />

          <NotificationToggle
            label="Confirmação de Partida"
            description="Quando uma partida é confirmada"
            checked={preferences.notificationTypes.matchConfirmations}
            onChange={(checked) => handleNotificationTypeChange('matchConfirmations', checked)}
          />

          <NotificationToggle
            label="Atualizações de Ranking"
            description="Quando seu rating ELO é atualizado"
            checked={preferences.notificationTypes.rankingUpdates}
            onChange={(checked) => handleNotificationTypeChange('rankingUpdates', checked)}
          />

          <NotificationToggle
            label="Atualizações de Torneio"
            description="Novas sobre torneios em que você participa"
            checked={preferences.notificationTypes.tournamentUpdates}
            onChange={(checked) => handleNotificationTypeChange('tournamentUpdates', checked)}
          />
        </div>
      </Card>

      {/* Info Card */}
      <Card variant="default" className="bg-blue-900/20 border-blue-800">
        <div className="space-y-2">
          <h4 className="text-[#f0f0f0] font-medium">Informações</h4>
          <ul className="text-sm text-[#999] space-y-1 list-disc list-inside">
            <li>As notificações in-app são sempre ativadas</li>
            <li>
              Você pode receber notificações por múltiplos canais simultaneamente
            </li>
            <li>Use o formato correto do número brasileiro para WhatsApp</li>
            <li>Você pode desativar notificações a qualquer momento</li>
          </ul>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 sticky bottom-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pt-6 pb-4">
        <Button
          variant="secondary"
          size="lg"
          className="flex-1"
          onClick={() => window.history.back()}
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          size="lg"
          className="flex-1"
          isLoading={isSaving}
          onClick={handleSave}
        >
          {isSaving ? 'Salvando...' : 'Salvar Preferências'}
        </Button>
      </div>
    </div>
  );
}
