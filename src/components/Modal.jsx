// src/components/Modal.jsx

import React, { useEffect } from 'react';
import clsx from 'clsx';

export default function Modal({ open, onClose, labelledBy, className, children }) {
  // Cerrar con Escape
  useEffect(() => {
    if (!open) return undefined;
    const onKey = e => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-slate-900/50 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={clsx(
          'relative w-full max-w-sm animate-pop rounded-3xl bg-white p-6 shadow-xl',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
