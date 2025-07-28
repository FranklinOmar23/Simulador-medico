import React, { useState } from 'react';

export default function TestPanel({ caseData }) {
  const { availableTests } = caseData;
  const [inProgress, setInProgress] = useState({});
  const [results, setResults] = useState({});

  const orderTest = test => {
    // Marcar como en progreso
    setInProgress(ip => ({ ...ip, [test.id]: true }));
    // Al cabo de durationSec, completar
    setTimeout(() => {
      setResults(rs => ({ ...rs, [test.id]: test.results }));
      setInProgress(ip => {
        const copy = { ...ip };
        delete copy[test.id];
        return copy;
      });
    }, (test.durationSec || 0) * 1000);
  };

  return (
    <div>
      <h4 className="font-medium mb-2">Pruebas Disponibles</h4>
      <div className="space-y-2">
        {availableTests.map(t => (
          <div key={t.id} className="flex justify-between items-center border border-gray-200 rounded p-2">
            <div>
              <p className="font-medium">{t.name}</p>
              <p className="text-sm text-gray-600">
                {t.type} • ${t.cost} • {t.durationSec}s
              </p>
            </div>
            <button
              onClick={() => orderTest(t)}
              disabled={inProgress[t.id] || results[t.id]}
              className="bg-black text-white px-3 py-1 rounded disabled:opacity-50"
            >
              {inProgress[t.id]
                ? 'Procesando...'
                : results[t.id]
                ? 'Listo'
                : 'Ordenar'}
            </button>
          </div>
        ))}
      </div>

      {/* Resultados */}
      {Object.keys(results).length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Resultados</h4>
          <div className="space-y-3">
            {Object.entries(results).map(([testId, res]) => (
              <div key={testId} className="border border-gray-200 rounded p-2 bg-green-50">
                <p className="font-medium">{availableTests.find(t => t.id === testId)?.name}</p>
                <ul className="text-gray-700 list-disc list-inside">
                  {Object.entries(res).map(([param, value]) => (
                    <li key={param}>
                      <strong>{param}:</strong> {value}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
);
}
