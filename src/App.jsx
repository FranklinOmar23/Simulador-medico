// src/App.jsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <GameProvider>
        <div className="min-h-screen bg-gray-100">
          <AppRoutes />
        </div>
      </GameProvider>
    </BrowserRouter>
  );
}
