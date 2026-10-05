// src/hooks/useCases.js

import { useContext } from 'react';
import { CasesContext } from '../context/cases-context';

// Devuelve { cases, status: 'loading' | 'ready' | 'error', error, reload }
export default function useCases() {
  return useContext(CasesContext);
}
