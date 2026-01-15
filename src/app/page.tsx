'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import {
  Dashboard,
  Proyectos,
  Cronograma,
  Posits,
  Comunicacion,
  Alertas,
  Usuarios
} from '@/components/sections';
import { Alerta } from '@/types';

const sectionTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  proyectos: 'Proyectos',
  cronograma: 'Cronograma',
  posits: 'Posits',
  comunicacion: 'Comunicación',
  alertas: 'Alertas',
  usuarios: 'Usuarios',
  configuracion: 'Configuración',
};

// Demo alertas
const demoAlertas: Alerta[] = [
  { id: 1, usuario_id: 1, tipo: 'warning', titulo: 'Tarea próxima a vencer', mensaje: 'La tarea "Revisar documentación técnica" vence mañana', leida: false, created_at: new Date().toISOString() },
  { id: 2, usuario_id: 1, tipo: 'info', titulo: 'Nueva comunicación', mensaje: 'Chantall Huerta ha creado una nueva comunicación', leida: false, created_at: new Date().toISOString() },
];

export default function Home() {
  const { user, loading, logout } = useAuth();
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [alertas] = useState<Alerta[]>(demoAlertas);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Conexium</h1>
            <p className="text-neutral-500">Gestión de Proyectos</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            Iniciar Sesión con Google
          </button>
          <p className="text-center text-sm text-neutral-400 mt-4">
            Solo usuarios autorizados de Connexium
          </p>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'proyectos':
        return <Proyectos />;
      case 'cronograma':
        return <Cronograma />;
      case 'posits':
        return <Posits />;
      case 'comunicacion':
        return <Comunicacion />;
      case 'alertas':
        return <Alertas />;
      case 'usuarios':
        return <Usuarios />;
      case 'configuracion':
        return (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-neutral-100">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Configuración</h3>
            <p className="text-neutral-500">Próximamente...</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
        user={user}
        onLogout={logout}
      />
      <main className="ml-64">
        <Header
          title={sectionTitles[currentSection] || 'Dashboard'}
          user={user}
          alertas={alertas}
        />
        <div className="p-6">
          {renderSection()}
        </div>
      </main>
    </div>
  );
}
