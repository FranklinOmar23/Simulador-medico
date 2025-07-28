import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContext } from '../../context/GameContext';

export default function DiagnosisForm({ caseData }) {
  const { diagnoses, correctDiagnosisId, treatments, xpPenalties } = caseData;
  const [diagnosisText, setDiagnosisText] = useState('');
  const [treatmentText, setTreatmentText] = useState('');
  const { finishCase } = useContext(GameContext);
  const navigate = useNavigate();

  const handleSubmit = e => {
    e.preventDefault();

    // Buscar DX correcto
    const chosen = diagnoses.find(d =>
      d.label.toLowerCase() === diagnosisText.toLowerCase()
    );
    let earnedXp = xpPenalties.wrongDiagnosis;
    if (chosen?.id === correctDiagnosisId) {
      // Si acierta, XP definido en el diagnosis correcto
      earnedXp = chosen.xp;
    }

    finishCase(earnedXp);
    navigate('/');
  };

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
          className="w-full border rounded px-3 py-2"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Plan de Tratamiento</label>
        <textarea
          value={treatmentText}
          onChange={e => setTreatmentText(e.target.value)}
          placeholder="Describe el tratamiento"
          className="w-full border rounded px-3 py-2"
          rows={3}
          required
        />
      </div>

      <button
        type="submit"
        className="bg-black text-white px-4 py-2 rounded"
      >
        Enviar Diagnóstico
      </button>
    </form>
  );
}
