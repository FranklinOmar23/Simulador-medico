// src/context/GameContext.jsx

import React, { createContext, useState, useEffect } from 'react';

export const GameContext = createContext({
  xp: 0,
  casesResolved: 0,
  currentCaseId: null,
  startCase: () => {},
  finishCase: () => {},
});

export function GameProvider({ children }) {
  // Inicializar desde localStorage, o con valores por defecto
  const [xp, setXp] = useState(() => {
    try {
      const saved = localStorage.getItem('medSimProgress');
      return saved ? JSON.parse(saved).xp : 0;
    } catch {
      return 0;
    }
  });

  const [casesResolved, setCasesResolved] = useState(() => {
    try {
      const saved = localStorage.getItem('medSimProgress');
      return saved ? JSON.parse(saved).casesResolved : 0;
    } catch {
      return 0;
    }
  });

  const [currentCaseId, setCurrentCaseId] = useState(null);

  // Cada vez que xp o casesResolved cambian, guardamos en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        'medSimProgress',
        JSON.stringify({ xp, casesResolved })
      );
    } catch (err) {
      console.error('Error saving progress to localStorage:', err);
    }
  }, [xp, casesResolved]);

  // Lanza un caso nuevo
  const startCase = (id) => {
    setCurrentCaseId(id);
  };

  // Finaliza el caso: suma XP, cuenta un caso resuelto y limpia el caso activo
  const finishCase = (earnedXp) => {
    setXp((prev) => prev + earnedXp);
    setCasesResolved((prev) => prev + 1);
    setCurrentCaseId(null);
  };

  return (
    <GameContext.Provider
      value={{
        xp,
        casesResolved,
        currentCaseId,
        startCase,
        finishCase,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
