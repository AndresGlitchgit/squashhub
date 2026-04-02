/**
 * Supabase authentication middleware helpers
 */

import type { Session, User } from '@supabase/supabase-js';

/**
 * Check if a user is authenticated
 */
export function isAuthenticated(user: User | null): user is User {
  return user !== null;
}

/**
 * Check if a user has a valid session
 */
export function hasValidSession(session: Session | null): session is Session {
  return session !== null;
}

/**
 * Check if a user is an email verified (optional)
 */
export function isEmailVerified(user: User | null): boolean {
  if (!user) return false;
  return user.email_confirmed_at !== null;
}

/**
 * Get user's full name from the metadata
 */
export function getUserFullName(user: User | null): string | null {
  if (!user) return null;

  const firstName = user.user_metadata?.first_name || '';
  const lastName = user.user_metadata?.last_name || '';

  return `${firstName} ${lastName}`.trim() || null;
}

/**
 * Get user's avatar URL from metadata
 */
export function getUserAvatarUrl(user: User | null): string | null {
  if (!user) return null;
  return user.user_metadata?.avatar_url || null;
}

/**
 * Check if user's account is new (created within X days)
 */
export function isNewAccount(user: User | null, daysThreshold: number = 7): boolean {
  if (!user?.created_at) return false;

  const createdDate = new Date(user.created_at);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays <= daysThreshold;
}

/**
 * Get auth error message in Portuguese
 */
export function getAuthErrorMessage(error: string | null): string {
  if (!error) return 'Ocorreu um erro desconhecido';

  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'Email ou senha inválidos',
    'Email not confirmed': 'Email não foi confirmado',
    'User already registered': 'Esse email já está registrado',
    'Password should be at least 6 characters': 'A senha deve ter no mínimo 6 caracteres',
    'Invalid email': 'Email inválido',
    'User not found': 'Usuário não encontrado',
    'User disabled': 'Usuário foi desabilitado',
    'Too many requests': 'Muitas tentativas. Tente novamente mais tarde',
  };

  return errorMap[error] || error;
}
