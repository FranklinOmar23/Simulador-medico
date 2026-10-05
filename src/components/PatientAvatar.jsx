// src/components/PatientAvatar.jsx

import React from 'react';
import clsx from 'clsx';
import PatientFigure from './PatientFigure';

const backgrounds = [
  'bg-sky-100',
  'bg-emerald-100',
  'bg-amber-100',
  'bg-rose-100',
  'bg-violet-100',
  'bg-teal-100'
];

const sizes = {
  sm: 'size-8',
  md: 'size-12',
  lg: 'size-16'
};

// Cabeza del personaje del paciente dentro de un círculo de color estable por nombre
export default function PatientAvatar({ patient, mood, size = 'md', className }) {
  const hash = [...patient.name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0);

  return (
    <div
      className={clsx(
        'shrink-0 overflow-hidden rounded-full',
        backgrounds[hash % backgrounds.length],
        sizes[size],
        className
      )}
    >
      <PatientFigure patient={patient} mood={mood} crop="head" className="size-full" />
    </div>
  );
}
