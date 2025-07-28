import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Stethoscope, Clock, Star } from 'lucide-react';
import { GameContext } from '../../context/GameContext';
import useCase from '../../hooks/useCase';

export default function ConsultationHeader() {
  const { id } = useParams();
  const caseData = useCase(id);
  const patientName = caseData?.patient.name || '';
  const difficulty = caseData?.difficulty || '';
  const navigate = useNavigate();
  const { xp } = useContext(GameContext);

  // Temporizador de ejemplo: empieza en 15:00 minutos
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = secs => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <header className="bg-white shadow px-6 py-4 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
      <div className="flex items-center space-x-3">
        <Stethoscope className="text-blue-600" size={28} />
        <div>
          <h2 className="text-xl font-semibold">Consultorio Médico</h2>
          <p className="text-sm text-gray-600">
            Estudiante de Medicina • Paciente: {patientName}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-1 text-red-500">
          <Clock size={18} />
          <span className="font-medium">{formatTime(timeLeft)}</span>
        </div>
        <div className="flex items-center space-x-1 text-yellow-600">
          <Star size={18} />
          <span className="font-medium">Puntuación: {xp}</span>
        </div>
        <div>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm capitalize">
            {difficulty}
          </span>
        </div>
      </div>

      <button
        onClick={() => navigate('/')}
        className="ml-auto md:ml-0 bg-black text-white px-4 py-2 rounded"
      >
        Nuevo Caso
      </button>
    </header>
  );
}
