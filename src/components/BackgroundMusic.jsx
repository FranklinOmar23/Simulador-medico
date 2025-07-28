// src/components/BackgroundMusic.jsx
import { useEffect } from 'react';
import { Howl } from 'howler';

export default function BackgroundMusic() {
  useEffect(() => {
    const bgm = new Howl({
      src: ['/audio/bgm-loop.mp3'], // pon tu archivo en public/audio
      loop: true,
      volume: 0.5,                  // volumen suave
    });
    bgm.play();

    // Limpieza al desmontar
    return () => bgm.unload();
  }, []);

  return null; // no renderiza nada
}
