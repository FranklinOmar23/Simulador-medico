// src/components/DifficultyBadge.jsx

import React from 'react';
import clsx from 'clsx';
import { getDifficulty } from '../lib/difficulty';

export default function DifficultyBadge({ difficulty, className }) {
  const { label, styles, Icon } = getDifficulty(difficulty);

  return (
    <span
      className={clsx(
        'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
        styles,
        className
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
