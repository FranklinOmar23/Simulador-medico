// src/lib/vitals.js

// Clasifica cada signo vital del adulto como 'low' | 'normal' | 'high'.
// Frecuencia respiratoria y saturación son opcionales (casos antiguos no las traen).
export function assessVitals({
  temperature,
  bloodPressure,
  heartRate,
  respiratoryRate,
  oxygenSaturation
}) {
  const [sys, dia] = String(bloodPressure).split('/').map(Number);

  return {
    temperature: temperature >= 38 ? 'high' : temperature < 35.5 ? 'low' : 'normal',
    bloodPressure:
      sys >= 140 || dia >= 90 ? 'high' : sys < 90 || dia < 60 ? 'low' : 'normal',
    heartRate: heartRate > 100 ? 'high' : heartRate < 60 ? 'low' : 'normal',
    respiratoryRate:
      respiratoryRate === undefined
        ? undefined
        : respiratoryRate > 20 ? 'high' : respiratoryRate < 12 ? 'low' : 'normal',
    oxygenSaturation:
      oxygenSaturation === undefined ? undefined : oxygenSaturation < 95 ? 'low' : 'normal'
  };
}
