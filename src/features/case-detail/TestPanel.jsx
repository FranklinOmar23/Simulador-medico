// src/features/case-detail/TestPanel.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Activity, Check, FlaskConical, Loader2, ScanLine, Stethoscope, Wallet } from 'lucide-react';
import Button from '../../components/Button';
import TestResults from './TestResults';

const typeIcons = {
  Laboratorio: FlaskConical,
  Imagen: ScanLine,
  Exploración: Stethoscope
};

export default function TestPanel({ caseData, disabled = false, onOrder }) {
  const { availableTests } = caseData;
  const [inProgress, setInProgress] = useState({});
  const [results, setResults] = useState({});
  const timers = useRef([]);

  // Cancelar pruebas pendientes al salir de la consulta
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const orderTest = test => {
    setInProgress(ip => ({ ...ip, [test.id]: true }));
    onOrder?.(test.id);
    timers.current.push(
      setTimeout(() => {
        setResults(rs => ({ ...rs, [test.id]: test.results }));
        setInProgress(ip => {
          const copy = { ...ip };
          delete copy[test.id];
          return copy;
        });
      }, (test.durationSec || 0) * 1000)
    );
  };

  // Gasto total en pruebas pedidas (en curso o terminadas)
  const totalCost = availableTests
    .filter(t => inProgress[t.id] || results[t.id])
    .reduce((sum, t) => sum + (t.cost || 0), 0);

  const resultEntries = Object.entries(results);

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Pruebas disponibles</h3>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 tabular-nums">
            <Wallet className="size-3.5" aria-hidden="true" />
            Gasto: ${totalCost}
          </span>
        </div>

        <ul className="space-y-2">
          {availableTests.map(t => {
            const Icon = typeIcons[t.type] ?? Activity;
            const running = Boolean(inProgress[t.id]);
            const done = Boolean(results[t.id]);

            return (
              <li key={t.id} className="relative overflow-hidden rounded-xl border border-slate-200 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <Icon className="size-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">
                      {t.type} · ${t.cost} · {t.durationSec}s
                    </p>
                  </div>
                  {done ? (
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600">
                      <Check className="size-4" aria-hidden="true" />
                      Listo
                    </span>
                  ) : running ? (
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      Procesando
                    </span>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => orderTest(t)}
                      disabled={disabled}
                    >
                      Ordenar
                    </Button>
                  )}
                </div>

                {/* Avance de la prueba mientras se procesa */}
                {running && (
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-slate-100" aria-hidden="true">
                    <div
                      className="h-full animate-grow bg-brand-500"
                      style={{ animationDuration: `${t.durationSec || 0}s` }}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {resultEntries.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
            Resultados <span className="font-normal text-slate-500">({resultEntries.length})</span>
          </h3>
          <div className="space-y-3">
            {resultEntries.map(([testId, res]) => (
              <TestResults
                key={testId}
                name={availableTests.find(t => t.id === testId)?.name}
                results={res}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
