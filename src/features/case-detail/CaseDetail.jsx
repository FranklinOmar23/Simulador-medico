// src/features/case-detail/CaseDetail.jsx

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import ConsultationHeader from './ConsultationHeader';
import ChatClinical from './ChatClinical';
import TestPanel from './TestPanel';
import DiagnosisForm from './DiagnosisForm';
import useCase from '../../hooks/useCase';  // Import corregido

export default function CaseDetail() {
  const { id } = useParams();
  const caseData = useCase(id);

  const [activeTab, setActiveTab] = useState('Pruebas');

  // Mostrar indicador de carga mientras no hay datos
  if (!caseData) {
    return <div className="p-4 text-center">Cargando caso...</div>;
  }

  const { patient, vitals, presentingComplaint, difficulty } = caseData;

  return (
    <div className="min-h-screen bg-gray-100">
      <ConsultationHeader />

      <div className="container mx-auto p-4 lg:grid lg:grid-cols-3 lg:gap-6">
        {/* Panel izquierdo */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información del Paciente */}
          <div className="bg-white p-4 rounded shadow flex flex-col md:flex-row md:justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold">{patient.name}</h3>
                <p className="text-gray-600">
                  {patient.age} años&nbsp;•&nbsp;{patient.sex}
                </p>
                <p className="mt-2">
                  <span className="font-medium">Motivo de consulta:</span>{' '}
                  {presentingComplaint}
                </p>
              </div>
            </div>
            {/* Signos Vitales */}
            <div className="mt-4 md:mt-0">
              <h4 className="font-medium mb-2">Signos Vitales</h4>
              <ul className="text-gray-700 space-y-1">
                <li>🌡️ Temperatura: {vitals.temperature}°C</li>
                <li>💓 Presión: {vitals.bloodPressure} mmHg</li>
                <li>❤️‍🩹 FC: {vitals.heartRate} bpm</li>
              </ul>
            </div>
          </div>

          {/* Chat Clínico */}
          <ChatClinical caseData={caseData} />
        </div>

        {/* Panel derecho: pestañas Pruebas / Diagnóstico */}
        <div className="space-y-4">
          <div className="bg-white rounded shadow">
            <nav className="flex">
              {['Pruebas', 'Diagnóstico'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-center font-medium ${
                    activeTab === tab
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>

            <div className="p-4">
              {activeTab === 'Pruebas' ? (
                <TestPanel caseData={caseData} />
              ) : (
                <DiagnosisForm caseData={caseData} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
