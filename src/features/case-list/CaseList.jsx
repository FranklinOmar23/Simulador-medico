// src/features/case-list/CaseList.jsx

import React, { useState, useContext, useEffect } from 'react';
import useCases from '../../hooks/useCases';
import CaseCard from './CaseCard';
import { GameContext } from '../../context/GameContext';
import { Stethoscope, GraduationCap } from 'lucide-react';

function PromoModal({ nextRank, theme, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`rounded-lg p-6 max-w-sm mx-auto text-center space-y-4 ${theme.modalBg}`}>
        <div className={theme.accentModal}>
          <GraduationCap size={48} />
        </div>
        <h2 className={`text-2xl font-semibold ${theme.accentText}`}>¡ASCENSO!</h2>
        <p className={`text-lg ${theme.accentText}`}>
          Ahora eres <strong>{nextRank}</strong>
        </p>
        <p className="text-gray-600">
          Los casos ahora serán más desafiantes. ¡A seguir aprendiendo!
        </p>
        <button
          onClick={onClose}
          className={`mt-4 px-4 py-2 rounded ${theme.buttonBg} ${theme.buttonText}`}
        >
          ¡Genial!
        </button>
      </div>
    </div>
  );
}

export default function CaseList() {
  const allCases = useCases();
  const { xp, casesResolved, resolvedIds } = useContext(GameContext);
  const [selectedDifficulty, setSelectedDifficulty] = useState('fácil');
  const [showPromo, setShowPromo] = useState(false);

  const rankThresholds = [
    { rank: 'Estudiante de Medicina', threshold: 0 },
    { rank: 'Interno Clínico',        threshold: 3 },
    { rank: 'Médico General',         threshold: 6 },
    { rank: 'Residente',              threshold: 10 },
    { rank: 'Especialista',           threshold: 15 },
    { rank: 'Profesor Clínico',       threshold: Infinity }
  ];

  const currentIndex =
    rankThresholds.findIndex(r => casesResolved < r.threshold) - 1;
  const currentRankInfo = rankThresholds[currentIndex] || rankThresholds[0];
  const nextRankInfo    = rankThresholds[currentIndex + 1];
  const nextThreshold   = nextRankInfo.threshold;
  const nextRank        = nextRankInfo.rank;

  const progressPct =
    nextThreshold === Infinity
      ? 100
      : Math.min((casesResolved / nextThreshold) * 100, 100);

  const themeConfig = {
    'Estudiante de Medicina': {
      headerBg:     'bg-white',
      accent:       'text-blue-600',
      cardHeaderBg: 'bg-white',
      cardBodyBg:   'bg-white',
      modalBg:      'bg-white',
      accentText:   'text-blue-600',
      accentModal:  'text-blue-600',
      buttonBg:     'bg-blue-600',
      buttonText:   'text-white'
    },
    'Interno Clínico': {
      headerBg:     'bg-blue-50',
      accent:       'text-blue-700',
      cardHeaderBg: 'bg-blue-100',
      cardBodyBg:   'bg-white',
      modalBg:      'bg-blue-50',
      accentText:   'text-blue-700',
      accentModal:  'text-blue-700',
      buttonBg:     'bg-blue-700',
      buttonText:   'text-white'
    },
    'Médico General': {
      headerBg:     'bg-green-50',
      accent:       'text-green-700',
      cardHeaderBg: 'bg-green-100',
      cardBodyBg:   'bg-white',
      modalBg:      'bg-green-50',
      accentText:   'text-green-700',
      accentModal:  'text-green-700',
      buttonBg:     'bg-green-700',
      buttonText:   'text-white'
    },
    'Residente': {
      headerBg:     'bg-yellow-50',
      accent:       'text-yellow-700',
      cardHeaderBg: 'bg-yellow-100',
      cardBodyBg:   'bg-white',
      modalBg:      'bg-yellow-50',
      accentText:   'text-yellow-700',
      accentModal:  'text-yellow-700',
      buttonBg:     'bg-yellow-700',
      buttonText:   'text-white'
    },
    'Especialista': {
      headerBg:     'bg-red-50',
      accent:       'text-red-700',
      cardHeaderBg: 'bg-red-100',
      cardBodyBg:   'bg-white',
      modalBg:      'bg-red-50',
      accentText:   'text-red-700',
      accentModal:  'text-red-700',
      buttonBg:     'bg-red-700',
      buttonText:   'text-white'
    },
    'Profesor Clínico': {
      headerBg:     'bg-purple-50',
      accent:       'text-purple-700',
      cardHeaderBg: 'bg-purple-100',
      cardBodyBg:   'bg-white',
      modalBg:      'bg-purple-50',
      accentText:   'text-purple-700',
      accentModal:  'text-purple-700',
      buttonBg:     'bg-purple-700',
      buttonText:   'text-white'
    }
  };

  const theme = themeConfig[currentRankInfo.rank];

  useEffect(() => {
    if (casesResolved > 0 && casesResolved >= nextThreshold) {
      setShowPromo(true);
    }
  }, [casesResolved, nextThreshold]);

  const filtered = allCases
    .filter(c => c.difficulty === selectedDifficulty)
    .filter(c => !resolvedIds.includes(c.id))
    .slice(0, 2);

  const capitalize = s => s[0].toUpperCase() + s.slice(1);

  return (
    <div className={`${theme.headerBg} min-h-screen`}>
      {showPromo && (
        <PromoModal
          nextRank={nextRank}
          theme={{
            modalBg:     theme.modalBg,
            accentText:  theme.accentText,
            accentModal: theme.accentModal,
            buttonBg:    theme.buttonBg,
            buttonText:  theme.buttonText
          }}
          onClose={() => setShowPromo(false)}
        />
      )}

      <header className={`text-center space-y-1 py-6 ${theme.headerBg}`}>
        <Stethoscope className={`mx-auto ${theme.accent}`} size={32} />
        <h1 className={`${theme.accent} text-2xl font-bold`}>
          Diagnóstico Clínico
        </h1>
        <p className="text-gray-600">Simulador Médico Interactivo</p>
      </header>

      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto rounded-lg overflow-hidden shadow">
          <div className={`${theme.cardHeaderBg} px-6 py-4`}>
            <div className="flex items-center justify-center space-x-2">
              <GraduationCap className={theme.accent} />
              <h2 className={`text-lg font-semibold ${theme.accent}`}>
                {currentRankInfo.rank}
              </h2>
            </div>
          </div>
          <div className={`${theme.cardBodyBg} px-6 py-6`}>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Casos resueltos: {casesResolved}</span>
              <span>Experiencia: {xp} XP</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-2">
              <div
                className={`${theme.accent} h-2`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-center text-xs text-gray-500">
              {nextThreshold === Infinity
                ? `¡Has alcanzado el nivel máximo!`
                : `${nextThreshold - casesResolved} casos para ascender a ${nextRank}`}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <div className="bg-white p-4 rounded border border-gray-200">
          <label htmlFor="difficulty" className="block font-medium mb-2">
            Seleccionar Dificultad
          </label>
          <select
            id="difficulty"
            value={selectedDifficulty}
            onChange={e => setSelectedDifficulty(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="fácil">🟢 Fácil – Casos básicos y comunes</option>
            <option value="normal">🟡 Normal – Casos con síntomas difusos</option>
            <option value="difícil">🔴 Difícil – Casos complejos</option>
          </select>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <h2 className="text-xl font-semibold mb-2">
          Casos Disponibles –{' '}
          <span className="font-normal">{capitalize(selectedDifficulty)}</span>
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map(c => (
            <CaseCard key={c.id} caseItem={c} />
          ))}
        </div>
      </div>
    </div>
  );
}
