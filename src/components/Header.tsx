'use client';

import { useState } from 'react';
import { Bell, Search, X } from 'lucide-react';
import { User, Alerta } from '@/types';

interface HeaderProps {
  title: string;
  user: User | null;
  alertas: Alerta[];
}

export default function Header({ title, user, alertas }: HeaderProps) {
  const [showAlertas, setShowAlertas] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = alertas.filter(a => !a.leida).length;

  const getAlertColor = (tipo: string) => {
    switch (tipo) {
      case 'danger': return 'bg-danger-100 text-danger-700 border-danger-300';
      case 'warning': return 'bg-warning-100 text-warning-700 border-warning-300';
      case 'success': return 'bg-success-100 text-success-700 border-success-300';
      default: return 'bg-primary-100 text-primary-700 border-primary-300';
    }
  };

  return (
    <header className="bg-white border-b border-neutral-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Title */}
        <h2 className="text-2xl font-semibold text-neutral-800">{title}</h2>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary w-64"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowAlertas(!showAlertas)}
              className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {showAlertas && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-neutral-200 z-50">
                <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                  <h3 className="font-semibold text-neutral-800">Notificaciones</h3>
                  <button
                    onClick={() => setShowAlertas(false)}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {alertas.length === 0 ? (
                    <p className="p-4 text-center text-neutral-500">No hay notificaciones</p>
                  ) : (
                    alertas.map((alerta) => (
                      <div
                        key={alerta.id}
                        className={`p-4 border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer ${
                          !alerta.leida ? 'bg-primary-50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`px-2 py-1 text-xs rounded border ${getAlertColor(alerta.tipo)}`}>
                            {alerta.tipo}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-neutral-800">{alerta.titulo}</p>
                            <p className="text-sm text-neutral-500 truncate">{alerta.mensaje}</p>
                            <p className="text-xs text-neutral-400 mt-1">
                              {new Date(alerta.created_at).toLocaleDateString('es-CL')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User avatar */}
          {user && (
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm">
                {user.nombre.charAt(0)}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
