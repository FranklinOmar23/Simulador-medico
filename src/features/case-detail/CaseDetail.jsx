// src/features/case-detail/CaseDetail.jsx

import React, { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import clsx from 'clsx';
import { AlertTriangle, ClipboardCheck, Clock, FlaskConical, Loader2, Siren } from 'lucide-react';
import ConsultationHeader from './ConsultationHeader';
import PatientCard from './PatientCard';
import ChatClinical from './ChatClinical';
import TestPanel from './TestPanel';
import DiagnosisForm from './DiagnosisForm';
import CaseReview from './CaseReview';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StatusScreen from '../../components/StatusScreen';
import useCase from '../../hooks/useCase';
import useCountdown from '../../hooks/useCountdown';
import { useGame } from '../../context/game-context';
import { getDifficulty } from '../../lib/difficulty';
import { useEmergency } from '../../context/emergency-context';
import { EMERGENCY } from '../../lib/emergency';
import { getPatientMood } from '../../lib/patientMood';

const TABS = [
  { id: 'Pruebas', Icon: FlaskConical },
  { id: 'Diagnóstico', Icon: ClipboardCheck }
];

export default function CaseDetail() {
  const { id } = useParams();
  const { caseData, status, reload } = useCase(id);
  const { resolvedIds } = useGame();
  const { active } = useEmergency();

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-slate-500">
        <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        Cargando caso...
      </div>
    );
  }

  if (status === 'error') {
    return (
      <StatusScreen
        icon={AlertTriangle}
        title="No se pudo cargar el caso"
        message="Revisa tu conexión e inténtalo de nuevo."
        onRetry={reload}
      />
    );
  }

  if (!caseData) {
    return (
      <StatusScreen
        title="Caso no encontrado"
        message={`No existe un caso con el identificador "${id}".`}
      />
    );
  }

  // Una emergencia solo se atiende si se aceptó la alerta (o para repasarla después)
  if (caseData.emergency && !resolvedIds.includes(caseData.id) && active?.caseId !== caseData.id) {
    return (
      <StatusScreen
        icon={Siren}
        title="Emergencia no disponible"
        message="Las emergencias solo se pueden atender cuando llega su alerta. Estate atento en la sala de espera."
      />
    );
  }

  // La key reinicia todo el estado de la consulta al cambiar de caso
  return <Consultation key={caseData.id} caseData={caseData} />;
}

function Consultation({ caseData }) {
  const { patient, difficulty } = caseData;
  const { resolvedIds } = useGame();
  const completed = resolvedIds.includes(caseData.id);

  const [activeTab, setActiveTab] = useState('Pruebas');

  // Lo que hizo el estudiante en esta consulta, para puntuar y para la revisión
  const [orderedTestIds, setOrderedTestIds] = useState([]);
  const [askedQuestions, setAskedQuestions] = useState([]);
  const [result, setResult] = useState(null);
  const [submittedAt, setSubmittedAt] = useState(null);

  // Emergencia: el reloj depende de la hora límite fijada al aceptarla,
  // así que no se reinicia al salir y volver ni al recargar la página
  const { active, now } = useEmergency();
  const [emergencyDeadline] = useState(() =>
    active?.caseId === caseData.id ? active.deadline : null
  );
  const isEmergency = emergencyDeadline !== null;

  // El reloj corre solo mientras el caso no se haya enviado
  const totalTime = isEmergency ? EMERGENCY.timeSec : getDifficulty(difficulty).timeSec;
  const countdown = useCountdown(totalTime, !completed && !isEmergency);
  const timeLeft = isEmergency
    ? Math.max(0, Math.ceil((emergencyDeadline - (submittedAt ?? now)) / 1000))
    : countdown;
  const timeUp = timeLeft === 0 && !completed;

  // En móvil y tablet el panel queda debajo del chat: la barra inferior lleva directo a él
  const panelRef = useRef(null);
  // Con el teclado del móvil abierto, la barra inferior estorba: se oculta mientras se escribe
  const [typing, setTyping] = useState(false);
  const isTextField = el => el.matches?.('input, textarea');
  const goToPanel = tab => {
    setActiveTab(tab);
    panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = evaluation => {
    setResult(evaluation);
    setSubmittedAt(Date.now());
  };

  // Con el tiempo agotado solo queda enviar el diagnóstico
  const visibleTab = timeUp ? 'Diagnóstico' : activeTab;

  // Expresión del personaje: según sus constantes, y según el resultado al terminar
  const mood = getPatientMood(caseData, result?.category);

  return (
    <div className="min-h-screen">
      <ConsultationHeader
        patientName={patient.name}
        difficulty={difficulty}
        timeLeft={timeLeft}
        totalTime={totalTime}
        completed={completed}
        emergency={isEmergency}
      />

      <main
        className="mx-auto max-w-6xl px-4 pt-6 pb-24"
        onFocusCapture={e => isTextField(e.target) && setTyping(true)}
        onBlurCapture={e => isTextField(e.target) && setTyping(false)}
      >
        {isEmergency && !completed && !timeUp && (
          <div
            role="note"
            className="mb-6 flex items-start gap-3 rounded-2xl bg-rose-50 p-4 text-rose-800 ring-1 ring-rose-600/20 ring-inset"
          >
            <Siren className="mt-0.5 size-5 shrink-0 animate-pulse" aria-hidden="true" />
            <p>
              <span className="font-semibold">Emergencia.</span> El paciente está inestable: actúa
              rápido y pide solo las pruebas que cambien tu decisión.
            </p>
          </div>
        )}

        {timeUp && (
          <div
            role="alert"
            className="mb-6 flex animate-fade-in items-start gap-3 rounded-2xl bg-rose-50 p-4 text-rose-800 ring-1 ring-rose-600/20 ring-inset"
          >
            <Clock className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <p>
              <span className="font-semibold">
                {isEmergency ? 'El paciente se está agravando.' : 'Tiempo agotado.'}
              </span>{' '}
              Envía tu diagnóstico: el XP obtenido se reducirá a la mitad.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          {/* Panel izquierdo: paciente y entrevista */}
          <div className="space-y-6">
            <PatientCard caseData={caseData} mood={mood} />
            <ChatClinical
              mood={mood}
              caseData={caseData}
              disabled={timeUp}
              onAsk={index => setAskedQuestions(prev => [...prev, index])}
            />
          </div>

          {/* Panel derecho: pruebas y diagnóstico */}
          <Card ref={panelRef} className="scroll-mt-20 overflow-hidden lg:sticky lg:top-24">
            <div role="tablist" className="m-3 mb-0 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
              {TABS.map(({ id, Icon }) => {
                const selected = visibleTab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    id={`tab-${id}`}
                    aria-selected={selected}
                    aria-controls={`panel-${id}`}
                    disabled={timeUp && id !== 'Diagnóstico'}
                    onClick={() => setActiveTab(id)}
                    className={clsx(
                      'inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition disabled:opacity-40',
                      selected ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {id}
                  </button>
                );
              })}
            </div>

            {/* Ambos paneles quedan montados para no perder resultados ni texto */}
            <div
              role="tabpanel"
              id="panel-Pruebas"
              aria-labelledby="tab-Pruebas"
              hidden={visibleTab !== 'Pruebas'}
              className="p-4"
            >
              <TestPanel
                caseData={caseData}
                disabled={timeUp}
                onOrder={testId => setOrderedTestIds(prev => [...prev, testId])}
              />
            </div>
            <div
              role="tabpanel"
              id="panel-Diagnóstico"
              aria-labelledby="tab-Diagnóstico"
              hidden={visibleTab !== 'Diagnóstico'}
              className="p-4"
            >
              <DiagnosisForm
                caseData={caseData}
                timeUp={timeUp}
                completed={completed}
                orderedTestIds={orderedTestIds}
                result={result}
                onSubmit={handleSubmit}
              />
            </div>
          </Card>
        </div>

        {/* Explicación docente al terminar (también al volver a un caso ya completado) */}
        {completed && (
          <div className="mt-6">
            <CaseReview
              caseData={caseData}
              session={result ? { orderedTestIds, askedQuestions, result } : null}
            />
          </div>
        )}
      </main>

      {!completed && !typing && (
        <nav
          aria-label="Acciones de la consulta"
          className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-slate-200 bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden"
        >
          <Button
            variant="secondary"
            className="flex-1"
            disabled={timeUp}
            onClick={() => goToPanel('Pruebas')}
          >
            <FlaskConical className="size-4" aria-hidden="true" />
            Pruebas
          </Button>
          <Button className="flex-1" onClick={() => goToPanel('Diagnóstico')}>
            <ClipboardCheck className="size-4" aria-hidden="true" />
            Diagnóstico
          </Button>
        </nav>
      )}
    </div>
  );
}
