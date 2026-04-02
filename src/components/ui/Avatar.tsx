import React from 'react';

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  initial?: string;
  imageUrl?: string;
  size?: AvatarSize;
  showOnlineIndicator?: boolean;
  isOnline?: boolean;
  className?: string;
}

export function Avatar({
  initial = '?',
  imageUrl,
  size = 'md',
  showOnlineIndicator = false,
  isOnline = false,
  className = '',
}: AvatarProps) {
  const sizeStyles: Record<AvatarSize, string> = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
  };

  const indicatorSize: Record<AvatarSize, string> = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  const containerSize: Record<AvatarSize, string> = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  return (
    <div className={`relative ${containerSize[size]}`}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Avatar"
          className={`${containerSize[size]} rounded-full object-cover ${className}`}
        />
      ) : (
        <div
          className={`${sizeStyles[size]} ${containerSize[size]} rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center text-white font-semibold ${className}`}
        >
          {initial.toUpperCase()}
        </div>
      )}

      {showOnlineIndicator && (
        <div
          className={`absolute bottom-0 right-0 ${indicatorSize[size]} rounded-full ${
            isOnline ? 'bg-[#10B981]' : 'bg-[#666]'
          } border 2 border-[#161616]`}
        />
      )}
    </div>
  );
}
