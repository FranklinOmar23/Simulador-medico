// src/features/case-detail/PatientCard.jsx

import React from 'react';
import clsx from 'clsx';
import { Droplets, Gauge, HeartPulse, Thermometer, Wind } from 'lucide-react';
import Card from '../../components/Card';
import PatientFigure from '../../components/PatientFigure';
import { assessVitals } from '../../lib/vitals';
import { MOOD_LABELS } from '../../lib/patientMood';

const statusStyles = {
  normal: { tile: 'bg-slate-50', icon: 'text-slate-400' },
  alarm:  { tile: 'bg-rose-50 ring-1 ring-inset ring-rose-600/15', icon: 'text-rose-500', tag: 'text-rose-700' },
  low:    { tile: 'bg-sky-50 ring-1 ring-inset ring-sky-600/15',   icon: 'text-sky-500',  tag: 'text-sky-700' }
};

function VitalTile({ icon: Icon, label, value, unit, status, alarmWhenLow = false }) {
  // Una saturación baja es una alarma, no un simple valor "bajo"
  const tone = status === 'high' || (status === 'low' && alarmWhenLow) ? 'alarm' : status;
  const s = statusStyles[tone];

  return (
    <div className={clsx('rounded-xl p-3', s.tile)}>
      <div className="flex items-start justify-between gap-1">
        <span className="text-xs leading-tight font-medium text-slate-500">{label}</span>
        <Icon className={clsx('size-4 shrink-0', s.icon)} aria-hidden="true" />
      </div>
      <p className="mt-1 flex flex-wrap items-baseline gap-x-1 tabular-nums">
        <span className="text-base font-semibold text-slate-900 sm:text-lg">{value}</span>
        <span className="text-xs text-slate-500">{unit}</span>
      </p>
      {status !== 'normal' && (
        <span className={clsx('text-xs font-medium', s.tag)}>
          {status === 'high' ? 'Elevada' : 'Baja'}
        </span>
      )}
    </div>
  );
}

const moodStyles = {
  pain:     { box: 'bg-slate-100',  chip: 'bg-slate-100 text-slate-700' },
  fever:    { box: 'bg-amber-50',   chip: 'bg-amber-100 text-amber-800' },
  critical: { box: 'bg-rose-50',    chip: 'bg-rose-100 text-rose-700' },
  relieved: { box: 'bg-emerald-50', chip: 'bg-emerald-100 text-emerald-700' },
  neutral:  { box: 'bg-sky-50',     chip: 'bg-sky-100 text-sky-700' },
  worried:  { box: 'bg-slate-100',  chip: 'bg-slate-200 text-slate-700' }
};

export default function PatientCard({ caseData, mood = 'pain' }) {
  const { patient, vitals, presentingComplaint, specialty } = caseData;
  const status = assessVitals(vitals);
  const moodStyle = moodStyles[mood];

  const tiles = [
    { key: 'temperature', icon: Thermometer, label: 'Temperatura', unit: '°C' },
    { key: 'bloodPressure', icon: Gauge, label: 'Presión', unit: 'mmHg' },
    { key: 'heartRate', icon: HeartPulse, label: 'Frec. cardíaca', unit: 'lpm' },
    { key: 'respiratoryRate', icon: Wind, label: 'Frec. respiratoria', unit: 'rpm' },
    { key: 'oxygenSaturation', icon: Droplets, label: 'Saturación O₂', unit: '%', alarmWhenLow: true }
  ].filter(t => vitals[t.key] !== undefined);

  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        {/* Personaje del paciente: su expresión cambia según su estado */}
        <div className={clsx('size-20 shrink-0 overflow-hidden rounded-2xl transition-colors duration-500 min-[400px]:size-28', moodStyle.box)}>
          <PatientFigure
            patient={patient}
            mood={mood}
            respiratoryRate={vitals.respiratoryRate}
            className="size-full"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold text-slate-900">{patient.name}</h2>
          <p className="text-sm text-slate-500">
            {patient.age} años · {patient.sex}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className={clsx('rounded-full px-2.5 py-0.5 text-xs font-medium', moodStyle.chip)}>
              {MOOD_LABELS[mood]}
            </span>
            {specialty && (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                {specialty}
              </span>
            )}
          </div>
        </div>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-brand-50 p-3">
          <dt className="text-xs font-medium tracking-wide text-brand-700 uppercase">Motivo de consulta</dt>
          <dd className="mt-1 text-slate-900">{presentingComplaint}</dd>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">Antecedentes</dt>
          <dd className="mt-1 text-slate-900">{patient.history || 'Sin antecedentes registrados'}</dd>
        </div>
      </dl>

      <h3 className="mt-5 mb-2 text-sm font-medium text-slate-500">Signos vitales</h3>
      <div className={clsx('grid gap-2 sm:gap-3', tiles.length > 3 ? 'grid-cols-2 sm:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5' : 'grid-cols-3')}>
        {tiles.map(t => (
          <VitalTile
            key={t.key}
            icon={t.icon}
            label={t.label}
            value={vitals[t.key]}
            unit={t.unit}
            status={status[t.key]}
            alarmWhenLow={t.alarmWhenLow}
          />
        ))}
      </div>
    </Card>
  );
}
