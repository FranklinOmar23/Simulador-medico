// src/features/case-list/CaseCard.jsx

import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContext } from '../../context/GameContext';
import { CheckCircle, HelpCircle, AlertTriangle } from 'lucide-react';

export default function CaseCard({ caseItem }) {
  const navigate = useNavigate();
  const { startCase } = useContext(GameContext);
  const {
    id,
    difficulty,
    presentingComplaint,
    patient,
    availableTests = [],
    diagnoses = []
  } = caseItem;

  // Mapas de estilos e iconos según dificultad
  const badgeConfig = {
    fácil: {
      styles: 'bg-green-100 text-green-700',
      icon: <CheckCircle size={16} />
    },
    normal: {
      styles: 'bg-yellow-100 text-yellow-700',
      icon: <HelpCircle size={16} />
    },
    difícil: {
      styles: 'bg-red-100 text-red-700',
      icon: <AlertTriangle size={16} />
    }
  };

  // Cálculo de XP y tiempo estimado
  const xpValue = diagnoses.reduce((max, d) => Math.max(max, d.xp), 0);
  const totalSec = availableTests.reduce((sum, t) => sum + (t.durationSec || 0), 0);
  const estMin = Math.ceil(totalSec / 60);

  const handleAttend = () => {
    startCase(id);
    navigate(`/case/${id}`);
  };

  const { styles, icon } = badgeConfig[difficulty] || badgeConfig['fácil'];

  return (
    <div className="bg-white rounded border border-gray-200 p-4 flex flex-col">
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 flex-shrink-0" />
        <div>
          <h3 className="font-semibold">{patient.name}</h3>
          <p className="text-sm text-gray-600">
            {patient.age} años • {patient.sex}
          </p>
        </div>

        <span className={`ml-auto inline-flex items-center px-2 py-1 rounded-full text-sm ${styles}`}>
          {icon}
          <span className="ml-1 capitalize">{difficulty}</span>
        </span>
      </div>

      <p className="flex-1 text-gray-700 mb-4">
        <span className="font-medium">Motivo de consulta:</span> {presentingComplaint}
      </p>

      <div className="flex items-center text-gray-600 text-sm mb-4 space-x-4">
        <div>⭐ {xpValue} XP</div>
        <div>⏱️ {estMin} min</div>
      </div>

      <button
        onClick={handleAttend}
        className="self-end bg-black text-white px-4 py-2 rounded"
      >
        Atender
      </button>
    </div>
  );
}
