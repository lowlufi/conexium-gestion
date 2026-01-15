'use client';

import { useState } from 'react';
import { Bell, Check, Trash2, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { Alerta, AlertaTipo } from '@/types';

const tipoConfig: Record<AlertaTipo, { icon: typeof Info; bgColor: string; textColor: string; borderColor: string }> = {
  info: { icon: Info, bgColor: 'bg-primary-50', textColor: 'text-primary-700', borderColor: 'border-primary-200' },
  warning: { icon: AlertTriangle, bgColor: 'bg-warning-50', textColor: 'text-warning-700', borderColor: 'border-warning-200' },
  danger: { icon: XCircle, bgColor: 'bg-danger-50', textColor: 'text-danger-700', borderColor: 'border-danger-200' },
  success: { icon: CheckCircle, bgColor: 'bg-success-50', textColor: 'text-success-700', borderColor: 'border-success-200' },
};

const demoAlertas: Alerta[] = [
  { id: 1, usuario_id: 1, tipo: 'warning', titulo: 'Tarea próxima a vencer', mensaje: 'La tarea "Revisar documentación técnica" vence mañana', leida: false, enlace: '/cronograma', created_at: '2024-01-15T10:00:00' },
  { id: 2, usuario_id: 1, tipo: 'info', titulo: 'Nueva comunicación', mensaje: 'Chantall Huerta ha creado una nueva comunicación en Programa Legado', leida: false, enlace: '/comunicacion', created_at: '2024-01-15T09:30:00' },
  { id: 3, usuario_id: 1, tipo: 'success', titulo: 'Tarea completada', mensaje: 'Carlos Concha ha completado la tarea "Actualizar cronograma"', leida: true, created_at: '2024-01-14T16:00:00' },
  { id: 4, usuario_id: 1, tipo: 'danger', titulo: 'Tarea atrasada', mensaje: 'La tarea "Entrega de informe mensual" está atrasada por 2 días', leida: false, enlace: '/cronograma', created_at: '2024-01-14T08:00:00' },
  { id: 5, usuario_id: 1, tipo: 'info', titulo: 'Nuevo posit asignado', mensaje: 'Mariella Ruiz te ha asignado un nuevo posit urgente', leida: true, enlace: '/posits', created_at: '2024-01-13T14:00:00' },
];

export default function Alertas() {
  const [alertas, setAlertas] = useState<Alerta[]>(demoAlertas);
  const [filter, setFilter] = useState<'todas' | 'no_leidas' | 'leidas'>('todas');

  const markAsRead = (id: number) => {
    setAlertas(prev => prev.map(a =>
      a.id === id ? { ...a, leida: true } : a
    ));
  };

  const markAllAsRead = () => {
    setAlertas(prev => prev.map(a => ({ ...a, leida: true })));
  };

  const deleteAlerta = (id: number) => {
    setAlertas(prev => prev.filter(a => a.id !== id));
  };

  const filteredAlertas = alertas.filter(a => {
    if (filter === 'no_leidas') return !a.leida;
    if (filter === 'leidas') return a.leida;
    return true;
  });

  const unreadCount = alertas.filter(a => !a.leida).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            <option value="todas">Todas ({alertas.length})</option>
            <option value="no_leidas">No leídas ({unreadCount})</option>
            <option value="leidas">Leídas ({alertas.length - unreadCount})</option>
          </select>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Check size={18} />
            Marcar todas como leídas
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {(['info', 'warning', 'danger', 'success'] as AlertaTipo[]).map(tipo => {
          const config = tipoConfig[tipo];
          const Icon = config.icon;
          const count = alertas.filter(a => a.tipo === tipo).length;

          return (
            <div key={tipo} className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4`}>
              <div className="flex items-center gap-3">
                <Icon className={config.textColor} size={24} />
                <div>
                  <p className="text-2xl font-bold text-neutral-800">{count}</p>
                  <p className="text-sm text-neutral-500 capitalize">{tipo === 'danger' ? 'Críticas' : tipo === 'warning' ? 'Advertencias' : tipo === 'success' ? 'Éxito' : 'Información'}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 divide-y divide-neutral-100">
        {filteredAlertas.length === 0 ? (
          <div className="p-8 text-center">
            <Bell size={48} className="mx-auto text-neutral-300 mb-4" />
            <p className="text-neutral-500">No hay alertas que mostrar</p>
          </div>
        ) : (
          filteredAlertas.map(alerta => {
            const config = tipoConfig[alerta.tipo];
            const Icon = config.icon;

            return (
              <div
                key={alerta.id}
                className={`p-4 flex items-start gap-4 hover:bg-neutral-50 transition-colors ${
                  !alerta.leida ? 'bg-primary-50/30' : ''
                }`}
              >
                <div className={`p-2 rounded-lg ${config.bgColor}`}>
                  <Icon className={config.textColor} size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-medium ${!alerta.leida ? 'text-neutral-800' : 'text-neutral-600'}`}>
                      {alerta.titulo}
                    </h3>
                    {!alerta.leida && (
                      <span className="w-2 h-2 bg-primary rounded-full" />
                    )}
                  </div>
                  <p className="text-sm text-neutral-500 mt-1">{alerta.mensaje}</p>
                  <p className="text-xs text-neutral-400 mt-2">
                    {new Date(alerta.created_at).toLocaleString('es-CL')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!alerta.leida && (
                    <button
                      onClick={() => markAsRead(alerta.id)}
                      className="p-2 text-neutral-400 hover:text-primary hover:bg-primary-50 rounded-lg transition-colors"
                      title="Marcar como leída"
                    >
                      <Check size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteAlerta(alerta.id)}
                    className="p-2 text-neutral-400 hover:text-danger hover:bg-danger-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
