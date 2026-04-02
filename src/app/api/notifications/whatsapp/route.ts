/**
 * API route for sending WhatsApp notifications
 * POST /api/notifications/whatsapp
 */

import { NextRequest, NextResponse } from 'next/server';
import { whatsappService } from '@/lib/whatsapp';

// Request body validation schema
interface SendWhatsAppRequest {
  phone: string;
  message: string;
  type?: 'generic' | 'booking' | 'match' | 'ranking' | 'tournament';
  metadata?: Record<string, string | number>;
}

// Error response type
interface ErrorResponse {
  error: string;
  status: number;
  message: string;
}

// Success response type
interface SuccessResponse {
  success: boolean;
  message: string;
  phone: string;
  timestamp: string;
}

/**
 * Validate phone number format
 */
function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required' };
  }

  const cleaned = phone.replace(/\D/g, '');

  // Accept both 10/11 digit Brazilian numbers and international format with 55
  if (cleaned.length === 10 || cleaned.length === 11) {
    return { valid: true };
  }

  if (cleaned.startsWith('55') && (cleaned.length === 12 || cleaned.length === 13)) {
    return { valid: true };
  }

  return {
    valid: false,
    error: 'Invalid Brazilian phone number format',
  };
}

/**
 * Validate message content
 */
function validateMessage(message: string): { valid: boolean; error?: string } {
  if (!message || typeof message !== 'string') {
    return { valid: false, error: 'Message is required' };
  }

  if (message.trim().length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  if (message.length > 4096) {
    return { valid: false, error: 'Message exceeds 4096 character limit' };
  }

  return { valid: true };
}

/**
 * Handle POST request to send WhatsApp message
 */
export async function POST(request: NextRequest): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    // Check if service is configured
    if (!whatsappService.isConfigured()) {
      return NextResponse.json(
        {
          error: 'SERVICE_NOT_CONFIGURED',
          status: 503,
          message: 'WhatsApp service is not properly configured',
        },
        { status: 503 },
      );
    }

    // Parse request body
    let body: SendWhatsAppRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: 'INVALID_JSON',
          status: 400,
          message: 'Invalid JSON in request body',
        },
        { status: 400 },
      );
    }

    // Validate phone number
    const phoneValidation = validatePhone(body.phone);
    if (!phoneValidation.valid) {
      return NextResponse.json(
        {
          error: 'INVALID_PHONE',
          status: 400,
          message: phoneValidation.error || 'Invalid phone number',
        },
        { status: 400 },
      );
    }

    // Validate message
    const messageValidation = validateMessage(body.message);
    if (!messageValidation.valid) {
      return NextResponse.json(
        {
          error: 'INVALID_MESSAGE',
          status: 400,
          message: messageValidation.error || 'Invalid message',
        },
        { status: 400 },
      );
    }

    // Send the message
    const success = await whatsappService.sendWhatsAppMessage(body.phone, body.message);

    if (!success) {
      return NextResponse.json(
        {
          error: 'SEND_FAILED',
          status: 500,
          message: 'Failed to send WhatsApp message',
        },
        { status: 500 },
      );
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'WhatsApp message sent successfully',
        phone: body.phone,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Check for rate limit error
    if (errorMessage.includes('Rate limit')) {
      return NextResponse.json(
        {
          error: 'RATE_LIMITED',
          status: 429,
          message: errorMessage,
        },
        { status: 429 },
      );
    }

    // Log the error
    console.error('WhatsApp API error:', error);

    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        status: 500,
        message: 'An error occurred while processing your request',
      },
      { status: 500 },
    );
  }
}

/**
 * Handle other HTTP methods
 */
export async function GET(): Promise<NextResponse<ErrorResponse>> {
  return NextResponse.json(
    {
      error: 'METHOD_NOT_ALLOWED',
      status: 405,
      message: 'Use POST to send WhatsApp messages',
    },
    { status: 405 },
  );
}

export async function PUT(): Promise<NextResponse<ErrorResponse>> {
  return NextResponse.json(
    {
      error: 'METHOD_NOT_ALLOWED',
      status: 405,
      message: 'Use POST to send WhatsApp messages',
    },
    { status: 405 },
  );
}

export async function DELETE(): Promise<NextResponse<ErrorResponse>> {
  return NextResponse.json(
    {
      error: 'METHOD_NOT_ALLOWED',
      status: 405,
      message: 'Use POST to send WhatsApp messages',
    },
    { status: 405 },
  );
}
