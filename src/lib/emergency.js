// src/lib/emergency.js

// Tiempos de las emergencias (en segundos)
export const EMERGENCY = {
  acceptWindowSec: 90,      // tiempo para aceptar la alerta antes de que desaparezca
  timeSec: 150,             // tiempo para resolver la emergencia una vez aceptada
  firstSpawnSec: [30, 60],  // la primera llega entre 30 y 60 s después de abrir la app
  nextSpawnSec: [120, 240], // las siguientes, entre 2 y 4 min después de la anterior
  abandonAfterSec: 300      // una emergencia aceptada y sin resolver se descarta pasado este margen
};

export const randomDelayMs = ([min, max]) => Math.round((min + Math.random() * (max - min)) * 1000);

export function initialEmergencyState(now) {
  return {
    pending: null,   // { caseId, expiresAt }: alerta esperando respuesta
    active: null,    // { caseId, deadline }: emergencia aceptada en curso
    missed: null,    // { caseId, at }: última alerta que expiró (para avisar)
    nextSpawnAt: now + randomDelayMs(EMERGENCY.firstSpawnSec)
  };
}

/**
 * Avanza el estado de las emergencias en el instante `now`.
 * availableIds: ids de casos de emergencia; resolvedIds: casos ya completados.
 */
export function tickEmergency(state, { now, availableIds, resolvedIds }) {
  let s = state;
  const scheduleNext = () => now + randomDelayMs(EMERGENCY.nextSpawnSec);

  // Emergencia en curso resuelta (o abandonada): programar la siguiente
  if (
    s.active &&
    (resolvedIds.includes(s.active.caseId) ||
      now > s.active.deadline + EMERGENCY.abandonAfterSec * 1000)
  ) {
    s = { ...s, active: null, nextSpawnAt: scheduleNext() };
  }

  // Alerta sin respuesta: otro equipo atiende al paciente
  if (s.pending && now >= s.pending.expiresAt) {
    s = {
      ...s,
      pending: null,
      missed: { caseId: s.pending.caseId, at: now },
      nextSpawnAt: scheduleNext()
    };
  }

  // Nueva alerta si no hay ninguna en marcha
  if (!s.pending && !s.active && now >= s.nextSpawnAt) {
    const candidates = availableIds.filter(id => !resolvedIds.includes(id));
    if (candidates.length) {
      const caseId = candidates[Math.floor(Math.random() * candidates.length)];
      s = { ...s, pending: { caseId, expiresAt: now + EMERGENCY.acceptWindowSec * 1000 } };
    }
  }

  return s;
}

export function acceptEmergency(state, now) {
  if (!state.pending) return state;
  return {
    ...state,
    pending: null,
    active: { caseId: state.pending.caseId, deadline: now + EMERGENCY.timeSec * 1000 }
  };
}

export function declineEmergency(state, now) {
  if (!state.pending) return state;
  return { ...state, pending: null, nextSpawnAt: now + randomDelayMs(EMERGENCY.nextSpawnSec) };
}

export const formatClock = secs => {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
};
