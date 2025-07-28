// src/hooks/useCase.js

import { useMemo } from 'react';
import useCases from './useCases';

export default function useCase(id) {
  const cases = useCases();

  return useMemo(() => {
    if (!cases.length) return undefined;
    return cases.find(c => String(c.id) === String(id));
  }, [cases, id]);
}
