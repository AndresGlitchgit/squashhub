'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';

interface ToastData {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback(
    (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
      const id = Math.random().toString(36).substr(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoadingGoogle(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('Google sign-in error:', error);
        addToast('Erro ao fazer login com Google. Tente novamente.', 'error');
      }
    } catch (err) {
      console.error('Google sign-in exception:', err);
      addToast('Erro inesperado ao fazer login com Google.', 'error');
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Read directly from the form to handle browser autofill
    const formData = new FormData(e.currentTarget);
    const currentEmail = (formData.get('email') as string) || email;
    const currentPassword = (formData.get('password') as string) || password;

    // Sync state if autofill filled values without onChange
    if (currentEmail !== email) setEmail(currentEmail);
    if (currentPassword !== password) setPassword(currentPassword);

    if (!currentEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentEmail)) {
      addToast('Por favor, insira um e-mail válido.', 'error');
      return;
    }

    if (!currentPassword || currentPassword.length < 6) {
      addToast('A senha deve ter pelo menos 6 caracteres.', 'error');
      return;
    }

    try {
      setIsLoading(true);

      if (isSignUp) {
        // Sign up with email + password
        const { data, error } = await supabase.auth.signUp({
          email: currentEmail,
          password: currentPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) {
          console.error('Signup error:', error);
          if (error.message.includes('already registered')) {
            addToast('Este email já está cadastrado. Tente fazer login.', 'error');
          } else {
            addToast(error.message || 'Erro ao criar conta.', 'error');
          }
          return;
        }

        // If email confirmation is required
        if (data.user && !data.session) {
          addToast('Conta criada! Verifique seu email para confirmar.', 'success');
          return;
        }

        // If auto-confirmed (no email confirmation needed)
        if (data.session) {
          addToast('Conta criada com sucesso!', 'success');
          window.location.href = '/';
        }
      } else {
        // Sign in with email + password
        const { data, error } = await supabase.auth.signInWithPassword({
          email: currentEmail,
          password: currentPassword,
        });

        if (error) {
          console.error('Login error:', error);
          if (error.message.includes('Invalid login credentials')) {
            addToast('Email ou senha incorretos.', 'error');
          } else {
            addToast(error.message || 'Erro ao fazer login.', 'error');
          }
          return;
        }

        if (data.session) {
          addToast('Login realizado com sucesso!', 'success');
          window.location.href = '/';
        }
      }
    } catch (err) {
      console.error('Auth exception:', err);
      addToast('Erro inesperado. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Logo and Branding */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="text-6xl">🎾</div>
        </div>
        <h1 className="text-3xl font-bold text-white">SquashHub</h1>
        <p className="text-gray-400">Seu hub social de squash</p>
      </div>

      {/* Welcome Message */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-white">
          {isSignUp ? 'Crie sua conta' : 'Bem-vindo de volta'}
        </h2>
        <p className="text-sm text-gray-400">
          {isSignUp
            ? 'Cadastre-se para encontrar parceiros e jogar squash'
            : 'Encontre parceiros, reserve quadras e participe de torneios'}
        </p>
      </div>

      {/* Google OAuth Button */}
      <Button
        variant="secondary"
        size="md"
        onClick={handleGoogleSignIn}
        isLoading={isLoadingGoogle}
        disabled={isLoadingGoogle || isLoading}
        className="w-full flex items-center justify-center gap-3"
      >
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continuar com Google
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-700" />
        <span className="text-sm text-gray-400">OU</span>
        <div className="flex-1 h-px bg-gray-700" />
      </div>

      {/* Email + Password Form */}
      <form onSubmit={handleEmailAuth} className="space-y-4">
        <Input
          type="email"
          name="email"
          label="E-mail"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading || isLoadingGoogle}
          autoComplete="email"
          required
        />
        <Input
          type="password"
          name="password"
          label="Senha"
          placeholder={isSignUp ? 'Mínimo 6 caracteres' : 'Sua senha'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading || isLoadingGoogle}
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          required
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isLoading}
          disabled={isLoading || isLoadingGoogle}
          className="w-full"
        >
          {isSignUp ? 'Criar conta' : 'Entrar'}
        </Button>
      </form>

      {/* Toggle Sign Up / Sign In */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm text-emerald-400 hover:underline"
        >
          {isSignUp
            ? 'Já tem uma conta? Faça login'
            : 'Não tem conta? Cadastre-se'}
        </button>
      </div>

      {/* Terms and Privacy */}
      <p className="text-xs text-center text-gray-500">
        Ao continuar, você concorda com nossos{' '}
        <a href="/terms" className="text-emerald-400 hover:underline">
          Termos de Serviço
        </a>{' '}
        e{' '}
        <a href="/privacy" className="text-emerald-400 hover:underline">
          Política de Privacidade
        </a>
      </p>

      {/* Toast Container */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50 p-4 space-y-2 max-w-sm w-full">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}
