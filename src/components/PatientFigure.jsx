// src/components/PatientFigure.jsx

import React from 'react';
import { MOOD_LABELS } from '../lib/patientMood';

const SKIN_TONES = ['#f6d5c0', '#eec1a0', '#d9a07a', '#b97a56', '#8d5a3b'];
const HAIR_COLORS = ['#2b1d16', '#4a3020', '#7a4b2a', '#b5823c', '#1c1c1c'];
const GRAY_HAIR = '#cfd2d6';
const GOWN = '#bcdcf0';
const GOWN_DOTS = '#93c3e2';
const PALE = '#c9d0d8';

// Hash estable por nombre: el mismo paciente siempre tiene el mismo aspecto
const hashOf = text => [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

// Mezcla dos colores hex (t = 0 → a, t = 1 → b)
function mix(a, b, t) {
  const pa = a.match(/\w\w/g).map(x => parseInt(x, 16));
  const pb = b.match(/\w\w/g).map(x => parseInt(x, 16));
  return `#${pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
}

function Eyes({ mood }) {
  const ink = '#2b2b2b';
  const line = { stroke: ink, strokeWidth: 2.2, strokeLinecap: 'round', fill: 'none' };

  if (mood === 'critical') {
    // Ojos apretados por el sufrimiento
    return (
      <g {...line}>
        <path d="M45 47 L52 50 L45 53" />
        <path d="M75 47 L68 50 L75 53" />
      </g>
    );
  }
  if (mood === 'relieved') {
    return (
      <g {...line}>
        <path d="M45 51 Q49 46.5 53 51" />
        <path d="M67 51 Q71 46.5 75 51" />
      </g>
    );
  }
  if (mood === 'fever') {
    // Párpados caídos
    return (
      <g>
        <g className="patient-blink">
          <circle cx="49" cy="51" r="2.4" fill={ink} />
          <circle cx="71" cy="51" r="2.4" fill={ink} />
        </g>
        <g {...line} strokeWidth="1.8">
          <path d="M45 49 Q49 48 53 49.5" />
          <path d="M67 49.5 Q71 48 75 49" />
        </g>
      </g>
    );
  }
  return (
    <g className="patient-blink">
      <circle cx="49" cy="50" r="2.6" fill={ink} />
      <circle cx="71" cy="50" r="2.6" fill={ink} />
      <circle cx="49.9" cy="49.1" r="0.8" fill="#fff" />
      <circle cx="71.9" cy="49.1" r="0.8" fill="#fff" />
    </g>
  );
}

function Brows({ mood, color }) {
  const line = { stroke: color, strokeWidth: 2.4, strokeLinecap: 'round', fill: 'none' };
  // Cejas con el extremo interior levantado = preocupación o dolor
  const paths = {
    pain:     ['M43 43 L54 39.5', 'M77 43 L66 39.5'],
    worried:  ['M43 43 L54 39',   'M77 43 L66 39'],
    critical: ['M43 42 L54 38',   'M77 42 L66 38'],
    fever:    ['M43 42.5 L54 40.5', 'M77 42.5 L66 40.5'],
    relieved: ['M43 41 Q48 38 54 40', 'M77 41 Q72 38 66 40'],
    neutral:  ['M43 41 L54 41',   'M77 41 L66 41']
  }[mood];
  return (
    <g {...line}>
      <path d={paths[0]} />
      <path d={paths[1]} />
    </g>
  );
}

function Mouth({ mood, lips }) {
  const line = { stroke: lips, strokeWidth: 2.2, strokeLinecap: 'round', fill: 'none' };
  switch (mood) {
    case 'relieved':
      return <path {...line} d="M51 68 Q60 75 69 68" />;
    case 'neutral':
      return <path {...line} d="M54 70 L66 70" />;
    case 'critical':
      return <ellipse cx="60" cy="71" rx="4.5" ry="4" fill="#7a2e2e" stroke={lips} strokeWidth="1.5" />;
    case 'fever':
      return <path {...line} d="M54 71 Q60 68.5 66 71" />;
    default:
      return <path {...line} d="M52 72 Q60 66.5 68 72" />;
  }
}

/**
 * Personaje ilustrado del paciente.
 * crop="head" muestra solo la cabeza (para avatares pequeños).
 */
export default function PatientFigure({ patient, mood = 'pain', respiratoryRate, crop, className, title }) {
  const hash = hashOf(patient.name);
  const isFemale = patient.sex === 'Femenino';
  const senior = patient.age >= 60;
  const middleAged = patient.age >= 45 && !senior;

  const baseSkin = SKIN_TONES[hash % SKIN_TONES.length];
  const skin = mood === 'critical' ? mix(baseSkin, PALE, 0.45) : baseSkin;
  const skinShade = mix(skin, '#000000', 0.12);
  const hair = senior ? GRAY_HAIR : middleAged && hash % 2 ? mix(HAIR_COLORS[hash % HAIR_COLORS.length], GRAY_HAIR, 0.35) : HAIR_COLORS[hash % HAIR_COLORS.length];
  const browColor = senior ? '#9aa0a6' : mix(hair, '#000000', 0.2);
  const lips = mood === 'critical' ? '#5b6fa8' : mix(skin, '#7a2e2e', 0.55);
  const hasBeard = !isFemale && patient.age >= 25 && hash % 3 === 0;
  const longHair = isFemale && !senior;

  // Respira al ritmo de su frecuencia respiratoria real
  const breathSec = respiratoryRate ? Math.min(Math.max(60 / respiratoryRate, 1.2), 6) : 4;
  const label = title ?? `${patient.name}, ${patient.age} años, ${MOOD_LABELS[mood].toLowerCase()}`;

  return (
    <svg
      viewBox={crop === 'head' ? '24 14 72 72' : '8 12 104 118'}
      preserveAspectRatio="xMidYMax meet"
      className={className}
      role="img"
      aria-label={label}
    >
      <g className="patient-breathe" style={{ animationDuration: `${breathSec}s` }}>
        {/* Pelo largo por detrás de la cabeza */}
        {longHair && (
          <path d="M30 54 C27 30 42 17 60 17 C78 17 93 30 90 54 L93 96 C80 102 40 102 27 96 Z" fill={hair} />
        )}
        {isFemale && senior && (
          <path d="M31 56 C29 32 43 19 60 19 C77 19 91 32 89 56 L88 74 C80 78 40 78 32 74 Z" fill={hair} />
        )}

        {/* Cuerpo con bata de hospital */}
        <path d="M12 130 C12 104 33 93 60 93 C87 93 108 104 108 130 Z" fill={GOWN} />
        <g fill={GOWN_DOTS}>
          {[[26, 112], [40, 104], [36, 122], [84, 104], [96, 116], [80, 122], [58, 124]].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" />
          ))}
        </g>
        <path d="M49 93 L60 109 L71 93 Z" fill={skin} />
        <rect x="50" y="76" width="20" height="21" rx="7" fill={skin} />
        <path d="M50 84 Q60 90 70 84 L70 80 L50 80 Z" fill={skinShade} opacity="0.35" />

        {/* Cabeza */}
        <circle cx="34.5" cy="56" r="5" fill={skin} />
        <circle cx="85.5" cy="56" r="5" fill={skin} />
        <ellipse cx="60" cy="54" rx="26" ry="30" fill={skin} />

        {/* Arrugas */}
        {(senior || middleAged) && (
          <g stroke={skinShade} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity={senior ? 0.9 : 0.5}>
            <path d="M51 33 Q60 31 69 33" />
            {senior && <path d="M53 36.5 Q60 35 67 36.5" />}
            {senior && <path d="M40 52 L37.5 53.5 M80 52 L82.5 53.5" />}
          </g>
        )}

        {/* Pelo por delante */}
        {isFemale ? (
          <path
            d={senior
              ? 'M35 46 C35 30 47 23 60 23 C74 23 86 30 85 46 C80 37 70 33 60 34 C50 33 40 37 35 46 Z'
              : 'M34 50 C33 30 47 21 62 23 C77 24 88 34 86 50 C79 39 67 35 55 39 C47 41 39 45 34 50 Z'}
            fill={hair}
          />
        ) : senior ? (
          <g fill={hair}>
            <path d="M34.5 54 C33 45 35 39 40 36 L41 50 Z" />
            <path d="M85.5 54 C87 45 85 39 80 36 L79 50 Z" />
          </g>
        ) : (
          <path d="M34 51 C32 30 44 21 60 21 C76 21 88 30 86 51 C84 41 77 35 60 35 C45 35 37 41 34 51 Z" fill={hair} />
        )}

        {hasBeard && (
          <path
            d="M36 60 C38 80 49 88 60 88 C71 88 82 80 84 60 C80 71 72 76 60 76 C48 76 40 71 36 60 Z M52 66 Q60 63 68 66 L67 68 Q60 66 53 68 Z"
            fill={hair}
          />
        )}

        <Brows mood={mood} color={browColor} />
        <Eyes mood={mood} />

        {/* Nariz */}
        <path d="M60 53 Q57 59.5 60.5 61.5" stroke={skinShade} strokeWidth="1.6" strokeLinecap="round" fill="none" />

        {/* Mejillas: rojas con fiebre, rosadas al estar aliviado */}
        {(mood === 'fever' || mood === 'relieved') && (
          <g fill={mood === 'fever' ? '#ff5a5a' : '#ff8fa3'} opacity={mood === 'fever' ? 0.45 : 0.3}>
            <ellipse cx="43" cy="62" rx="6" ry="3.5" />
            <ellipse cx="77" cy="62" rx="6" ry="3.5" />
          </g>
        )}

        <Mouth mood={mood} lips={lips} />

        {/* Gafas en personas mayores */}
        {senior && (
          <g stroke="#3f3f46" strokeWidth="1.6" fill="#ffffff" fillOpacity="0.12">
            <circle cx="49" cy="50" r="7" />
            <circle cx="71" cy="50" r="7" />
            <path d="M56 50 Q60 48 64 50" fill="none" />
          </g>
        )}

        {/* Sudor con fiebre o en estado grave */}
        {(mood === 'fever' || mood === 'critical') && (
          <g fill="#7cc6f2">
            <path className="patient-sweat" d="M84 36 C81 40 81 43 84 44 C87 43 87 40 84 36 Z" />
            <path className="patient-sweat" style={{ animationDelay: '1.2s' }} d="M37 39 C35 42 35 44.5 37 45.5 C39 44.5 39 42 37 39 Z" />
          </g>
        )}
      </g>
    </svg>
  );
}
