// src/context/emergency-context.js

import { createContext, useContext } from 'react';

export const EmergencyContext = createContext({
  pending: null,
  active: null,
  missed: null,
  now: 0,
  accept: () => {},
  decline: () => {}
});

export function useEmergency() {
  return useContext(EmergencyContext);
}
