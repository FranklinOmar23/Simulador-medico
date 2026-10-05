// src/lib/progress.js

import { getRankIndex } from './ranks';

export const EMPTY_PROGRESS = { xp: 0, casesResolved: 0, resolvedIds: [], seenRankIndex: 0 };

// Normaliza progreso venido de localStorage o de la nube (datos antiguos o manipulados)
export function sanitizeProgress(saved) {
  if (!saved || typeof saved !== 'object') return { ...EMPTY_PROGRESS };

  const resolvedIds = Array.isArray(saved.resolvedIds)
    ? [...new Set(saved.resolvedIds.filter(id => typeof id === 'string' || typeof id === 'number'))]
    : [];
  const casesResolved = Math.max(0, Math.floor(Number(saved.casesResolved) || 0));
  const seenRankIndex = Number.isInteger(saved.seenRankIndex)
    ? saved.seenRankIndex
    : getRankIndex(casesResolved);

  return {
    xp: Math.max(0, Math.floor(Number(saved.xp) || 0)),
    casesResolved,
    resolvedIds,
    seenRankIndex
  };
}

// Al iniciar sesión se conserva el progreso más avanzado (más casos atendidos y, a igualdad, más XP)
export function pickMostAdvanced(local, cloud) {
  if (!cloud) return local;
  if (local.resolvedIds.length !== cloud.resolvedIds.length) {
    return local.resolvedIds.length > cloud.resolvedIds.length ? local : cloud;
  }
  return local.xp > cloud.xp ? local : cloud;
}
