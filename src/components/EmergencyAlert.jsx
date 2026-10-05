// src/components/EmergencyAlert.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Siren, Star } from 'lucide-react';
import Button from './Button';
import PatientAvatar from './PatientAvatar';
import useCases from '../hooks/useCases';
import { useEmergency } from '../context/emergency-context';
import { EMERGENCY, formatClock } from '../lib/emergency';
import { getCaseXp } from '../lib/scoring';

const MISSED_NOTICE_MS = 6000;

// Alerta global de emergencia entrante (visible en cualquier pantalla)
export default function EmergencyAlert() {
  const { pending, missed, now, accept, decline } = useEmergency();
  const { cases } = useCases();
  const navigate = useNavigate();

  const pendingCase = pending && cases.find(c => c.id === pending.caseId);
  const missedCase =
    missed && now - missed.at < MISSED_NOTICE_MS && cases.find(c => c.id === missed.caseId);

  if (pendingCase) {
    const left = Math.max(0, Math.ceil((pending.expiresAt - now) / 1000));
    const pct = (left / EMERGENCY.acceptWindowSec) * 100;
    const { patient } = pendingCase;

    const handleAccept = () => {
      accept();
      navigate(`/case/${pendingCase.id}`);
    };

    return (
      <div
        role="alertdialog"
        aria-labelledby="emergency-title"
        aria-describedby="emergency-desc"
        className="fixed inset-x-4 top-20 z-40 mx-auto max-w-md animate-pop overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-2xl"
      >
        <div className="flex items-center gap-2 bg-rose-600 px-4 py-2.5 text-white">
          <Siren className="size-5 animate-pulse" aria-hidden="true" />
          <p id="emergency-title" className="font-semibold">Emergencia entrante</p>
          <span className="ml-auto text-sm font-semibold tabular-nums" aria-label={`Quedan ${left} segundos para responder`}>
            {formatClock(left)}
          </span>
        </div>
        <div className="h-1 bg-rose-100" aria-hidden="true">
          <div
            className="h-full bg-rose-500 transition-[width] duration-1000 ease-linear"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="p-4">
          <div className="flex items-center gap-3">
            <PatientAvatar patient={patient} mood="critical" />
            <div className="min-w-0">
              <h2 className="truncate font-semibold text-slate-900">{patient.name}</h2>
              <p className="text-sm text-slate-500">
                {patient.age} años · {patient.sex}
              </p>
            </div>
          </div>

          <p id="emergency-desc" className="mt-3 rounded-xl bg-rose-50 p-3 text-slate-900">
            {pendingCase.presentingComplaint}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900">
              <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden="true" />
              {getCaseXp(pendingCase)} XP
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4 text-slate-400" aria-hidden="true" />
              {formatClock(EMERGENCY.timeSec)} para resolverla
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Si no respondes a tiempo, otro equipo atenderá al paciente.
          </p>

          <div className="mt-4 flex gap-2">
            <Button variant="secondary" onClick={decline} className="flex-1">
              Ignorar
            </Button>
            <Button variant="danger" onClick={handleAccept} className="flex-1" autoFocus>
              <Siren className="size-4" aria-hidden="true" />
              Atender ya
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (missedCase) {
    return (
      <div
        role="status"
        className="fixed inset-x-4 top-20 z-40 mx-auto max-w-md animate-fade-in rounded-2xl border border-slate-200 bg-white p-4 shadow-lg"
      >
        <p className="flex items-center gap-2 text-sm text-slate-700">
          <Siren className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
          Otro equipo atendió a {missedCase.patient.name}. Pronto llegarán más emergencias.
        </p>
      </div>
    );
  }

  return null;
}
