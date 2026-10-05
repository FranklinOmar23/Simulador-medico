// src/hooks/useCase.js

import { useMemo } from 'react';
import useCases from './useCases';

// Devuelve { caseData, status, error, reload }; caseData es undefined si no existe
export default function useCase(id) {
  const { cases, status, error, reload } = useCases();

  const caseData = useMemo(
    () => cases.find(c => String(c.id) === String(id)),
    [cases, id]
  );

  return { caseData, status, error, reload };
}
