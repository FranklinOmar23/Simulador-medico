// src/components/BackgroundMusic.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Howl } from 'howler';
import { MusicContext } from '../context/music-context';

const MUTE_KEY = 'medSimMuted';

// Música de fondo global; el botón para silenciarla está en las cabeceras (MusicToggle)
export default function BackgroundMusic({ children }) {
  const soundRef = useRef(null);
  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem(MUTE_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const bgm = new Howl({
      src: ['/audio/bgm-loop.mp3'], // pon tu archivo en public/audio
      loop: true,
      volume: 0.5,                  // volumen suave
    });
    soundRef.current = bgm;
    // Howler reanuda el audio en la primera interacción si el navegador bloquea el autoplay
    bgm.play();

    // Limpieza al desmontar
    return () => bgm.unload();
  }, []);

  useEffect(() => {
    soundRef.current?.mute(muted);
    try {
      localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
    } catch {
      // sin almacenamiento disponible: la preferencia no se guarda
    }
  }, [muted]);

  const toggleMuted = useCallback(() => setMuted(m => !m), []);
  const value = useMemo(() => ({ muted, toggleMuted }), [muted, toggleMuted]);

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}
