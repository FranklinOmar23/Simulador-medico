// src/context/GameContext.jsx

import React, { createContext, useState, useEffect } from 'react';

export const GameContext = createContext({
  xp: 0,
  casesResolved: 0,
  resolvedIds: [],
  currentCaseId: null,
  startCase: () => {},
  finishCase: () => {},
});

export function GameProvider({ children }) {
  const [xp, setXp] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('medSimProgress'));
      return saved?.xp ?? 0;
    } catch {
      return 0;
    }
  });

  const [casesResolved, setCasesResolved] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('medSimProgress'));
      return saved?.casesResolved ?? 0;
    } catch {
      return 0;
    }
  });

  const [resolvedIds, setResolvedIds] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('medSimProgress'));
      return saved?.resolvedIds ?? [];
    } catch {
      return [];
    }
  });

  const [currentCaseId, setCurrentCaseId] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(
        'medSimProgress',
        JSON.stringify({ xp, casesResolved, resolvedIds })
      );
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  }, [xp, casesResolved, resolvedIds]);

  const startCase = id => {
    setCurrentCaseId(id);
  };

  const finishCase = earnedXp => {
    setXp(prev => prev + earnedXp);
    setCasesResolved(prev => prev + 1);
    setResolvedIds(prev => [...prev, currentCaseId]);
    setCurrentCaseId(null);
  };

  return (
    <GameContext.Provider
      value={{
        xp,
        casesResolved,
        resolvedIds,
        currentCaseId,
        startCase,
        finishCase,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
