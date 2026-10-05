// src/context/EmergencyContext.jsx

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { EmergencyContext } from './emergency-context';
import useCases from '../hooks/useCases';
import { useGame } from './game-context';
import {
  acceptEmergency,
  declineEmergency,
  initialEmergencyState,
  tickEmergency
} from '../lib/emergency';

const STORAGE_KEY = 'medSimEmergency';

// Se guarda en localStorage para que recargar la página no reinicie los relojes
function loadState() {
  const now = Date.now();
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved.nextSpawnAt === 'number') {
      return { ...initialEmergencyState(now), ...saved, missed: null };
    }
  } catch {
    // datos corruptos: empezar de cero
  }
  return initialEmergencyState(now);
}

export function EmergencyProvider({ children }) {
  const { cases } = useCases();
  const { resolvedIds } = useGame();
  const [state, setState] = useState(loadState);
  const [now, setNow] = useState(() => Date.now());

  const emergencyIds = useMemo(
    () => cases.filter(c => c.emergency).map(c => c.id),
    [cases]
  );

  // El intervalo lee siempre los datos más recientes sin reiniciarse
  const inputs = useRef({ emergencyIds, resolvedIds });
  useEffect(() => {
    inputs.current = { emergencyIds, resolvedIds };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const t = Date.now();
      setNow(t);
      setState(prev =>
        tickEmergency(prev, {
          now: t,
          availableIds: inputs.current.emergencyIds,
          resolvedIds: inputs.current.resolvedIds
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      const { pending, active, nextSpawnAt } = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ pending, active, nextSpawnAt }));
    } catch {
      // sin almacenamiento: las emergencias funcionan igual durante la sesión
    }
  }, [state]);

  const accept = useCallback(() => setState(prev => acceptEmergency(prev, Date.now())), []);
  const decline = useCallback(() => setState(prev => declineEmergency(prev, Date.now())), []);

  const value = useMemo(
    () => ({
      pending: state.pending,
      active: state.active,
      missed: state.missed,
      now,
      accept,
      decline
    }),
    [state, now, accept, decline]
  );

  return <EmergencyContext.Provider value={value}>{children}</EmergencyContext.Provider>;
}
