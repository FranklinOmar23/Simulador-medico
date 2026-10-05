// src/context/CasesContext.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CasesContext } from './cases-context';

// Casos revisados con formato v2 (ver scripts/validate-cases.mjs).
// Los casos del formato antiguo están en legacy/cases-v1.json: no superan la validación clínica.
const CASES_URL = '/data/cases-v2.json';

// Descarga los casos una sola vez para toda la app
export function CasesProvider({ children }) {
  const [state, setState] = useState({ cases: [], status: 'loading', error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function fetchCases() {
      try {
        const res = await fetch(CASES_URL);
        if (!res.ok) throw new Error(`Failed to fetch cases: ${res.status}`);
        const json = await res.json();
        if (isActive) {
          setState({
            cases: Array.isArray(json.cases) ? json.cases : [],
            status: 'ready',
            error: null
          });
        }
      } catch (err) {
        console.error('CasesProvider: error loading cases:', err);
        if (isActive) setState({ cases: [], status: 'error', error: err });
      }
    }

    fetchCases();

    return () => {
      isActive = false;
    };
  }, [attempt]);

  const reload = useCallback(() => {
    setState(s => ({ ...s, status: 'loading', error: null }));
    setAttempt(a => a + 1);
  }, []);

  const value = useMemo(() => ({ ...state, reload }), [state, reload]);

  return <CasesContext.Provider value={value}>{children}</CasesContext.Provider>;
}
