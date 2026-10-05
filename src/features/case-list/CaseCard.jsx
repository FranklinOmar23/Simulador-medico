// src/features/case-list/CaseCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Star } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import DifficultyBadge from '../../components/DifficultyBadge';
import PatientAvatar from '../../components/PatientAvatar';
import { getDifficulty } from '../../lib/difficulty';
import { getCaseXp } from '../../lib/scoring';
import { getPatientMood } from '../../lib/patientMood';

export default function CaseCard({ caseItem }) {
  const {
    id,
    difficulty = 'fácil',
    presentingComplaint,
    patient,
    specialty
  } = caseItem;

  // Tiempo estimado (el mismo que usa el temporizador del consultorio)
  const estMin = getDifficulty(difficulty).timeSec / 60;

  // XP máximo = XP del diagnóstico correcto
  const xpValue = getCaseXp(caseItem);

  return (
    <Card
      as="article"
      className="flex animate-fade-in flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <PatientAvatar patient={patient} mood={getPatientMood(caseItem)} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-slate-900">{patient.name}</h3>
          <p className="text-sm text-slate-500">
            {patient.age} años · {patient.sex}
          </p>
          {specialty && <p className="mt-0.5 text-xs font-medium text-brand-700">{specialty}</p>}
        </div>
        <DifficultyBadge difficulty={difficulty} />
      </div>

      <div className="mt-4 flex-1 rounded-xl bg-slate-50 p-3">
        <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
          Motivo de consulta
        </p>
        <p className="mt-1 text-slate-800">{presentingComplaint}</p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm whitespace-nowrap text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden="true" />
            {xpValue} XP
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4 text-slate-400" aria-hidden="true" />
            {estMin} min
          </span>
        </div>
        <Button
          as={Link}
          to={`/case/${id}`}
          size="sm"
          aria-label={`Atender a ${patient.name}`}
        >
          Atender
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </Card>
  );
}
