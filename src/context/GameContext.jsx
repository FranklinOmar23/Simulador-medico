// src/context/GameContext.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameContext } from './game-context';
import { RANKS, getRankIndex } from '../lib/ranks';
import { EMPTY_PROGRESS, sanitizeProgress } from '../lib/progress';

const STORAGE_KEY = 'medSimProgress';

function loadProgress() {
  try {
    return sanitizeProgress(JSON.parse(localStorage.getItem(STORAGE_KEY)));
  } catch {
    return { ...EMPTY_PROGRESS };
  }
}

export function GameProvider({ children }) {
  const [progress, setProgress] = useState(loadProgress);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  }, [progress]);

  // Registra el resultado de un caso una sola vez.
  // Solo los diagnósticos correctos cuentan para ascender.
  const finishCase = useCallback((caseId, { earnedXp, solved }) => {
    setProgress(prev => {
      if (prev.resolvedIds.includes(caseId)) return prev;
      return {
        ...prev,
        xp: Math.max(0, prev.xp + earnedXp),
        casesResolved: prev.casesResolved + (solved ? 1 : 0),
        resolvedIds: [...prev.resolvedIds, caseId]
      };
    });
  }, []);

  const rankIndex = getRankIndex(progress.casesResolved);
  const promotion = rankIndex > progress.seenRankIndex ? RANKS[rankIndex].rank : null;

  const dismissPromotion = useCallback(() => {
    setProgress(prev => ({ ...prev, seenRankIndex: getRankIndex(prev.casesResolved) }));
  }, []);

  // Usados por la sincronización con la cuenta del usuario
  const replaceProgress = useCallback(next => setProgress(sanitizeProgress(next)), []);
  const resetProgress = useCallback(() => setProgress({ ...EMPTY_PROGRESS }), []);

  const value = useMemo(
    () => ({
      progress,
      xp: progress.xp,
      casesResolved: progress.casesResolved,
      resolvedIds: progress.resolvedIds,
      rankIndex,
      promotion,
      finishCase,
      dismissPromotion,
      replaceProgress,
      resetProgress
    }),
    [progress, rankIndex, promotion, finishCase, dismissPromotion, replaceProgress, resetProgress]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
