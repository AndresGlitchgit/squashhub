'use client';

import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: 'default' | 'error';
}

export function Input({
  label,
  error,
  variant = 'default',
  className = '',
  ...props
}: InputProps) {
  const baseStyles =
    'w-full px-4 py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500';

  const variantStyles =
    variant === 'error'
      ? 'bg-gray-800 border border-red-500 text-text-primary placeholder:text-text-tertiary'
      : 'bg-gray-800 border border-gray-700 text-text-primary placeholder:text-text-tertiary hover:border-gray-600 focus:border-emerald-500';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-2">
          {label}
        </label>
      )}
      <input
        className={`${baseStyles} ${variantStyles} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}
