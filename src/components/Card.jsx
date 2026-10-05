// src/components/Card.jsx

import React from 'react';
import clsx from 'clsx';

export default function Card({ as: Component = 'div', className, ...props }) {
  return (
    <Component
      className={clsx('rounded-2xl border border-slate-200/80 bg-white shadow-xs', className)}
      {...props}
    />
  );
}
