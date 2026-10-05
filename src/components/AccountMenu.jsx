// src/components/AccountMenu.jsx

import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { AlertTriangle, Cloud, CloudOff, Loader2, LogOut, X } from 'lucide-react';
import Button from './Button';
import { useAuth } from '../context/auth-context';

function GoogleLogo({ className }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

const syncLabels = {
  idle:    { Icon: Cloud,    text: 'Conectado',               tone: 'text-slate-500' },
  loading: { Icon: Loader2,  text: 'Cargando tu progreso…',   tone: 'text-slate-500', spin: true },
  saving:  { Icon: Loader2,  text: 'Guardando…',              tone: 'text-slate-500', spin: true },
  saved:   { Icon: Cloud,    text: 'Progreso guardado en tu cuenta', tone: 'text-emerald-600' },
  error:   { Icon: CloudOff, text: 'No se pudo sincronizar; se guarda en este dispositivo', tone: 'text-rose-600' }
};

export default function AccountMenu() {
  const { configured, user, loading, error, syncStatus, signIn, signOut, clearError } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Cerrar el menú al hacer clic fuera o pulsar Escape
  useEffect(() => {
    if (!open) return undefined;
    const onClick = e => {
      if (!menuRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = e => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Sin Firebase configurado la app funciona en modo local, sin botón de cuenta
  if (!configured) return null;

  if (loading) {
    return <div className="size-9 animate-pulse rounded-full bg-slate-200" aria-label="Comprobando sesión" />;
  }

  const errorToast = error && (
    <div
      role="alert"
      className="fixed inset-x-4 top-20 z-50 mx-auto flex max-w-md animate-fade-in items-start gap-2 rounded-2xl border border-rose-200 bg-white p-4 text-sm text-rose-800 shadow-lg"
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p className="flex-1">{error}</p>
      <button type="button" onClick={clearError} aria-label="Cerrar aviso" className="text-rose-500 hover:text-rose-700">
        <X className="size-4" />
      </button>
    </div>
  );

  if (!user) {
    return (
      <>
        <Button variant="secondary" size="sm" onClick={signIn} aria-label="Continuar con Google" className="px-2.5 min-[380px]:px-3">
          <GoogleLogo className="size-4" />
          <span className="hidden sm:inline">Continuar con Google</span>
          <span className="hidden min-[380px]:inline sm:hidden">Entrar</span>
        </Button>
        {errorToast}
      </>
    );
  }

  const sync = syncLabels[syncStatus];
  const initial = (user.displayName || user.email || '?')[0].toUpperCase();

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Cuenta de ${user.displayName ?? user.email}`}
        className="relative flex size-9 items-center justify-center overflow-hidden rounded-full bg-brand-100 font-semibold text-brand-700 ring-2 ring-white transition hover:ring-brand-200"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="size-full object-cover" />
        ) : (
          initial
        )}
        {syncStatus === 'error' && (
          <span className="absolute right-0 bottom-0 size-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-72 animate-fade-in rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
        >
          <div className="px-3 py-2">
            <p className="truncate font-semibold text-slate-900">{user.displayName}</p>
            <p className="truncate text-sm text-slate-500">{user.email}</p>
            <p className={clsx('mt-2 flex items-center gap-1.5 text-xs', sync.tone)}>
              <sync.Icon className={clsx('size-3.5 shrink-0', sync.spin && 'animate-spin')} aria-hidden="true" />
              {sync.text}
            </p>
          </div>
          <div className="my-1 border-t border-slate-100" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              signOut();
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
