// src/components/MusicToggle.jsx

import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useMusic } from '../context/music-context';

export default function MusicToggle() {
  const { muted, toggleMuted } = useMusic();
  const label = muted ? 'Activar música' : 'Silenciar música';

  return (
    <button
      type="button"
      onClick={toggleMuted}
      aria-label={label}
      aria-pressed={!muted}
      title={label}
      className="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
    >
      {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
    </button>
  );
}
