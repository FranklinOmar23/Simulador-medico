// src/App.jsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { CasesProvider } from './context/CasesContext';
import { EmergencyProvider } from './context/EmergencyContext';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import BackgroundMusic from './components/BackgroundMusic';
import EmergencyAlert from './components/EmergencyAlert';

export default function App() {
  return (
    <BrowserRouter>
      <CasesProvider>
        <GameProvider>
          <AuthProvider>
            <EmergencyProvider>
              <BackgroundMusic>
                <EmergencyAlert />
                <AppRoutes />
              </BackgroundMusic>
            </EmergencyProvider>
          </AuthProvider>
        </GameProvider>
      </CasesProvider>
    </BrowserRouter>
  );
}
