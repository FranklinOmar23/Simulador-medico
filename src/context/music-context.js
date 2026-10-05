// src/context/music-context.js

import { createContext, useContext } from 'react';

export const MusicContext = createContext({ muted: false, toggleMuted: () => {} });

export function useMusic() {
  return useContext(MusicContext);
}
