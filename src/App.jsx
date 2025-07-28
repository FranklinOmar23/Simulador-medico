// src/App.jsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import AppRoutes from './routes/AppRoutes';
import BackgroundMusic from './components/backgroundMusic';

export default function App() {
  return (
    <BrowserRouter>
      <GameProvider>
        <BackgroundMusic />
        <div className="min-h-screen bg-gray-100">
          <AppRoutes />
        </div>
      </GameProvider>
    </BrowserRouter>
  );
}
