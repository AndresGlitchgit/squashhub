'use client';

import { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
  duration?: number;
}

const typeStyles = {
  success: {
    bg: 'bg-green-900/20',
    border: 'border-green-500',
    icon: '✓',
    iconColor: 'text-green-400',
    textColor: 'text-green-100',
  },
  error: {
    bg: 'bg-red-900/20',
    border: 'border-red-500',
    icon: '✕',
    iconColor: 'text-red-400',
    textColor: 'text-red-100',
  },
  warning: {
    bg: 'bg-yellow-900/20',
    border: 'border-yellow-500',
    icon: '!',
    iconColor: 'text-yellow-400',
    textColor: 'text-yellow-100',
  },
  info: {
    bg: 'bg-blue-900/20',
    border: 'border-blue-500',
    icon: 'ⓘ',
    iconColor: 'text-blue-400',
    textColor: 'text-blue-100',
  },
};

export function Toast({
  message,
  type = 'info',
  onClose,
  duration = 5000,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const styles = typeStyles[type];

  return (
    <div
      className={`
        fixed bottom-4 left-1/2 transform -translate-x-1/2
        ${styles.bg} border ${styles.border}
        rounded-lg px-4 py-3 flex items-center gap-3
        animate-fade-in z-50
        max-w-sm mx-auto
      `}
    >
      <span className={`font-bold text-lg ${styles.iconColor}`}>
        {styles.icon}
      </span>
      <p className={`text-sm ${styles.textColor}`}>{message}</p>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Array<ToastProps & { id: string }>;
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50 p-4 space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
}
