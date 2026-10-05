// src/features/case-detail/DiagnosisCombobox.jsx
//
// Campo de texto con sugerencias propias (patrón "combobox" de WAI-ARIA).
// Sustituye a <datalist>, que en móviles no se muestra o se muestra mal.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import { filterDiagnosisOptions, fold } from '../../lib/diagnosisSearch';

// Resalta la parte del texto que coincide con lo escrito
function Highlight({ text, query }) {
  const q = fold(query.trim());
  const start = q ? fold(text).indexOf(q) : -1;
  if (start < 0) return text;
  return (
    <>
      {text.slice(0, start)}
      <mark className="rounded-sm bg-amber-100 text-inherit">{text.slice(start, start + q.length)}</mark>
      {text.slice(start + q.length)}
    </>
  );
}

export default function DiagnosisCombobox({
  id,
  value,
  onChange,
  options,
  placeholder,
  describedBy,
  invalid,
  className,
  required
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const blurTimer = useRef(null);

  const listId = `${id}-listbox`;
  const results = useMemo(() => filterDiagnosisOptions(options, value), [options, value]);

  // Mantener visible la opción activa al moverse con el teclado
  useEffect(() => {
    if (active < 0) return;
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  useEffect(() => () => clearTimeout(blurTimer.current), []);

  const close = () => {
    setOpen(false);
    setActive(-1);
  };

  const choose = option => {
    clearTimeout(blurTimer.current);
    onChange(option.label);
    close();
  };

  const onKeyDown = e => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive(a => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(a => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && open && active >= 0 && results[active]) {
      e.preventDefault();
      choose(results[active]);
    } else if (e.key === 'Escape' && open) {
      e.preventDefault();
      close();
    }
  };

  const expanded = open;

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={expanded && active >= 0 ? `${id}-option-${active}` : undefined}
        aria-describedby={describedBy}
        aria-invalid={invalid ? true : undefined}
        value={value}
        onChange={e => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => {
          clearTimeout(blurTimer.current);
          setOpen(true);
          // En pantallas táctiles, centrar el campo cuando aparece el teclado para que se vea la lista
          if (window.matchMedia?.('(pointer: coarse)').matches) {
            setTimeout(() => inputRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300);
          }
        }}
        // Pequeño retraso para que un toque en una opción se registre antes de cerrar (móviles)
        onBlur={() => {
          blurTimer.current = setTimeout(close, 150);
        }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        autoCapitalize="sentences"
        spellCheck={false}
        enterKeyHint="done"
        required={required}
        className={clsx(className, 'pr-10')}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label={expanded ? 'Ocultar sugerencias' : 'Mostrar sugerencias'}
        onMouseDown={e => e.preventDefault()}
        onClick={() => {
          if (expanded) close();
          else {
            setOpen(true);
            inputRef.current?.focus();
          }
        }}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-400 hover:text-slate-600"
      >
        <ChevronDown className={clsx('size-4 transition-transform', expanded && 'rotate-180')} aria-hidden="true" />
      </button>

      {expanded && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label="Diagnósticos sugeridos"
          className="absolute inset-x-0 top-full z-20 mt-1 max-h-[min(16rem,40vh)] animate-fade-in overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {results.length === 0 ? (
            <li role="presentation" className="px-3.5 py-3 text-sm text-slate-500">
              Ninguna opción coincide. Puedes enviar tu respuesta tal como la escribiste.
            </li>
          ) : (
            results.map((option, i) => (
              <li
                key={option.label}
                id={`${id}-option-${i}`}
                data-index={i}
                role="option"
                aria-selected={i === active}
                onMouseDown={e => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(option)}
                className={clsx(
                  'cursor-pointer px-3.5 py-2.5 text-sm',
                  i === active ? 'bg-brand-50 text-brand-900' : 'text-slate-800'
                )}
              >
                <Highlight text={option.label} query={value} />
                {option.matchedAlias && (
                  <span className="block text-xs text-slate-500">
                    Coincide con «<Highlight text={option.matchedAlias} query={value} />»
                  </span>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
