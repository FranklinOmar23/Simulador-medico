// src/features/case-list/CaseList.jsx

import React, { useState } from 'react';
import clsx from 'clsx';
import {
  AlertTriangle,
  CheckCircle2,
  GraduationCap,
  Siren,
  Stethoscope,
  Star,
  Trophy
} from 'lucide-react';
import useCases from '../../hooks/useCases';
import CaseCard from './CaseCard';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import AccountMenu from '../../components/AccountMenu';
import MusicToggle from '../../components/MusicToggle';
import { useGame } from '../../context/game-context';
import { getRankProgress } from '../../lib/ranks';
import { getRankStyle } from '../../lib/rankStyles';
import { DIFFICULTIES } from '../../lib/difficulty';
import { Link } from 'react-router-dom';
import { useEmergency } from '../../context/emergency-context';
import { formatClock } from '../../lib/emergency';

function PromoModal({ rank, onClose }) {
  const style = getRankStyle(rank);

  return (
    <Modal open onClose={onClose} labelledBy="promo-title" className="text-center">
      <div className={clsx('mx-auto flex size-16 items-center justify-center rounded-2xl', style.icon)}>
        <Trophy className="size-8" aria-hidden="true" />
      </div>
      <p className="mt-5 text-xs font-semibold tracking-widest text-slate-500 uppercase">
        ¡Ascenso!
      </p>
      <h2 id="promo-title" className="mt-1 text-2xl font-bold text-slate-900">
        Ahora eres <span className={style.text}>{rank}</span>
      </h2>
      <p className="mt-2 text-slate-600">
        Tu razonamiento clínico mejora. ¡Prueba con casos más difíciles!
      </p>
      <Button onClick={onClose} size="lg" className="mt-6 w-full" autoFocus>
        Continuar
      </Button>
    </Modal>
  );
}

function RankCard() {
  const { xp, casesResolved, resolvedIds } = useGame();
  const { current, next, pct } = getRankProgress(casesResolved);
  const style = getRankStyle(current.rank);

  const stats = [
    { label: 'Diagnósticos correctos', value: casesResolved },
    { label: 'Pacientes atendidos', value: resolvedIds.length },
    { label: 'Experiencia', value: `${xp} XP` }
  ];

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center gap-4">
        <div className={clsx('flex size-12 shrink-0 items-center justify-center rounded-2xl', style.icon)}>
          <GraduationCap className="size-6" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">Rango actual</p>
          <h2 className={clsx('truncate text-xl font-semibold', style.text)}>{current.rank}</h2>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-baseline justify-between gap-2 text-sm">
          <span className="text-slate-600">
            {next ? (
              <>
                Siguiente: <span className="font-medium text-slate-900">{next.rank}</span>
              </>
            ) : (
              '¡Has alcanzado el nivel máximo!'
            )}
          </span>
          {next && (
            <span className="text-slate-500 tabular-nums">
              {casesResolved}/{next.threshold}
            </span>
          )}
        </div>
        <div
          className="h-2.5 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-label="Progreso hacia el siguiente rango"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
        >
          <div
            className={clsx('h-full rounded-full transition-[width] duration-700', style.bar)}
            style={{ width: `${pct}%` }}
          />
        </div>
        {next && (
          <p className="mt-2 text-xs text-slate-500">
            {next.threshold - casesResolved === 1
              ? 'Te falta 1 diagnóstico correcto para ascender'
              : `Te faltan ${next.threshold - casesResolved} diagnósticos correctos para ascender`}
          </p>
        )}
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl bg-slate-50 px-3 py-2.5">
            <dt className="text-[11px] leading-tight text-slate-500 sm:text-xs">{s.label}</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-900 tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

function DifficultyPicker({ value, onChange }) {
  return (
    <div
      role="radiogroup"
      aria-label="Dificultad"
      className="grid grid-cols-3 gap-1 rounded-2xl bg-slate-200/60 p-1"
    >
      {Object.entries(DIFFICULTIES).map(([key, d]) => {
        const active = value === key;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(key)}
            className={clsx(
              'rounded-xl px-2 py-2 text-center transition',
              active ? 'bg-white shadow-sm' : 'hover:bg-white/60'
            )}
          >
            <span
              className={clsx(
                'flex items-center justify-center gap-1.5 text-sm font-medium',
                active ? 'text-slate-900' : 'text-slate-600'
              )}
            >
              <d.Icon className="size-4" aria-hidden="true" />
              {d.label}
            </span>
            <span className="hidden text-xs text-slate-500 sm:block">{d.description}</span>
          </button>
        );
      })}
    </div>
  );
}

function EmptyState({ icon: Icon, tone, title, children }) {
  return (
    <Card className="animate-fade-in px-6 py-10 text-center">
      <div className={clsx('mx-auto flex size-12 items-center justify-center rounded-2xl', tone)}>
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
      <div className="mt-1 text-sm text-slate-500">{children}</div>
    </Card>
  );
}

function CardSkeleton() {
  return (
    <Card className="animate-pulse p-5" aria-hidden="true">
      <div className="flex items-center gap-3">
        <div className="size-12 rounded-full bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-2/3 rounded bg-slate-200" />
          <div className="h-3 w-1/3 rounded bg-slate-200" />
        </div>
      </div>
      <div className="mt-4 h-16 rounded-xl bg-slate-100" />
      <div className="mt-4 h-8 rounded-xl bg-slate-100" />
    </Card>
  );
}

// Recordatorio de una emergencia aceptada que sigue sin resolver
function ActiveEmergencyBanner({ cases }) {
  const { active, now } = useEmergency();
  const emergencyCase = active && cases.find(c => c.id === active.caseId);
  if (!emergencyCase) return null;

  const left = Math.max(0, Math.ceil((active.deadline - now) / 1000));

  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-3 rounded-2xl bg-rose-50 p-4 text-rose-900 ring-1 ring-rose-600/20 ring-inset"
    >
      <Siren className="size-5 shrink-0 animate-pulse text-rose-600" aria-hidden="true" />
      <p className="min-w-[12rem] flex-1 text-sm">
        <span className="font-semibold">Emergencia en curso:</span> {emergencyCase.patient.name}.{' '}
        {left > 0 ? `Quedan ${formatClock(left)}.` : 'El tiempo se agotó: envía tu diagnóstico.'}
      </p>
      <Button as={Link} to={`/case/${emergencyCase.id}`} variant="danger" size="sm">
        Volver a la emergencia
      </Button>
    </div>
  );
}

export default function CaseList() {
  const { cases: allCases, status, reload } = useCases();
  const { xp, resolvedIds, promotion, dismissPromotion } = useGame();
  const [selectedDifficulty, setSelectedDifficulty] = useState('fácil');

  // Las emergencias solo llegan como alerta, no esperan en la sala
  const remaining = allCases
    .filter(c => !c.emergency)
    .filter(c => c.difficulty === selectedDifficulty)
    .filter(c => !resolvedIds.includes(c.id));
  const visible = remaining.slice(0, 2);

  let casesContent;
  if (status === 'loading') {
    casesContent = (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  } else if (status === 'error') {
    casesContent = (
      <EmptyState icon={AlertTriangle} tone="bg-rose-50 text-rose-600" title="No se pudieron cargar los casos">
        <p>Revisa tu conexión e inténtalo de nuevo.</p>
        <Button onClick={reload} className="mt-4">Reintentar</Button>
      </EmptyState>
    );
  } else if (visible.length === 0) {
    casesContent = (
      <EmptyState icon={CheckCircle2} tone="bg-emerald-50 text-emerald-600" title="¡Sala de espera vacía!">
        Completaste todos los casos de esta dificultad. Elige otra para seguir practicando.
      </EmptyState>
    );
  } else {
    casesContent = (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {visible.map(c => (
          <CaseCard key={c.id} caseItem={c} />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {promotion && <PromoModal rank={promotion} onClose={dismissPromotion} />}

      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-2 px-4 sm:gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
              <Stethoscope className="size-5" aria-hidden="true" />
            </div>
            <div className="sr-only min-w-0 leading-tight min-[380px]:not-sr-only">
              <h1 className="truncate font-semibold text-slate-900">Diagnóstico Clínico</h1>
              <p className="hidden text-xs text-slate-500 sm:block">Simulador médico interactivo</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold whitespace-nowrap text-amber-800 ring-1 ring-amber-600/20 ring-inset tabular-nums">
              <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden="true" />
              {xp} XP
            </span>
            <MusicToggle />
            <AccountMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-4 pt-6 pb-24">
        <ActiveEmergencyBanner cases={allCases} />
        <RankCard />

        <section aria-labelledby="waiting-title" className="space-y-4">
          <div className="flex items-end justify-between gap-2">
            <div>
              <h2 id="waiting-title" className="text-lg font-semibold text-slate-900">
                Sala de espera
              </h2>
              <p className="text-sm text-slate-500">Elige un paciente para comenzar la consulta</p>
            </div>
            {status === 'ready' && (
              <span className="text-sm whitespace-nowrap text-slate-500 tabular-nums">
                {remaining.length} {remaining.length === 1 ? 'restante' : 'restantes'}
              </span>
            )}
          </div>

          <DifficultyPicker value={selectedDifficulty} onChange={setSelectedDifficulty} />

          {casesContent}
        </section>
      </main>
    </div>
  );
}
