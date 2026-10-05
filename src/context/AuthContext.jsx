// src/context/AuthContext.jsx
//
// Inicio de sesión con Google (Firebase Auth) y guardado del progreso en Firestore,
// en el documento users/{uid}. Sin Firebase configurado, todo queda en modo local.

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { AuthContext } from './auth-context';
import { useGame } from './game-context';
import { auth, db, googleProvider, isFirebaseConfigured } from '../lib/firebase';
import { pickMostAdvanced, sanitizeProgress } from '../lib/progress';

const SAVE_DELAY_MS = 800;

const SIGN_IN_ERRORS = {
  'auth/popup-blocked':
    'El navegador bloqueó la ventana de Google. Permite las ventanas emergentes e inténtalo de nuevo.',
  'auth/unauthorized-domain':
    'Este dominio no está autorizado en Firebase (Authentication → Configuración → Dominios autorizados).',
  'auth/network-request-failed': 'Sin conexión. Revisa tu internet e inténtalo de nuevo.'
};

export function AuthProvider({ children }) {
  const { progress, replaceProgress, resetProgress } = useGame();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle');
  // true cuando ya se combinó el progreso local con el de la cuenta: a partir de ahí se guarda
  const [synced, setSynced] = useState(false);

  const progressRef = useRef(progress);
  useEffect(() => {
    progressRef.current = progress;
  });

  // Sesión de Firebase (se mantiene al recargar la página)
  useEffect(() => {
    if (!auth) return undefined;
    return onAuthStateChanged(auth, nextUser => {
      setUser(nextUser);
      setLoading(false);
    });
  }, []);

  // Al iniciar sesión: traer el progreso de la cuenta y quedarse con el más avanzado
  useEffect(() => {
    if (!user) return undefined;
    let cancelled = false;
    setSynced(false);
    setSyncStatus('loading');

    getDoc(doc(db, 'users', user.uid))
      .then(snap => {
        if (cancelled) return;
        const cloud = snap.exists() ? sanitizeProgress(snap.data()) : null;
        replaceProgress(pickMostAdvanced(progressRef.current, cloud));
        setSynced(true);
      })
      .catch(err => {
        if (cancelled) return;
        console.error('No se pudo cargar el progreso de la cuenta:', err);
        setSyncStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [user, replaceProgress]);

  // Guardar cada cambio de progreso en la cuenta (agrupando cambios seguidos)
  useEffect(() => {
    if (!user || !synced) return undefined;
    setSyncStatus('saving');
    const timer = setTimeout(() => {
      setDoc(doc(db, 'users', user.uid), {
        xp: progress.xp,
        casesResolved: progress.casesResolved,
        resolvedIds: progress.resolvedIds,
        seenRankIndex: progress.seenRankIndex,
        displayName: user.displayName ?? '',
        updatedAt: serverTimestamp()
      })
        .then(() => setSyncStatus('saved'))
        .catch(err => {
          console.error('No se pudo guardar el progreso:', err);
          setSyncStatus('error');
        });
    }, SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [progress, user, synced]);

  const signIn = useCallback(async () => {
    if (!auth) return;
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') return;
      console.error('Error al iniciar sesión:', err);
      setError(SIGN_IN_ERRORS[err.code] ?? 'No se pudo iniciar sesión. Inténtalo de nuevo.');
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!auth) return;
    // Primero se corta la sincronización para no subir un progreso vacío a la cuenta
    setSynced(false);
    setSyncStatus('idle');
    await firebaseSignOut(auth);
    // El progreso queda guardado en la cuenta; se limpia este dispositivo
    resetProgress();
  }, [resetProgress]);

  const value = useMemo(
    () => ({
      configured: isFirebaseConfigured,
      user,
      loading,
      error,
      syncStatus,
      signIn,
      signOut,
      clearError: () => setError(null)
    }),
    [user, loading, error, syncStatus, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
