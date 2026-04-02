import React from 'react';

type CardVariant = 'default' | 'highlighted' | 'accent';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hover?: boolean;
}

export function Card({
  variant = 'default',
  hover = false,
  className = '',
  children,
  ...props
}: CardProps) {
  const baseStyles = 'bg-[#161616] border border-[#1f1f1f] rounded-2xl p-4';

  const variantStyles: Record<CardVariant, string> = {
    default: '',
    highlighted: 'border-[#10B981] shadow-lg shadow-[#10B981]/20',
    accent: 'border-[#FBBF24] shadow-lg shadow-[#FBBF24]/10',
  };

  const hoverStyles = hover ? 'hover:shadow-lg hover:shadow-[#10B981]/10 transition-all' : '';

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
