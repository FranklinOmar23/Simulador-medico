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
    difficulty = 'fácil',
    presentingComplaint,
    patient,
    diagnoses = []
  } = caseItem;

  // Configuración de badge según dificultad
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

  // Mapa de tiempo en minutos según dificultad
  const timeMapMin = {
    fácil: 1.5,
    normal: 2.5,
    difícil: 4
  };
  const estMin = timeMapMin[difficulty] ?? timeMapMin['fácil'];

  // Cálculo de XP (máximo de los diagnósticos posibles)
  const xpValue = diagnoses.reduce((max, d) => Math.max(max, d.xp), 0);

  const handleAttend = () => {
    startCase(id);
    navigate(`/case/${id}`);
  };

  const { styles, icon } = badgeConfig[difficulty];

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

      <div className="flex items-center text-gray-600 text-sm mb-4 space-x-6">
        <div className="flex items-center space-x-1">
          <span>⭐</span>
          <span>{xpValue} XP</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>⏱️</span>
          <span>{estMin} min</span>
        </div>
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
