// src/features/case-detail/CaseReview.jsx

import React from 'react';
import clsx from 'clsx';
import {
  BookOpen,
  Check,
  ClipboardList,
  FlaskConical,
  GraduationCap,
  Lightbulb,
  MessageCircleQuestion,
  Pill,
  Search,
  X
} from 'lucide-react';
import Card from '../../components/Card';

const relevanceStyles = {
  key:         { label: 'Clave',       styles: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  useful:      { label: 'Útil',        styles: 'bg-sky-50 text-sky-700 ring-sky-600/20' },
  unnecessary: { label: 'Innecesaria', styles: 'bg-slate-100 text-slate-600 ring-slate-500/20' }
};

function Section({ icon: Icon, title, children }) {
  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Icon className="size-4 text-brand-600" aria-hidden="true" />
        {title}
      </h3>
      {children}
    </section>
  );
}

function Tag({ className, children }) {
  return (
    <span
      className={clsx(
        'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        className
      )}
    >
      {children}
    </span>
  );
}

/**
 * Explicación docente del caso.
 * session = { orderedTestIds, askedQuestions, result } cuando el caso se acaba de jugar;
 * null cuando se revisa un caso completado en otra visita (no hay datos de la sesión).
 */
export default function CaseReview({ caseData, session }) {
  const { teaching, diagnoses, correctDiagnosisId, availableTests, chatFlow, treatments } = caseData;
  const ordered = session?.orderedTestIds ?? [];
  const asked = session?.askedQuestions ?? [];
  const chosenLabel = session?.result?.chosenLabel;
  const keyQuestions = chatFlow.questions
    .map((q, index) => ({ ...q, index }))
    .filter(q => q.key);

  // Correcto primero
  const sortedDiagnoses = [...diagnoses].sort(
    (a, b) => (b.id === correctDiagnosisId) - (a.id === correctDiagnosisId)
  );

  return (
    <Card as="section" id="case-review" aria-labelledby="review-title" className="animate-fade-in scroll-mt-24 p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
          <GraduationCap className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h2 id="review-title" className="text-lg font-semibold text-slate-900">Revisión del caso</h2>
          {caseData.specialty && <p className="text-sm text-slate-500">{caseData.specialty}</p>}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Columna izquierda: razonamiento */}
        <div className="space-y-8">
          {teaching?.explanation && (
            <Section icon={BookOpen} title="Explicación">
              <p className="leading-relaxed text-slate-700">{teaching.explanation}</p>
              {teaching.pearl && (
                <div className="mt-4 flex gap-3 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-600/15 ring-inset">
                  <Lightbulb className="mt-0.5 size-5 shrink-0 text-amber-500" aria-hidden="true" />
                  <p className="text-sm text-amber-900">
                    <span className="font-semibold">Perla clínica: </span>
                    {teaching.pearl}
                  </p>
                </div>
              )}
            </Section>
          )}

          {teaching?.keyFindings?.length > 0 && (
            <Section icon={Search} title="Hallazgos clave">
              <ul className="space-y-2">
                {teaching.keyFindings.map(f => (
                  <li key={f} className="flex gap-2 text-sm text-slate-700">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section icon={ClipboardList} title="Diagnóstico diferencial">
            <ul className="space-y-3">
              {sortedDiagnoses.map(d => {
                const isCorrect = d.id === correctDiagnosisId;
                const isChosen = d.label === chosenLabel;
                return (
                  <li
                    key={d.id}
                    className={clsx(
                      'rounded-xl border p-3',
                      isCorrect ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200'
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-900">{d.label}</span>
                      {isCorrect && <Tag className="bg-emerald-100 text-emerald-700 ring-emerald-600/20">Correcto</Tag>}
                      {isChosen && <Tag className="bg-brand-50 text-brand-700 ring-brand-600/20">Tu respuesta</Tag>}
                    </div>
                    {d.rationale && <p className="mt-1 text-sm text-slate-600">{d.rationale}</p>}
                  </li>
                );
              })}
            </ul>
          </Section>
        </div>

        {/* Columna derecha: proceso y manejo */}
        <div className="space-y-8">
          {availableTests.some(t => t.relevance) && (
            <Section icon={FlaskConical} title="Pruebas">
              <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                {availableTests.map(t => {
                  const r = relevanceStyles[t.relevance];
                  const wasOrdered = ordered.includes(t.id);
                  const missedKey = session && t.relevance === 'key' && !wasOrdered;
                  const wasted = session && t.relevance === 'unnecessary' && wasOrdered;
                  return (
                    <li key={t.id} className="flex items-center gap-3 px-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-slate-900">{t.name}</p>
                        {session && (
                          <p
                            className={clsx(
                              'text-xs',
                              missedKey ? 'text-amber-700' : wasted ? 'text-rose-700' : 'text-slate-500'
                            )}
                          >
                            {missedKey
                              ? 'No la pediste: era clave'
                              : wasted
                              ? `La pediste sin necesidad (${caseData.xpPenalties?.unnecessaryTest ?? -5} XP)`
                              : wasOrdered
                              ? 'La pediste'
                              : 'No la pediste'}
                          </p>
                        )}
                      </div>
                      {r && <Tag className={r.styles}>{r.label}</Tag>}
                    </li>
                  );
                })}
              </ul>
            </Section>
          )}

          {keyQuestions.length > 0 && (
            <Section icon={MessageCircleQuestion} title="Preguntas clave de la entrevista">
              <ul className="space-y-2">
                {keyQuestions.map(q => {
                  const done = asked.includes(q.index);
                  return (
                    <li key={q.index} className="flex gap-2 text-sm">
                      {session ? (
                        done ? (
                          <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-label="Hecha" />
                        ) : (
                          <X className="mt-0.5 size-4 shrink-0 text-amber-500" aria-label="No la hiciste" />
                        )
                      ) : (
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-400" aria-hidden="true" />
                      )}
                      <span className="text-slate-700">
                        {q.prompt}
                        <span className="block text-xs text-slate-500">«{q.answer}»</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Section>
          )}

          {treatments?.length > 0 && (
            <Section icon={Pill} title="Tratamiento recomendado">
              <ul className="space-y-2">
                {treatments.map(t => (
                  <li key={t.id} className="flex gap-2 text-sm text-slate-700">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-400" aria-hidden="true" />
                    {t.label}
                  </li>
                ))}
              </ul>
              {session?.result?.treatmentText && (
                <div className="mt-3 rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Tu plan</p>
                  <p className="text-sm whitespace-pre-line text-slate-800">{session.result.treatmentText}</p>
                </div>
              )}
            </Section>
          )}

          {teaching?.references?.length > 0 && (
            <div className="border-t border-slate-100 pt-4">
              <p className="mb-1 text-xs font-medium tracking-wide text-slate-500 uppercase">Referencias</p>
              <ul className="space-y-0.5 text-xs text-slate-500">
                {teaching.references.map(r => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
