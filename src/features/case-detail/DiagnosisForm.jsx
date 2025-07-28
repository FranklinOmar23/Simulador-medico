// src/features/case-detail/DiagnosisForm.jsx

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContext } from '../../context/GameContext';

export default function DiagnosisForm({ caseData }) {
  const {
    diagnoses,
    correctDiagnosisId,
    xpPenalties,
  } = caseData;

  const [diagnosisText, setDiagnosisText] = useState('');
  const [treatmentText, setTreatmentText]   = useState('');
  const [feedback, setFeedback]             = useState(null);

  const { finishCase } = useContext(GameContext);
  const navigate       = useNavigate();

  const handleSubmit = e => {
    e.preventDefault();

    // Buscar si escribió exactamente alguna de las etiquetas
    const normalized = diagnosisText.trim().toLowerCase();
    const chosen = diagnoses.find(
      d => d.label.trim().toLowerCase() === normalized
    );

    let category, earnedXp, chosenLabel;

    if (chosen?.id === correctDiagnosisId) {
      // ✅ Correcto
      category    = 'correct';
      earnedXp    = chosen.xp;
      chosenLabel = chosen.label;
    } else if (chosen) {
      // ⚠️ Casi (seleccionó otra opción válida)
      category    = 'almost';
      earnedXp    = Math.floor(chosen.xp / 2);
      chosenLabel = chosen.label;
    } else {
      // ❌ Incorrecto
      category    = 'wrong';
      earnedXp    = xpPenalties.wrongDiagnosis;
      chosenLabel = diagnosisText;
    }

    // Registrar progreso
    finishCase(earnedXp);

    // Guardar feedback
    setFeedback({ category, earnedXp, chosenLabel });
  };

  // Mientras no haya enviado el diagnóstico
  if (!feedback) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">
            Diagnóstico Principal
          </label>
          <textarea
            value={diagnosisText}
            onChange={e => setDiagnosisText(e.target.value)}
            placeholder="Escribe aquí tu diagnóstico"
            className="w-full border border-gray-300 rounded px-3 py-2"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">
            Plan de Tratamiento
          </label>
          <textarea
            value={treatmentText}
            onChange={e => setTreatmentText(e.target.value)}
            placeholder="Describe el tratamiento"
            className="w-full border border-gray-300 rounded px-3 py-2"
            rows={3}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white px-4 py-2 rounded"
        >
          Enviar Diagnóstico
        </button>
      </form>
    );
  }

  // Feedback después de enviar
  const colors = {
    correct: { bg: 'bg-green-50', text: 'text-green-800', accent: 'text-green-600' },
    almost:  { bg: 'bg-yellow-50', text: 'text-yellow-800', accent: 'text-yellow-600' },
    wrong:   { bg: 'bg-red-50',    text: 'text-red-800',   accent: 'text-red-600' }
  };
  const { bg, text, accent } = colors[feedback.category];

  return (
    <div className="space-y-4">
      <div className={`${bg} p-4 rounded`}>
        <h3 className={`text-lg font-semibold ${text}`}>Caso Completado</h3>
        <p className="mt-2 text-2xl font-bold">{feedback.earnedXp} puntos</p>
        <p className={`mt-1 ${accent}`}>
          {feedback.category === 'correct'
            ? '✅ Diagnóstico correcto: '
            : feedback.category === 'almost'
            ? '⚠️ Casi acertado: '
            : '❌ Diagnóstico incorrecto: '}
          {feedback.chosenLabel}
        </p>
        <p className={`${accent} mt-1`}>
          {feedback.category === 'almost'
            ? `+${feedback.earnedXp} XP por acercarte`
            : `${feedback.earnedXp > 0 ? `+${feedback.earnedXp}` : ''} XP`}
        </p>
      </div>
      <button
        onClick={() => navigate('/')}
        className="w-full bg-black text-white px-4 py-2 rounded"
      >
        Nuevo Caso
      </button>
    </div>
  );
}
