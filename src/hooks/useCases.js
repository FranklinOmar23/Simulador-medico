// src/hooks/useCases.js

import { useState, useEffect } from 'react';

export default function useCases() {
  const [cases, setCases] = useState([]);

  useEffect(() => {
    let isActive = true;

    async function fetchCases() {
      try {
        const res = await fetch('/data/cases.json');
        if (!res.ok) throw new Error(`Failed to fetch cases: ${res.status}`);
        const json = await res.json();

        if (isActive) {
          setCases(json.cases || []);
          console.log('useCases: loaded', (json.cases || []).length, 'cases');
        }
      } catch (err) {
        console.error('useCases: error loading cases:', err);
      }
    }

    fetchCases();

    return () => {
      isActive = false;
    };
  }, []);

  return cases;
}
