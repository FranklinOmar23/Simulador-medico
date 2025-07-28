// src/features/case-detail/ConsultationHeader.jsx

import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Stethoscope,
  Clock,
  Star,
  CheckCircle,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { GameContext } from '../../context/GameContext';
import useCase from '../../hooks/useCase';

export default function ConsultationHeader() {
  const { id } = useParams();
  const caseData = useCase(id);
  const patientName = caseData?.patient?.name || '';
  const difficulty = caseData?.difficulty || 'fácil';
  const navigate = useNavigate();
  const { xp } = useContext(GameContext);

  // Duración en segundos según dificultad
  const timeMap = {
    fácil:   90,   // 1.5 minutos
    normal: 150,   // 2.5 minutos
    difícil:240    // 4   minutos
  };
  const initialTime = timeMap[difficulty] ?? timeMap['fácil'];

  // Estado del temporizador
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    // Reiniciar y arrancar timer al cambiar de caso
    setTimeLeft(initialTime);
    const timer = setInterval(() => {
      setTimeLeft(t => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [id, initialTime]);

  const formatTime = secs => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  // Configuración de badge según dificultad
  const badgeConfig = {
    fácil: {
      icon:   <CheckCircle size={16} />,
      styles: 'bg-green-100 text-green-700'
    },
    normal: {
      icon:   <HelpCircle size={16} />,
      styles: 'bg-yellow-100 text-yellow-700'
    },
    difícil: {
      icon:   <AlertTriangle size={16} />,
      styles: 'bg-red-100 text-red-700'
    }
  };
  const { icon, styles } = badgeConfig[difficulty] || badgeConfig['fácil'];

  return (
    <header className="bg-white shadow px-6 py-4 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
      {/* Título y paciente */}
      <div className="flex items-center space-x-3">
        <Stethoscope className="text-blue-600" size={28} />
        <div>
          <h2 className="text-xl font-semibold">Consultorio Médico</h2>
          <p className="text-sm text-gray-600">
            Estudiante de Medicina • Paciente: {patientName}
          </p>
        </div>
      </div>

      {/* Timer, puntuación y badge de dificultad */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-1 text-red-500">
          <Clock size={18} />
          <span className="font-medium">{formatTime(timeLeft)}</span>
        </div>
        <div className="flex items-center space-x-1 text-yellow-600">
          <Star size={18} />
          <span className="font-medium">Puntuación: {xp}</span>
        </div>
        <div
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm capitalize ${styles}`}
        >
          {icon}
          <span className="ml-1">{difficulty}</span>
        </div>
      </div>

      {/* Botón Nuevo Caso */}
      <button
        onClick={() => navigate('/')}
        className="ml-auto md:ml-0 bg-black text-white px-4 py-2 rounded"
      >
        Nuevo Caso
      </button>
    </header>
  );
}
