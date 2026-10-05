// src/lib/diagnosisSearch.js
//
// Búsqueda de diagnósticos para las sugerencias del formulario:
// sin importar tildes ni mayúsculas, y también por sinónimos.

import { DIAGNOSIS_SYNONYMS } from './diagnosisSynonyms';
import { matchDiagnosis } from './diagnosisMatcher';

export const OPTIONS_PER_CASE = 6;

// Generador pseudoaleatorio con semilla: el mismo caso siempre da las mismas opciones y orden
function seededRandom(seedText) {
  let seed = [...seedText].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 2166136261);
  return () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(items, random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Opciones del caso: sus diagnósticos (correcto + diferenciales) más distractores
 * hasta llegar a `count`, priorizando diagnósticos de la misma especialidad.
 * Un distractor nunca puede ser un sinónimo de un diagnóstico del caso.
 */
export function buildCaseOptions(caseData, cases, count = OPTIONS_PER_CASE) {
  const allOptions = buildDiagnosisOptions(cases);
  const byLabel = new Map(allOptions.map(o => [o.label, o]));
  const random = seededRandom(String(caseData.id));

  const own = caseData.diagnoses.map(d => byLabel.get(d.label) ?? { label: d.label, aliases: d.aliases ?? [] });
  const ownLabels = new Set(own.map(o => o.label));

  const sameSpecialty = new Set(
    cases
      .filter(c => c.id !== caseData.id && c.specialty === caseData.specialty)
      .flatMap(c => c.diagnoses.map(d => d.label))
  );

  const candidates = allOptions.filter(
    o => !ownLabels.has(o.label) && matchDiagnosis(caseData, o.label).status === 'none'
  );
  const preferred = shuffle(candidates.filter(o => sameSpecialty.has(o.label)), random);
  const others = shuffle(candidates.filter(o => !sameSpecialty.has(o.label)), random);

  const distractors = [...preferred, ...others].slice(0, Math.max(0, count - own.length));
  return shuffle([...own, ...distractors], random);
}

// Pliega carácter a carácter (misma longitud que el original) para poder resaltar coincidencias
export function fold(text = '') {
  return [...text]
    .map(ch => {
      const base = ch.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
      return base.length === 1 ? base : ch.toLowerCase();
    })
    .join('');
}

// Todas las etiquetas del simulador con sus sinónimos (del caso y del diccionario global)
export function buildDiagnosisOptions(cases) {
  const byLabel = new Map();
  cases.forEach(c =>
    c.diagnoses.forEach(d => {
      const aliases = byLabel.get(d.label) ?? new Set(DIAGNOSIS_SYNONYMS[d.label] ?? []);
      (d.aliases ?? []).forEach(a => aliases.add(a));
      byLabel.set(d.label, aliases);
    })
  );
  return [...byLabel.entries()]
    .map(([label, aliases]) => ({ label, aliases: [...aliases] }))
    .sort((a, b) => a.label.localeCompare(b.label, 'es'));
}

/**
 * Filtra y ordena las opciones según lo escrito.
 * Devuelve [{ label, matchedAlias }]: matchedAlias indica el sinónimo que coincidió.
 */
export function filterDiagnosisOptions(options, query) {
  const q = fold(query.trim()).replace(/\s+/g, ' ');
  if (!q) return options.map(o => ({ label: o.label, matchedAlias: null }));

  const words = q.split(' ');
  const matches = text => {
    const t = fold(text);
    return t.includes(q) || words.every(w => t.split(/[^a-z0-9]+/).some(token => token.startsWith(w)));
  };

  const scored = [];
  options.forEach(o => {
    const label = fold(o.label);
    if (label.startsWith(q)) scored.push({ label: o.label, matchedAlias: null, score: 0 });
    else if (matches(o.label)) scored.push({ label: o.label, matchedAlias: null, score: 1 });
    else {
      const alias = o.aliases.find(matches);
      if (alias) scored.push({ label: o.label, matchedAlias: alias, score: 2 });
    }
  });

  return scored
    .sort((a, b) => a.score - b.score || a.label.localeCompare(b.label, 'es'))
    .map(({ label, matchedAlias }) => ({ label, matchedAlias }));
}
