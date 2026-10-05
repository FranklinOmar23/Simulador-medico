// src/lib/scoring.js

import { matchDiagnosis } from './diagnosisMatcher';

const DEFAULT_WRONG_PENALTY = -10;
const DEFAULT_TEST_PENALTY = -5;

export function getCorrectDiagnosis(caseData) {
  return caseData.diagnoses.find(d => d.id === caseData.correctDiagnosisId);
}

// XP máximo del caso = XP del diagnóstico correcto
export function getCaseXp(caseData) {
  return getCorrectDiagnosis(caseData)?.xp ?? 0;
}

// Pruebas pedidas que el caso marca como innecesarias
export function getUnnecessaryTests(caseData, orderedTestIds = []) {
  return caseData.availableTests.filter(
    t => t.relevance === 'unnecessary' && orderedTestIds.includes(t.id)
  );
}

/**
 * Califica el diagnóstico escrito.
 * allLabels: todos los diagnósticos del simulador, para detectar respuestas
 * que mencionan varios diagnósticos a la vez.
 * orderedTestIds: pruebas pedidas durante la consulta (penaliza las innecesarias).
 * Con category 'ambiguous' no se debe registrar el caso: hay que pedir que precise.
 */
export function evaluateDiagnosis(
  caseData,
  text,
  { timeUp = false, allLabels = [], orderedTestIds = [] } = {}
) {
  const correct = getCorrectDiagnosis(caseData);
  const match = matchDiagnosis(caseData, text, allLabels);

  if (match.status === 'ambiguous') {
    return { category: 'ambiguous', candidates: match.candidates };
  }

  const chosen = match.status === 'match' ? match.diagnosis : undefined;
  let category, diagnosisXp;

  if (chosen && chosen.id === correct?.id) {
    category = 'correct';
    diagnosisXp = correct.xp;
  } else if (chosen) {
    // Un diferencial nunca puede valer más que el diagnóstico correcto
    category = 'almost';
    diagnosisXp = Math.floor(Math.min(chosen.xp, correct?.xp ?? chosen.xp) / 2);
  } else {
    category = 'wrong';
    diagnosisXp = caseData.xpPenalties?.wrongDiagnosis ?? DEFAULT_WRONG_PENALTY;
  }

  // Fuera de tiempo: el XP positivo del diagnóstico se reduce a la mitad
  const timePenalty = timeUp && diagnosisXp > 0 ? -Math.ceil(diagnosisXp / 2) : 0;

  const unnecessaryTests = getUnnecessaryTests(caseData, orderedTestIds);
  const testPenalty =
    unnecessaryTests.length * (caseData.xpPenalties?.unnecessaryTest ?? DEFAULT_TEST_PENALTY);

  return {
    category,
    earnedXp: diagnosisXp + timePenalty + testPenalty,
    breakdown: {
      diagnosisXp,
      timePenalty,
      testPenalty,
      unnecessaryTests: unnecessaryTests.map(t => t.name)
    },
    answerText: text.trim(),
    // Etiqueta oficial reconocida cuando el estudiante lo escribió de otra forma
    interpretedAs: chosen && !match.exact ? chosen.label : null,
    chosenLabel: chosen?.label ?? text.trim(),
    correctLabel: correct?.label ?? '',
    timeUp
  };
}
