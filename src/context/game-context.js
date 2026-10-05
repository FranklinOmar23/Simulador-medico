// src/context/game-context.js

import { createContext, useContext } from 'react';

export const GameContext = createContext({
  xp: 0,
  casesResolved: 0,
  resolvedIds: [],
  rankIndex: 0,
  promotion: null,
  finishCase: () => {},
  dismissPromotion: () => {}
});

export function useGame() {
  return useContext(GameContext);
}
