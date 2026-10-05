// src/lib/diagnosisMatcher.js

import { DIAGNOSIS_SYNONYMS } from './diagnosisSynonyms';

// Palabras que no aportan al diagnóstico
const STOPWORDS = new Set([
  'de', 'del', 'la', 'el', 'los', 'las', 'y', 'o', 'con', 'por', 'en', 'un', 'una',
  'al', 'a', 'tipo', 'cuadro', 'probable', 'posible', 'compatible', 'sospecha',
  'dx', 'diagnostico'
]);

// Modificadores que no son obligatorios para acertar
const OPTIONAL = new Set(['aguda', 'agudo', 'cronica', 'cronico', 'simple', 'leve']);

// Minúsculas, sin tildes ni signos de puntuación
export function normalizeText(text = '') {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function tokenize(text) {
  return normalizeText(text).split(' ').filter(Boolean);
}

// Palabras clave que el estudiante debe mencionar para una forma del diagnóstico
function keyTokens(text) {
  const tokens = tokenize(text).filter(t => !STOPWORDS.has(t));
  const keys = tokens.filter(t => !OPTIONAL.has(t));
  return keys.length ? keys : tokens;
}

function levenshtein(a, b) {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = curr;
  }
  return prev[b.length];
}

// Tolera faltas de ortografía en palabras largas (1 error; 2 en palabras de 10+ letras).
// Exige el mismo inicio porque muchos términos solo difieren al principio
// (artritis / uretritis / gastritis).
function tokenMatches(key, inputTokens) {
  return inputTokens.some(t => {
    if (t === key) return true;
    if (key.length < 5 || t.length < 4 || t.slice(0, 2) !== key.slice(0, 2)) return false;
    return levenshtein(t, key) <= (key.length >= 10 ? 2 : 1);
  });
}

// Todas las formas aceptadas de un diagnóstico, como listas de palabras clave
function variantsFor(label, extraAliases = []) {
  const forms = [
    ...label.split('/'),
    ...(DIAGNOSIS_SYNONYMS[label] ?? []),
    ...extraAliases
  ];
  const seen = new Set();
  return forms
    .map(keyTokens)
    .filter(keys => {
      const sig = keys.join(' ');
      if (!keys.length || seen.has(sig)) return false;
      seen.add(sig);
      return true;
    });
}

const signature = keys => [...keys].sort().join(' ');
const isSubset = (small, big) => small.every(k => big.includes(k));

/**
 * Interpreta el texto libre del estudiante.
 * Devuelve:
 *  - { status: 'match', diagnosis, exact }   diagnóstico del caso reconocido
 *  - { status: 'ambiguous', candidates }     menciona varios diagnósticos distintos
 *  - { status: 'none' }                      no corresponde a ninguna opción del caso
 */
export function matchDiagnosis(caseData, text, allLabels = []) {
  const inputTokens = tokenize(text);
  if (!inputTokens.length) return { status: 'none' };

  const caseAliases = Object.fromEntries(
    caseData.diagnoses.map(d => [d.label, d.aliases ?? []])
  );
  const labels = [...new Set([...caseData.diagnoses.map(d => d.label), ...allLabels])];

  // Para cada diagnóstico conocido, la forma más específica que encaja con el texto
  const hits = [];
  labels.forEach(label => {
    const matched = variantsFor(label, caseAliases[label])
      .filter(keys => keys.every(k => tokenMatches(k, inputTokens)))
      .sort((a, b) => b.length - a.length);
    if (matched.length) hits.push({ label, keys: matched[0] });
  });

  // Si una coincidencia está contenida en otra más específica, gana la específica
  // ("neumonía bacteriana con descompensación diabética" no es ambigua con "neumonía")
  const maximal = hits.filter(
    h => !hits.some(o => o.keys.length > h.keys.length && isSubset(h.keys, o.keys))
  );

  const concepts = [...new Set(maximal.map(h => signature(h.keys)))];
  if (concepts.length === 0) return { status: 'none' };
  if (concepts.length > 1) {
    return {
      status: 'ambiguous',
      candidates: concepts.map(sig => maximal.find(h => signature(h.keys) === sig).label)
    };
  }

  const winner = maximal.filter(h => signature(h.keys) === concepts[0]);
  let diagnosis = caseData.diagnoses.find(d => winner.some(h => h.label === d.label));

  // Respuesta más detallada que la opción del caso: cuenta si la incluye
  if (!diagnosis) {
    const covered = hits
      .filter(h => caseData.diagnoses.some(d => d.label === h.label))
      .filter(h => isSubset(h.keys, winner[0].keys))
      .sort((a, b) => b.keys.length - a.keys.length)[0];
    diagnosis = covered && caseData.diagnoses.find(d => d.label === covered.label);
  }

  if (!diagnosis) return { status: 'none' };
  return {
    status: 'match',
    diagnosis,
    exact: normalizeText(text) === normalizeText(diagnosis.label)
  };
}
