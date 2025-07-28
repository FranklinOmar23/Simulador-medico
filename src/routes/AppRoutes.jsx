// src/routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CaseList from '../features/case-list/CaseList';
import CaseDetail from '../features/case-detail/CaseDetail';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Pantalla inicial */}
      <Route path="/" element={<CaseList />} />

      {/* Ruta dinámica para el consultorio médico */}
      <Route path="/case/:id" element={<CaseDetail />} />
    </Routes>
  );
}
