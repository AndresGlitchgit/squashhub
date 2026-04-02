'use client';

import type { InputHTMLAttributes } from 'react';

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export function Toggle({
  label,
  description,
  checked = false,
  className = '',
  ...props
}: ToggleProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {label && (
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              {label}
            </label>
            {description && (
              <p className="text-xs text-text-tertiary">{description}</p>
            )}
          </div>
        )}
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={(e) => {
            const input = e.currentTarget.querySelector('input');
            if (input) {
              input.checked = !input.checked;
              input.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }}
          className={`
            relative inline-flex h-6 w-11 flex-shrink-0 rounded-full
            transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900
            ${checked ? 'bg-emerald-600' : 'bg-gray-700'}
          `}
        >
          <span
            className={`
              inline-block h-5 w-5 transform rounded-full bg-white
              transition-transform
              ${checked ? 'translate-x-5' : 'translate-x-0.5'}
            `}
          />
          <input
            type="checkbox"
            checked={checked}
            className="sr-only"
            {...props}
          />
        </button>
      </div>
    </div>
  );
}
