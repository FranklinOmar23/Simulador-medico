// src/lib/diagnosisSynonyms.js

// Formas alternativas aceptadas para cada diagnóstico (clave = etiqueta del JSON).
// Mayúsculas, tildes, "agudo/crónico/simple/leve" y pequeñas faltas de ortografía
// ya se toleran automáticamente; aquí solo van sinónimos con palabras distintas.
// Un caso también puede añadir sinónimos propios con "aliases": [...] en cada diagnóstico.
export const DIAGNOSIS_SYNONYMS = {
  'Neumonía': ['Pulmonía', 'NAC', 'Infección pulmonar', 'Infección respiratoria baja'],
  'Sinusitis': ['Rinosinusitis'],
  'Hiperglucemia': ['Hiperglicemia', 'Glucosa alta', 'Azúcar alta', 'Diabetes descompensada'],
  'Deshidratación': ['Hipovolemia', 'Depleción de volumen'],
  'Migraña': ['Jaqueca', 'Cefalea migrañosa'],
  'Infección bacteriana': ['Infección por bacterias'],
  'Infección viral': ['Infección vírica', 'Virosis', 'Infección por virus', 'Cuadro viral'],
  'Pielonefritis aguda': ['Infección renal'],
  'Pielonefritis': ['Infección renal'],
  'Urosepsis': ['Sepsis urinaria', 'Sepsis de origen urinario'],
  'Vértigo posicional paroxístico benigno': ['VPPB', 'Vértigo posicional'],
  'Arritmia cardíaca': ['Arritmia'],
  'Mononucleosis infecciosa': ['Mononucleosis', 'Enfermedad del beso'],
  'Faringitis estreptocócica crónica': ['Faringitis estreptocócica', 'Faringoamigdalitis estreptocócica'],
  'Osteoartritis': ['Artrosis']
};
