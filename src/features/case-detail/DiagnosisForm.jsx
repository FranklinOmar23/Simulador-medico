// src/features/case-detail/DiagnosisForm.jsx

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Send,
  XCircle
} from 'lucide-react';
import Button from '../../components/Button';
import { useGame } from '../../context/game-context';
import useCases from '../../hooks/useCases';
import { evaluateDiagnosis } from '../../lib/scoring';
import { buildCaseOptions, buildDiagnosisOptions } from '../../lib/diagnosisSearch';
import DiagnosisCombobox from './DiagnosisCombobox';

const outcome = {
  correct: {
    title: '¡Diagnóstico correcto!',
    Icon: CheckCircle2,
    box: 'bg-emerald-50 ring-emerald-600/20',
    icon: 'bg-emerald-100 text-emerald-600',
    text: 'text-emerald-800'
  },
  almost: {
    title: 'Casi aciertas',
    Icon: AlertTriangle,
    box: 'bg-amber-50 ring-amber-600/20',
    icon: 'bg-amber-100 text-amber-600',
    text: 'text-amber-800'
  },
  wrong: {
    title: 'Diagnóstico incorrecto',
    Icon: XCircle,
    box: 'bg-rose-50 ring-rose-600/20',
    icon: 'bg-rose-100 text-rose-600',
    text: 'text-rose-800'
  }
};

const fieldStyles =
  'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 shadow-xs ' +
  'placeholder:text-slate-400 transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 focus:outline-none';

const formatXp = xp => (xp > 0 ? `+${xp} XP` : `${xp} XP`);

function NextCaseButton() {
  return (
    <Button as={Link} to="/" size="lg" className="w-full">
      Siguiente paciente
      <ArrowRight className="size-4" aria-hidden="true" />
    </Button>
  );
}

function ReviewLink() {
  return (
    <Button
      variant="secondary"
      className="w-full"
      onClick={() =>
        document.getElementById('case-review')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    >
      <ArrowDown className="size-4" aria-hidden="true" />
      Ver la revisión del caso
    </Button>
  );
}

/**
 * result: resultado ya enviado (lo guarda CaseDetail para compartirlo con la revisión).
 * onSubmit(result): se llama al calificar un diagnóstico válido.
 */
export default function DiagnosisForm({
  caseData,
  timeUp = false,
  completed = false,
  orderedTestIds = [],
  result,
  onSubmit
}) {
  const [diagnosisText, setDiagnosisText] = useState('');
  const [treatmentText, setTreatmentText] = useState('');
  const [hint, setHint]                   = useState(null);

  const { finishCase } = useGame();
  const { cases } = useCases();

  // Todos los diagnósticos del simulador: para detectar respuestas que mencionan varios
  const diagnosisOptions = useMemo(() => buildDiagnosisOptions(cases), [cases]);
  const allLabels = useMemo(() => diagnosisOptions.map(o => o.label), [diagnosisOptions]);
  // Opciones que se muestran: las del caso más distractores (6 en total, orden fijo por caso)
  const caseOptions = useMemo(() => buildCaseOptions(caseData, cases), [caseData, cases]);

  const handleSubmit = e => {
    e.preventDefault();
    if (completed) return;

    const evaluation = evaluateDiagnosis(caseData, diagnosisText, {
      timeUp,
      allLabels,
      orderedTestIds
    });

    // Varios diagnósticos en una respuesta: pedir que elija uno, sin calificar
    if (evaluation.category === 'ambiguous') {
      setHint(
        `Tu respuesta menciona varios diagnósticos (${evaluation.candidates.join(', ')}). ` +
          'Escribe solo tu diagnóstico principal.'
      );
      return;
    }

    // Registrar progreso (el contexto ignora envíos repetidos del mismo caso)
    finishCase(caseData.id, {
      earnedXp: evaluation.earnedXp,
      solved: evaluation.category === 'correct'
    });

    onSubmit?.({ ...evaluation, treatmentText: treatmentText.trim() });
  };

  // Caso ya enviado en una visita anterior
  if (!result && completed) {
    return (
      <div className="space-y-3">
        <div className="flex gap-3 rounded-xl bg-slate-50 p-4">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden="true" />
          <p className="text-sm text-slate-700">
            Ya completaste este caso. Puedes repasar la explicación o atender a un paciente nuevo.
          </p>
        </div>
        <ReviewLink />
        <NextCaseButton />
      </div>
    );
  }

  // Mientras no haya enviado el diagnóstico
  if (!result) {
    return (
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="diagnosis" className="mb-1.5 block text-sm font-medium text-slate-900">
            Diagnóstico principal
          </label>
          <DiagnosisCombobox
            id="diagnosis"
            value={diagnosisText}
            onChange={text => {
              setDiagnosisText(text);
              setHint(null);
            }}
            options={caseOptions}
            placeholder="Elige una opción o escríbela"
            describedBy="diagnosis-help"
            invalid={Boolean(hint)}
            className={clsx(fieldStyles, hint && 'border-amber-400 focus:border-amber-500 focus:ring-amber-500/15')}
            required
          />
          {hint ? (
            <p
              id="diagnosis-help"
              role="alert"
              className="mt-2 flex gap-1.5 rounded-lg bg-amber-50 p-2.5 text-sm text-amber-800"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {hint}
            </p>
          ) : (
            <p id="diagnosis-help" className="mt-1.5 text-xs text-slate-500">
              Elige una de las opciones o escríbelo con tus palabras: se aceptan sinónimos, sin tildes y con
              pequeños errores de escritura.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="treatment" className="mb-1.5 block text-sm font-medium text-slate-900">
            Plan de tratamiento <span className="font-normal text-slate-500">(opcional)</span>
          </label>
          <textarea
            id="treatment"
            value={treatmentText}
            onChange={e => setTreatmentText(e.target.value)}
            placeholder="Describe el tratamiento; lo compararás con el recomendado"
            className={clsx(fieldStyles, 'resize-y')}
            rows={3}
          />
        </div>

        <Button type="submit" size="lg" className="w-full">
          <Send className="size-4" aria-hidden="true" />
          Enviar diagnóstico
        </Button>
      </form>
    );
  }

  // Resultado después de enviar
  const o = outcome[result.category];
  const { diagnosisXp, timePenalty, testPenalty, unnecessaryTests } = result.breakdown;
  const breakdownRows = [
    { label: 'Diagnóstico', value: diagnosisXp },
    timePenalty !== 0 && { label: 'Fuera de tiempo', value: timePenalty },
    testPenalty !== 0 && {
      label: `Pruebas innecesarias (${unnecessaryTests.length})`,
      value: testPenalty,
      detail: unnecessaryTests.join(', ')
    }
  ].filter(Boolean);

  return (
    <div className="animate-fade-in space-y-4">
      <div className={clsx('rounded-2xl p-5 text-center ring-1 ring-inset', o.box)}>
        <div className={clsx('mx-auto flex size-12 animate-pop items-center justify-center rounded-2xl', o.icon)}>
          <o.Icon className="size-6" aria-hidden="true" />
        </div>
        <h3 className={clsx('mt-3 text-lg font-semibold', o.text)}>{o.title}</h3>
        <p className="mt-1 text-3xl font-bold text-slate-900 tabular-nums">
          {formatXp(result.earnedXp)}
        </p>
        {result.category === 'almost' && (
          <p className={clsx('mt-1 text-sm', o.text)}>
            Es un diagnóstico diferencial válido: recibes la mitad del XP.
          </p>
        )}
      </div>

      <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200">
        <div className="px-4 py-3">
          <dt className="text-xs text-slate-500">Tu respuesta</dt>
          <dd className="font-medium text-slate-900">{result.answerText}</dd>
          {result.interpretedAs && (
            <dd className="mt-0.5 text-xs text-slate-500">
              Interpretada como «{result.interpretedAs}»
            </dd>
          )}
        </div>
        {result.category !== 'correct' && (
          <div className="px-4 py-3">
            <dt className="text-xs text-slate-500">Diagnóstico correcto</dt>
            <dd className="font-medium text-emerald-700">{result.correctLabel}</dd>
          </div>
        )}
      </dl>

      {/* Desglose de la puntuación */}
      <div className="rounded-xl border border-slate-200 px-4 py-3">
        <p className="mb-2 text-xs font-medium tracking-wide text-slate-500 uppercase">Puntuación</p>
        <ul className="space-y-1.5 text-sm">
          {breakdownRows.map(row => (
            <li key={row.label}>
              <div className="flex justify-between gap-3">
                <span className="text-slate-600">{row.label}</span>
                <span
                  className={clsx(
                    'font-medium tabular-nums',
                    row.value < 0 ? 'text-rose-600' : 'text-slate-900'
                  )}
                >
                  {formatXp(row.value)}
                </span>
              </div>
              {row.detail && <p className="text-xs text-slate-500">{row.detail}</p>}
            </li>
          ))}
          <li className="flex justify-between gap-3 border-t border-slate-100 pt-1.5 font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{formatXp(result.earnedXp)}</span>
          </li>
        </ul>
      </div>

      <ReviewLink />
      <NextCaseButton />
    </div>
  );
}
