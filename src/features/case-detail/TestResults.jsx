// src/features/case-detail/TestResults.jsx

import React from 'react';
import { Lightbulb } from 'lucide-react';

// Resultado de una prueba: los valores en filas y la interpretación destacada
export default function TestResults({ name, results }) {
  const { Interpretación: interpretation, ...values } = results;

  return (
    <article className="animate-fade-in overflow-hidden rounded-xl border border-slate-200">
      <h5 className="border-b border-slate-100 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">
        {name}
      </h5>
      <dl className="divide-y divide-slate-100">
        {Object.entries(values).map(([param, value]) => (
          <div key={param} className="px-3 py-2">
            <dt className="text-xs text-slate-500">{param}</dt>
            <dd className="text-sm text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>
      {interpretation && (
        <div className="flex gap-2 border-t border-brand-100 bg-brand-50 px-3 py-2.5">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
          <p className="text-sm text-brand-900">
            <span className="font-medium">Interpretación: </span>
            {interpretation}
          </p>
        </div>
      )}
    </article>
  );
}
