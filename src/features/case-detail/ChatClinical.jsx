import React, { useState, useEffect } from 'react';

export default function ChatClinical({ caseData }) {
  const { chatFlow } = caseData;
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Al montar, enviamos el greeting
    const now = new Date().toLocaleTimeString();
    setMessages([
      { sender: 'patient', text: chatFlow.greeting, time: now }
    ]);
  }, [chatFlow.greeting]);

  const askQuestion = ({ prompt, answer }) => {
    const time1 = new Date().toLocaleTimeString();
    setMessages(msgs => [
      ...msgs,
      { sender: 'doctor', text: prompt, time: time1 }
    ]);
    // Respuesta del paciente tras 500ms
    setTimeout(() => {
      const time2 = new Date().toLocaleTimeString();
      setMessages(msgs => [
        ...msgs,
        { sender: 'patient', text: answer, time: time2 }
      ]);
    }, 500);
  };

  return (
    <div className="bg-white rounded shadow">
      <h3 className="font-medium text-lg px-4 py-2">Consulta Médica</h3>
      <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`px-4 py-2 rounded ${
                m.sender === 'doctor' ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              <p>{m.text}</p>
              <span className="text-xs text-gray-500 block text-right">
                {m.time}
              </span>
            </div>
          </div>
        ))}
      </div>
      {/* Preguntas sugeridas */}
      <div className="px-4 pb-4 space-y-2">
        {chatFlow.questions.map((q, i) => (
          <button
            key={i}
            onClick={() => askQuestion(q)}
            className="w-full text-left border border-gray-200 rounded px-3 py-2 hover:bg-gray-50"
          >
            {q.prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
