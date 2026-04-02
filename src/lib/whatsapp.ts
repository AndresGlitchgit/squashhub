/**
 * WhatsApp integration service
 * Supports Z-API or WhatsApp Business API
 */

import { retryWithBackoff } from './utils';

// Configuration types
export type WhatsAppProvider = 'zapi' | 'whatsapp-business';

interface WhatsAppConfig {
  provider: WhatsAppProvider;
  zapiToken?: string;
  zapiInstance?: string;
  businessPhoneNumberId?: string;
  businessAccessToken?: string;
  rateLimitPerMinute: number;
}

// Message templates in Portuguese Brazilian
const MESSAGE_TEMPLATES = {
  bookingReminder: (
    bookingTitle: string,
    date: string,
    time: string,
    venue: string,
  ): string => `Lembrete de Reserva! 🎾\n\n${bookingTitle}\nData: ${date}\nHora: ${time}\nLocal: ${venue}\n\nConfirme sua participação no SquashHub!`,

  matchConfirmation: (opponentName: string): string =>
    `Partida Confirmada! ✅\n\nVocê tem uma partida programada contra ${opponentName}.\n\nAcesse o SquashHub para mais detalhes.`,

  matchResult: (opponentName: string, score: string): string =>
    `Resultado da Partida 🏆\n\nOpponente: ${opponentName}\nPlacar: ${score}\n\nVeja seu novo rating no SquashHub!`,

  rankingUpdate: (newRating: number, change: number, position: number): string => {
    const changeText = change > 0 ? `📈 +${change}` : `📉 ${change}`;
    return `Atualização de Ranking! ${changeText}\n\nSeu novo rating: ${newRating}\nPosição: #${position}\n\nContinue jogando para subir no ranking!`;
  },

  tournamentNotification: (tournamentName: string, message: string): string =>
    `Notificação de Torneio! 🏅\n\n${tournamentName}\n\n${message}\n\nAcesse o SquashHub para mais informações.`,

  generic: (message: string): string => message,
};

// Rate limiting helper
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number = 60000; // 1 minute

  constructor(maxRequests: number) {
    this.maxRequests = maxRequests;
  }

  async checkLimit(): Promise<boolean> {
    const now = Date.now();
    // Remove old requests outside the window
    this.requests = this.requests.filter((time) => now - time < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      return false;
    }

    this.requests.push(now);
    return true;
  }

  getRetryAfter(): number {
    if (this.requests.length === 0) return 0;
    const oldestRequest = this.requests[0];
    const retryAfter = Math.ceil((oldestRequest + this.windowMs - Date.now()) / 1000);
    return Math.max(0, retryAfter);
  }
}

// WhatsApp service class
export class WhatsAppService {
  private config: WhatsAppConfig;
  private rateLimiter: RateLimiter;

  constructor(config: Partial<WhatsAppConfig> = {}) {
    this.config = {
      provider: (process.env.WHATSAPP_PROVIDER as WhatsAppProvider) || 'zapi',
      zapiToken: process.env.ZAPI_TOKEN,
      zapiInstance: process.env.ZAPI_INSTANCE,
      businessPhoneNumberId: process.env.WHATSAPP_BUSINESS_PHONE_ID,
      businessAccessToken: process.env.WHATSAPP_BUSINESS_TOKEN,
      rateLimitPerMinute: parseInt(process.env.WHATSAPP_RATE_LIMIT || '60', 10),
      ...config,
    };

    this.rateLimiter = new RateLimiter(this.config.rateLimitPerMinute);
  }

  /**
   * Format Brazilian phone number to international format
   * Accepts formats: 11999999999, 11 99999999, (11) 99999-9999
   * Returns: 5511999999999
   */
  private formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');

    // If it already has country code (55), just ensure it's correct format
    if (cleaned.startsWith('55')) {
      return cleaned;
    }

    // If it's 11 digits (Brazilian format without country code)
    if (cleaned.length === 11) {
      return `55${cleaned}`;
    }

    // If it's 10 digits (older format), add area code assumption
    if (cleaned.length === 10) {
      return `55${cleaned}`;
    }

    throw new Error(`Invalid Brazilian phone number format: ${phone}`);
  }

  /**
   * Send message via Z-API
   */
  private async sendViaZAPI(phone: string, message: string): Promise<boolean> {
    if (!this.config.zapiToken || !this.config.zapiInstance) {
      throw new Error('Z-API credentials not configured');
    }

    const formattedPhone = this.formatPhoneNumber(phone);

    try {
      const response = await fetch(
        `https://api.z-api.io/instances/${this.config.zapiInstance}/token/${this.config.zapiToken}/send-messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: formattedPhone,
            message: message,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`Z-API error: ${response.statusText} - ${JSON.stringify(error)}`);
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to send via Z-API: ${errorMessage}`);
    }
  }

  /**
   * Send message via WhatsApp Business API
   */
  private async sendViaWhatsAppBusiness(phone: string, message: string): Promise<boolean> {
    if (!this.config.businessAccessToken || !this.config.businessPhoneNumberId) {
      throw new Error('WhatsApp Business API credentials not configured');
    }

    const formattedPhone = this.formatPhoneNumber(phone);

    try {
      const response = await fetch(
        `https://graph.instagram.com/v18.0/${this.config.businessPhoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.config.businessAccessToken}`,
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: formattedPhone,
            type: 'text',
            text: {
              body: message,
            },
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          `WhatsApp Business API error: ${response.statusText} - ${JSON.stringify(error)}`,
        );
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to send via WhatsApp Business API: ${errorMessage}`);
    }
  }

  /**
   * Core method to send a WhatsApp message
   */
  async sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
    // Check rate limit
    const canSend = await this.rateLimiter.checkLimit();
    if (!canSend) {
      const retryAfter = this.rateLimiter.getRetryAfter();
      throw new Error(
        `Rate limit exceeded. Retry after ${retryAfter} seconds`,
      );
    }

    // Validate inputs
    if (!phone || typeof phone !== 'string') {
      throw new Error('Invalid phone number');
    }

    if (!message || typeof message !== 'string') {
      throw new Error('Invalid message');
    }

    if (message.length > 4096) {
      throw new Error('Message exceeds 4096 character limit');
    }

    // Send via configured provider with retry logic
    return retryWithBackoff(
      () => {
        if (this.config.provider === 'zapi') {
          return this.sendViaZAPI(phone, message);
        } else {
          return this.sendViaWhatsAppBusiness(phone, message);
        }
      },
      3, // max attempts
      1000, // base delay in ms
    );
  }

  /**
   * Send booking reminder notification
   */
  async sendBookingReminder(
    phone: string,
    bookingTitle: string,
    date: string,
    venue: string,
    time: string = '',
  ): Promise<boolean> {
    const message = MESSAGE_TEMPLATES.bookingReminder(bookingTitle, date, time, venue);
    return this.sendWhatsAppMessage(phone, message);
  }

  /**
   * Send match confirmation notification
   */
  async sendMatchConfirmation(phone: string, opponentName: string): Promise<boolean> {
    const message = MESSAGE_TEMPLATES.matchConfirmation(opponentName);
    return this.sendWhatsAppMessage(phone, message);
  }

  /**
   * Send match result notification
   */
  async sendMatchResult(phone: string, opponentName: string, score: string): Promise<boolean> {
    const message = MESSAGE_TEMPLATES.matchResult(opponentName, score);
    return this.sendWhatsAppMessage(phone, message);
  }

  /**
   * Send ranking update notification
   */
  async sendRankingUpdate(
    phone: string,
    newRating: number,
    change: number,
    position: number,
  ): Promise<boolean> {
    const message = MESSAGE_TEMPLATES.rankingUpdate(newRating, change, position);
    return this.sendWhatsAppMessage(phone, message);
  }

  /**
   * Send tournament notification
   */
  async sendTournamentNotification(
    phone: string,
    tournamentName: string,
    message: string,
  ): Promise<boolean> {
    const fullMessage = MESSAGE_TEMPLATES.tournamentNotification(tournamentName, message);
    return this.sendWhatsAppMessage(phone, fullMessage);
  }

  /**
   * Send custom message
   */
  async sendCustomMessage(phone: string, message: string): Promise<boolean> {
    return this.sendWhatsAppMessage(phone, message);
  }

  /**
   * Check if WhatsApp is properly configured
   */
  isConfigured(): boolean {
    if (this.config.provider === 'zapi') {
      return !!(this.config.zapiToken && this.config.zapiInstance);
    }
    return !!(this.config.businessAccessToken && this.config.businessPhoneNumberId);
  }

  /**
   * Get current configuration (for testing/debugging)
   */
  getConfig(): WhatsAppConfig {
    return { ...this.config };
  }
}

// Create singleton instance
export const whatsappService = new WhatsAppService();
