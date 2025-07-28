// src/features/case-list/CaseList.jsx

import React, { useState, useContext } from 'react';
import useCases from '../../hooks/useCases';
import CaseCard from './CaseCard';
import { GameContext } from '../../context/GameContext';
import { Stethoscope, GraduationCap } from 'lucide-react';

export default function CaseList() {
    const allCases = useCases();
    const { xp, casesResolved } = useContext(GameContext);
    const [selectedDifficulty, setSelectedDifficulty] = useState('fácil');

    // Sólo tomamos los dos primeros de la dificultad seleccionada
    const filtered = allCases
        .filter(c => c.difficulty === selectedDifficulty)
        .slice(0, 2);

    // Cálculo de progresión para el próximo rango
    const nextThreshold = 3; // casos para pasar a Interno
    const remaining = Math.max(nextThreshold - casesResolved, 0);

    const capitalize = str => str[0].toUpperCase() + str.slice(1);

    return (
        <div className="container mx-auto p-4 space-y-6">
            {/* ==== Cabecera ==== */}
            <header className="text-center space-y-1">
                <Stethoscope className="mx-auto text-blue-600" size={32} />
                <h1 className="text-2xl font-bold">Diagnóstico Clínico</h1>
                <p className="text-gray-600">Simulador Médico Interactivo</p>
            </header>

            {/* ==== Tarjeta de progreso ==== */}
            <div className="flex justify-center mb-6">
                <div className="bg-white rounded shadow p-6 flex flex-col md:flex-col items-center md:justify-between w-xl">
                    <div className="flex items-center mb-4 md:mb-0">
                        <GraduationCap className="text-gray-700 mr-2" />
                        <span className="font-semibold text-lg">Estudiante de Medicina</span>
                    </div>
                    <div className="flex-1 md:px-6 w-full max-w-xl">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Casos resueltos: {casesResolved}</span>
                            <span>Experiencia: {xp} XP</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div
                                className="bg-blue-600 h-2"
                                style={{ width: `${Math.min((casesResolved / nextThreshold) * 100, 100)}%` }}
                            />
                        </div>
                        <p className="text-center text-xs text-gray-500 mt-1">
                            {remaining} casos para ascender a Interno
                        </p>
                    </div>
                </div>
            </div>

            {/* ==== Selector de dificultad ==== */}
            <div className="bg-white p-4 rounded shadow">
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

            {/* ==== Listado de casos ==== */}
            <section>
                <h2 className="text-xl font-semibold mb-2">
                    Casos Disponibles – <span className="font-normal">{capitalize(selectedDifficulty)}</span>
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                    {filtered.map(c => (
                        <CaseCard key={c.id} caseItem={c} />
                    ))}
                </div>
            </section>
        </div>
    );
}
