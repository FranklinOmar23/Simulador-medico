// scripts/validate-cases.mjs
//
// Valida la estructura y la coherencia básica de los casos clínicos (formato v2).
// Uso: npm run validate:cases [-- ruta/al/archivo.json]
// Sale con código 1 si hay errores. Las advertencias no bloquean.
//
// Importante: este validador detecta incoherencias estructurales y numéricas,
// pero NO sustituye la revisión de un profesional médico.

import { readFileSync } from 'node:fs';

const file = process.argv[2] ?? 'public/data/cases-v2.json';

const DIFFICULTIES = ['fácil', 'normal', 'difícil'];
const SEXES = ['Masculino', 'Femenino'];
const RELEVANCE = ['key', 'useful', 'unnecessary'];

// Rangos fisiológicamente posibles (no "normales")
const VITAL_RANGES = {
  temperature: [33, 42.5],
  heartRate: [25, 220],
  respiratoryRate: [6, 60],
  oxygenSaturation: [60, 100]
};

const normalize = s =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const isNonEmptyString = v => typeof v === 'string' && v.trim().length > 0;

function validateCase(c, index) {
  const errors = [];
  const warnings = [];
  const err = msg => errors.push(msg);
  const warn = msg => warnings.push(msg);

  // Identificación
  if (!isNonEmptyString(c.id)) err('id debe ser un texto no vacío');
  if (!DIFFICULTIES.includes(c.difficulty)) err(`difficulty inválida: "${c.difficulty}"`);
  if (!isNonEmptyString(c.specialty)) err('falta specialty');
  if (!isNonEmptyString(c.presentingComplaint)) err('falta presentingComplaint');
  if (c.emergency !== undefined && typeof c.emergency !== 'boolean') err('emergency debe ser true o false');

  // Paciente
  const p = c.patient ?? {};
  if (!isNonEmptyString(p.name)) err('patient.name vacío');
  if (!Number.isInteger(p.age) || p.age < 0 || p.age > 110) err(`patient.age inválida: ${p.age}`);
  if (!SEXES.includes(p.sex)) err(`patient.sex inválido: "${p.sex}"`);
  if (typeof p.history !== 'string') err('patient.history debe existir (puede ser "Sin antecedentes de interés")');

  // Signos vitales
  const v = c.vitals ?? {};
  for (const [key, [min, max]] of Object.entries(VITAL_RANGES)) {
    if (v[key] === undefined) {
      if (key === 'temperature' || key === 'heartRate') err(`falta vitals.${key}`);
      continue;
    }
    if (typeof v[key] !== 'number' || v[key] < min || v[key] > max) {
      err(`vitals.${key} fuera de rango fisiológico (${min}–${max}): ${v[key]}`);
    }
  }
  const bp = String(v.bloodPressure ?? '').match(/^(\d{2,3})\/(\d{2,3})$/);
  if (!bp) {
    err(`vitals.bloodPressure debe tener formato "120/80": "${v.bloodPressure}"`);
  } else {
    const [sys, dia] = [Number(bp[1]), Number(bp[2])];
    if (sys < 60 || sys > 260 || dia < 30 || dia > 160) err(`presión arterial imposible: ${v.bloodPressure}`);
    if (sys - dia < 15) err(`presión diferencial demasiado estrecha: ${v.bloodPressure}`);
  }

  // Entrevista
  const chat = c.chatFlow ?? {};
  if (!isNonEmptyString(chat.greeting)) err('falta chatFlow.greeting');
  const questions = Array.isArray(chat.questions) ? chat.questions : [];
  if (questions.length < 3) err('se necesitan al menos 3 preguntas');
  if (!questions.some(q => q.key)) err('marca al menos una pregunta con "key": true');
  questions.forEach((q, i) => {
    if (!isNonEmptyString(q.prompt) || !isNonEmptyString(q.answer)) err(`pregunta ${i + 1} incompleta`);
  });

  // Coherencia: antecedentes declarados vs respuesta del paciente
  const hasHistory = isNonEmptyString(p.history) && !/^sin antecedentes/i.test(normalize(p.history));
  questions
    .filter(q => /antecedente|enfermedad/.test(normalize(q.prompt)))
    .forEach(q => {
      if (hasHistory && /(no tiene|sin antecedentes|ninguna|ninguno)/.test(normalize(q.answer))) {
        warn(`el paciente niega antecedentes pero patient.history dice "${p.history}"`);
      }
    });

  // Pruebas
  const tests = Array.isArray(c.availableTests) ? c.availableTests : [];
  if (tests.length < 2) err('se necesitan al menos 2 pruebas');
  const testIds = new Set();
  tests.forEach(t => {
    const where = `prueba "${t.name ?? t.id}"`;
    if (!isNonEmptyString(t.id)) err(`${where}: falta id`);
    else if (testIds.has(t.id)) err(`${where}: id duplicado "${t.id}"`);
    testIds.add(t.id);
    if (!isNonEmptyString(t.name)) err(`${where}: falta name`);
    if (!isNonEmptyString(t.type)) err(`${where}: falta type`);
    if (typeof t.cost !== 'number' || t.cost < 0) err(`${where}: cost inválido`);
    if (typeof t.durationSec !== 'number' || t.durationSec <= 0) err(`${where}: durationSec inválido`);
    if (!RELEVANCE.includes(t.relevance)) err(`${where}: relevance debe ser ${RELEVANCE.join(' | ')}`);
    if (!t.results || typeof t.results !== 'object' || !Object.keys(t.results).length) {
      err(`${where}: results vacío`);
    } else if (!isNonEmptyString(t.results['Interpretación'])) {
      warn(`${where}: sin "Interpretación" en los resultados`);
    }
  });
  if (!tests.some(t => t.relevance === 'key')) err('ninguna prueba marcada como "key"');
  if (!tests.some(t => t.relevance === 'unnecessary')) {
    warn('ninguna prueba "unnecessary": el caso no entrena a evitar pruebas innecesarias');
  }

  // Diagnósticos
  const diagnoses = Array.isArray(c.diagnoses) ? c.diagnoses : [];
  if (diagnoses.length < 2) err('se necesitan al menos 2 diagnósticos (correcto + diferencial)');
  const correct = diagnoses.find(d => d.id === c.correctDiagnosisId);
  if (!correct) err(`correctDiagnosisId "${c.correctDiagnosisId}" no existe en diagnoses`);

  const seenForms = new Map();
  diagnoses.forEach(d => {
    const where = `diagnóstico "${d.label ?? d.id}"`;
    if (!isNonEmptyString(d.label)) err(`${where}: falta label`);
    if (typeof d.xp !== 'number' || d.xp <= 0) err(`${where}: xp debe ser positivo`);
    if (!isNonEmptyString(d.rationale)) err(`${where}: falta rationale (por qué sí / por qué no)`);
    if (correct && d !== correct && d.xp >= correct.xp) {
      err(`${where}: un diferencial no puede valer igual o más XP que el diagnóstico correcto`);
    }
    // Un sinónimo no puede coincidir con otro diagnóstico del mismo caso
    [d.label, ...(d.aliases ?? [])].forEach(form => {
      const n = normalize(form);
      if (seenForms.has(n) && seenForms.get(n) !== d.id) {
        err(`"${form}" aparece como forma de dos diagnósticos distintos`);
      }
      seenForms.set(n, d.id);
    });
  });

  // Tratamiento y docencia
  if (!Array.isArray(c.treatments) || !c.treatments.length) err('falta al menos un tratamiento');
  const pen = c.xpPenalties ?? {};
  if (!(pen.wrongDiagnosis < 0)) err('xpPenalties.wrongDiagnosis debe ser negativo');
  if (!(pen.unnecessaryTest < 0)) err('xpPenalties.unnecessaryTest debe ser negativo');

  const t = c.teaching ?? {};
  if (!Array.isArray(t.keyFindings) || t.keyFindings.length < 2) err('teaching.keyFindings necesita al menos 2 hallazgos');
  if (!isNonEmptyString(t.explanation) || t.explanation.length < 120) err('teaching.explanation ausente o demasiado breve (mín. 120 caracteres)');
  if (!isNonEmptyString(t.pearl)) warn('sin teaching.pearl (perla clínica)');
  if (!Array.isArray(t.references) || !t.references.length) warn('sin teaching.references');

  return { label: `${c.id ?? `#${index}`} · ${p.name ?? '?'} (${c.difficulty})`, errors, warnings };
}

// --- Ejecución ---
let data;
try {
  data = JSON.parse(readFileSync(file, 'utf8'));
} catch (e) {
  console.error(`No se pudo leer ${file}: ${e.message}`);
  process.exit(1);
}

const cases = Array.isArray(data.cases) ? data.cases : [];
if (data.schemaVersion !== 2) console.warn(`⚠ ${file} no declara "schemaVersion": 2`);

const ids = cases.map(c => c.id);
const duplicateIds = ids.filter((id, i) => ids.indexOf(id) !== i);

let errorCount = duplicateIds.length;
let warningCount = 0;
duplicateIds.forEach(id => console.log(`✖ id de caso duplicado: ${id}`));

cases.map(validateCase).forEach(r => {
  errorCount += r.errors.length;
  warningCount += r.warnings.length;
  if (!r.errors.length && !r.warnings.length) return;
  console.log(`\n${r.label}`);
  r.errors.forEach(e => console.log(`  ✖ ${e}`));
  r.warnings.forEach(w => console.log(`  ⚠ ${w}`));
});

const regular = cases.filter(c => !c.emergency);
const byDifficulty = DIFFICULTIES.map(d => `${d}: ${regular.filter(c => c.difficulty === d).length}`).join(', ');
const emergencies = cases.length - regular.length;
console.log(
  `\n${cases.length} casos (${byDifficulty}, emergencias: ${emergencies}) · ${errorCount} errores · ${warningCount} advertencias`
);
process.exit(errorCount ? 1 : 0);
