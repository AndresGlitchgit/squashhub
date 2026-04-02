import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export function Badge({
  variant = 'neutral',
  children,
  className = '',
  ...props
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    success: 'bg-green-900/30 text-[#10B981]',
    warning: 'bg-yellow-900/30 text-[#FBBF24]',
    danger: 'bg-red-900/30 text-red-400',
    neutral: 'bg-[#1f1f1f] text-[#999]',
    info: 'bg-blue-900/30 text-blue-400',
  };

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
