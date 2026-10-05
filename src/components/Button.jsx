// src/components/Button.jsx

import React from 'react';
import clsx from 'clsx';

const variants = {
  primary:   'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800',
  secondary: 'bg-white text-slate-700 border border-slate-300 shadow-xs hover:bg-slate-50 hover:border-slate-400',
  ghost:     'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  danger:    'bg-rose-600 text-white shadow-sm hover:bg-rose-700 active:bg-rose-800'
};

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base'
};

// as={Link} permite usarlo como enlace con el mismo estilo
export default function Button({
  variant = 'primary',
  size = 'md',
  as: Component = 'button',
  className,
  ...props
}) {
  return (
    <Component
      {...(Component === 'button' && { type: 'button' })}
      className={clsx(
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-medium whitespace-nowrap transition-colors',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
