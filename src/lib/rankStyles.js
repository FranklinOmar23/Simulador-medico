// src/lib/rankStyles.js

// Color de acento de cada rango
const RANK_STYLES = {
  'Estudiante de Medicina': { text: 'text-sky-700',     icon: 'bg-sky-100 text-sky-700',         bar: 'bg-sky-500' },
  'Interno Clínico':        { text: 'text-brand-700',   icon: 'bg-brand-100 text-brand-700',     bar: 'bg-brand-500' },
  'Médico General':         { text: 'text-emerald-700', icon: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500' },
  'Residente':              { text: 'text-amber-700',   icon: 'bg-amber-100 text-amber-800',     bar: 'bg-amber-500' },
  'Especialista':           { text: 'text-rose-700',    icon: 'bg-rose-100 text-rose-700',       bar: 'bg-rose-500' },
  'Profesor Clínico':       { text: 'text-violet-700',  icon: 'bg-violet-100 text-violet-700',   bar: 'bg-violet-500' }
};

export function getRankStyle(rank) {
  return RANK_STYLES[rank] ?? RANK_STYLES['Estudiante de Medicina'];
}
