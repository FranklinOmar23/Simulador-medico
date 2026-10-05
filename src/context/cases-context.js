// src/context/cases-context.js

import { createContext } from 'react';

export const CasesContext = createContext({
  cases: [],
  status: 'loading',
  error: null,
  reload: () => {}
});
