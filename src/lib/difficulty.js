// src/lib/difficulty.js

import { CheckCircle2, HelpCircle, AlertTriangle } from 'lucide-react';

export const DIFFICULTIES = {
  fácil: {
    label: 'Fácil',
    description: 'Casos básicos y comunes',
    timeSec: 90,
    styles: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    Icon: CheckCircle2
  },
  normal: {
    label: 'Normal',
    description: 'Síntomas más difusos',
    timeSec: 150,
    styles: 'bg-amber-50 text-amber-800 ring-amber-600/20',
    Icon: HelpCircle
  },
  difícil: {
    label: 'Difícil',
    description: 'Casos complejos',
    timeSec: 240,
    styles: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    Icon: AlertTriangle
  }
};

export function getDifficulty(difficulty) {
  return DIFFICULTIES[difficulty] ?? DIFFICULTIES['fácil'];
}
