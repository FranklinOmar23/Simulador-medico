// src/lib/ranks.js

// Casos correctos necesarios para alcanzar cada rango
export const RANKS = [
  { rank: 'Estudiante de Medicina', threshold: 0 },
  { rank: 'Interno Clínico',        threshold: 3 },
  { rank: 'Médico General',         threshold: 6 },
  { rank: 'Residente',              threshold: 10 },
  { rank: 'Especialista',           threshold: 15 },
  { rank: 'Profesor Clínico',       threshold: 21 }
];

export function getRankIndex(casesResolved) {
  let index = 0;
  RANKS.forEach((r, i) => {
    if (casesResolved >= r.threshold) index = i;
  });
  return index;
}

export function getRankProgress(casesResolved) {
  const index = getRankIndex(casesResolved);
  const current = RANKS[index];
  const next = RANKS[index + 1] ?? null;

  // Progreso dentro del tramo del rango actual
  const pct = next
    ? Math.min(
        ((casesResolved - current.threshold) / (next.threshold - current.threshold)) * 100,
        100
      )
    : 100;

  return { index, current, next, pct };
}
