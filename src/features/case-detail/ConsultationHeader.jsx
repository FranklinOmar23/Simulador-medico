// src/features/case-detail/ConsultationHeader.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { ArrowLeft, Clock, Siren, Star } from 'lucide-react';
import { useGame } from '../../context/game-context';
import { RANKS } from '../../lib/ranks';
import Button from '../../components/Button';
import DifficultyBadge from '../../components/DifficultyBadge';
import MusicToggle from '../../components/MusicToggle';

const formatTime = secs => {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
};

export default function ConsultationHeader({
  patientName,
  difficulty,
  timeLeft,
  totalTime,
  completed,
  emergency = false
}) {
  const { xp, rankIndex } = useGame();

  const pct = totalTime ? (timeLeft / totalTime) * 100 : 0;
  const urgent = !completed && timeLeft <= 30;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:gap-3">
        <Button as={Link} to="/" variant="ghost" size="sm" className="-ml-2" aria-label="Volver a la sala de espera">
          <ArrowLeft className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Sala de espera</span>
        </Button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-slate-500">{RANKS[rankIndex].rank}</p>
          <h1 className="truncate font-semibold text-slate-900">{patientName}</h1>
        </div>

        {emergency ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white">
            <Siren className="size-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Emergencia</span>
          </span>
        ) : (
          <span className="hidden md:block">
            <DifficultyBadge difficulty={difficulty} />
          </span>
        )}

        <span className="hidden items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-800 ring-1 ring-amber-600/20 ring-inset tabular-nums sm:inline-flex">
          <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden="true" />
          {xp} XP
        </span>

        <MusicToggle />

        <span
          role="timer"
          aria-label={`Tiempo restante ${formatTime(timeLeft)}`}
          className={clsx(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold tabular-nums ring-1 ring-inset',
            completed
              ? 'bg-slate-100 text-slate-500 ring-slate-500/10'
              : urgent
              ? 'animate-pulse bg-rose-50 text-rose-700 ring-rose-600/20'
              : 'bg-slate-100 text-slate-700 ring-slate-500/10'
          )}
        >
          <Clock className="size-4" aria-hidden="true" />
          {formatTime(timeLeft)}
        </span>
      </div>

      {/* Barra de tiempo restante */}
      <div className="h-1 bg-slate-100" aria-hidden="true">
        <div
          className={clsx(
            'h-full transition-[width] duration-1000 ease-linear',
            completed ? 'bg-slate-300' : urgent ? 'bg-rose-500' : pct <= 50 ? 'bg-amber-400' : 'bg-brand-500'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </header>
  );
}
