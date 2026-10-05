// src/components/StatusScreen.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import Button from './Button';
import Card from './Card';

export default function StatusScreen({ title, message, onRetry, icon: Icon = SearchX }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm animate-fade-in p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <Icon className="size-6" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-lg font-semibold text-slate-900">{title}</h1>
        {message && <p className="mt-1 text-sm text-slate-500">{message}</p>}
        <div className="mt-6 flex justify-center gap-2">
          {onRetry && <Button onClick={onRetry}>Reintentar</Button>}
          <Button as={Link} to="/" variant={onRetry ? 'secondary' : 'primary'}>
            Volver al inicio
          </Button>
        </div>
      </Card>
    </div>
  );
}
