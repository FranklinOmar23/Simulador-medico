// src/features/case-detail/ChatClinical.jsx

import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { Check, MessageCircle } from 'lucide-react';
import Card from '../../components/Card';
import PatientAvatar from '../../components/PatientAvatar';

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function ChatClinical({ caseData, disabled = false, onAsk, mood }) {
  const { chatFlow, patient } = caseData;
  const nextId = useRef(1);
  const timers = useRef([]);
  const listRef = useRef(null);

  // El componente se reinicia por caso (key en CaseDetail), así que el saludo va en el estado inicial
  const [messages, setMessages] = useState(() => [
    { id: 0, sender: 'patient', text: chatFlow.greeting, time: now() }
  ]);
  const [asked, setAsked] = useState(() => new Set());
  const [waiting, setWaiting] = useState(false);

  // Cancelar respuestas pendientes al salir de la consulta
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  // Mantener visible el último mensaje
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
  }, [messages.length, waiting]);

  const askQuestion = (index, { prompt, answer }) => {
    setAsked(prev => new Set(prev).add(index));
    onAsk?.(index);
    setWaiting(true);
    setMessages(msgs => [
      ...msgs,
      { id: nextId.current++, sender: 'doctor', text: prompt, time: now() }
    ]);
    // Respuesta del paciente tras un momento
    timers.current.push(
      setTimeout(() => {
        setMessages(msgs => [
          ...msgs,
          { id: nextId.current++, sender: 'patient', text: answer, time: now() }
        ]);
        setWaiting(false);
      }, 700)
    );
  };

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
        <MessageCircle className="size-5 text-brand-600" aria-hidden="true" />
        <h2 className="font-semibold whitespace-nowrap text-slate-900">Entrevista clínica</h2>
        <span className="ml-auto text-xs whitespace-nowrap text-slate-500 tabular-nums">
          {asked.size}/{chatFlow.questions.length} preguntas
        </span>
      </div>

      <div
        ref={listRef}
        role="log"
        aria-live="polite"
        className="h-80 space-y-3 overflow-y-auto bg-slate-50/70 px-4 py-4"
      >
        {messages.map(m =>
          m.sender === 'doctor' ? (
            <div key={m.id} className="flex animate-fade-in justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-brand-600 px-4 py-2.5 text-white shadow-xs">
                <p>{m.text}</p>
                <span className="mt-0.5 block text-right text-[11px] text-brand-100">{m.time}</span>
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex animate-fade-in items-end gap-2">
              <PatientAvatar patient={patient} mood={mood} size="sm" />
              <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-2.5 shadow-xs">
                <p className="text-slate-800">{m.text}</p>
                <span className="mt-0.5 block text-right text-[11px] text-slate-400">{m.time}</span>
              </div>
            </div>
          )
        )}

        {waiting && (
          <div className="flex items-end gap-2" aria-label={`${patient.name} está escribiendo`}>
            <PatientAvatar patient={patient} mood={mood} size="sm" />
            <div className="flex gap-1 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3.5">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="size-1.5 animate-blink rounded-full bg-slate-400"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Preguntas sugeridas: cada una se puede hacer una sola vez */}
      <div className="border-t border-slate-100 p-4">
        <p className="mb-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
          Preguntas sugeridas
        </p>
        <div className="flex flex-wrap gap-2">
          {chatFlow.questions.map((q, i) => {
            const done = asked.has(i);
            return (
              <button
                key={i}
                type="button"
                onClick={() => askQuestion(i, q)}
                disabled={disabled || waiting || done}
                className={clsx(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-left text-sm transition',
                  done
                    ? 'border-slate-200 bg-slate-50 text-slate-400'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800',
                  'disabled:cursor-not-allowed',
                  !done && 'disabled:opacity-50'
                )}
              >
                {done && <Check className="size-3.5" aria-hidden="true" />}
                {q.prompt}
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
