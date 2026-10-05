// src/lib/patientMood.js

import { assessVitals } from './vitals';

export const MOOD_LABELS = {
  pain: 'Con malestar',
  fever: 'Con fiebre',
  critical: 'Grave',
  relieved: 'Aliviado',
  neutral: 'Tranquilo',
  worried: 'Preocupado'
};

/**
 * Estado de ánimo del personaje según sus signos vitales,
 * o según el resultado del diagnóstico una vez enviado.
 * outcome: 'correct' | 'almost' | 'wrong' | undefined
 */
export function getPatientMood(caseData, outcome) {
  if (outcome === 'correct') return 'relieved';
  if (outcome === 'almost') return 'neutral';
  if (outcome === 'wrong') return 'worried';

  const { vitals } = caseData;
  const [sys] = String(vitals.bloodPressure).split('/').map(Number);
  const status = assessVitals(vitals);

  if (caseData.emergency || sys < 90 || vitals.oxygenSaturation < 92) return 'critical';
  if (status.temperature === 'high') return 'fever';
  return 'pain';
}
