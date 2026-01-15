'use client';

import { useState, useEffect } from 'react';
import {
  FolderKanban,
  CheckSquare,
  StickyNote,
  MessageSquare,
  TrendingUp,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Proyecto, Tarea, Posit, DashboardStats } from '@/types';

// Datos de demo
const demoStats: DashboardStats = {
  proyectos_activos: 3,
  tareas_pendientes: 12,
  posits_urgentes: 5,
  comunicaciones_abiertas: 2,
};

const demoProyectos: Proyecto[] = [
  {
    id: 1,
    nombre: 'Programa Legado',
    descripcion: 'Implementación del programa de legado educativo',
    estado: 'activo',
    progreso: 65,
    color: '#218acb',
    responsable_id: 2,
    created_at: '2024-01-01',
  },
  {
    id: 2,
    nombre: 'SLEP SUR',
    descripcion: 'Proyecto SLEP zona sur',
    estado: 'activo',
    progreso: 45,
    color: '#58b998',
    responsable_id: 3,
    created_at: '2024-01-01',
  },
  {
    id: 3,
    nombre: 'RFT',
    descripcion: 'Proyecto RFT',
    estado: 'activo',
    progreso: 30,
    color: '#ce95c2',
    responsable_id: 4,
    created_at: '2024-01-01',
  },
];

const demoTareasRecientes: Tarea[] = [
  { id: 1, proyecto_id: 1, nombre: 'Revisar documentación técnica', estado: 'pendiente', prioridad: 'alta', progreso: 0, orden: 1, created_at: '2024-01-10' },
  { id: 2, proyecto_id: 1, nombre: 'Reunión con stakeholders', estado: 'en_progreso', prioridad: 'media', progreso: 50, orden: 2, created_at: '2024-01-10' },
  { id: 3, proyecto_id: 2, nombre: 'Actualizar cronograma', estado: 'pendiente', prioridad: 'urgente', progreso: 0, orden: 1, created_at: '2024-01-11' },
];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>(demoStats);
  const [proyectos, setProyectos] = useState<Proyecto[]>(demoProyectos);
  const [tareasRecientes, setTareasRecientes] = useState<Tarea[]>(demoTareasRecientes);
  const [loading, setLoading] = useState(false);

  const statCards = [
    {
      title: 'Proyectos Activos',
      value: stats.proyectos_activos,
      icon: FolderKanban,
      color: 'bg-primary',
      textColor: 'text-primary'
    },
    {
      title: 'Tareas Pendientes',
      value: stats.tareas_pendientes,
      icon: CheckSquare,
      color: 'bg-warning',
      textColor: 'text-warning-600'
    },
    {
      title: 'Posits Urgentes',
      value: stats.posits_urgentes,
      icon: StickyNote,
      color: 'bg-danger',
      textColor: 'text-danger'
    },
    {
      title: 'Comunicaciones Abiertas',
      value: stats.comunicaciones_abiertas,
      icon: MessageSquare,
      color: 'bg-success',
      textColor: 'text-success'
    },
  ];

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente': return 'bg-danger text-white';
      case 'alta': return 'bg-warning text-neutral-800';
      case 'media': return 'bg-primary text-white';
      default: return 'bg-neutral-200 text-neutral-600';
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'completado': return 'text-success';
      case 'en_progreso': return 'text-primary';
      case 'bloqueado': return 'text-danger';
      default: return 'text-neutral-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-500 text-sm">{stat.title}</p>
                  <p className={`text-3xl font-bold mt-1 ${stat.textColor}`}>{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Proyectos */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-100">
          <div className="p-6 border-b border-neutral-100">
            <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" />
              Progreso de Proyectos
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {proyectos.map((proyecto) => (
              <div key={proyecto.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-700">{proyecto.nombre}</span>
                  <span className="text-sm text-neutral-500">{proyecto.progreso}%</span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${proyecto.progreso}%`,
                      backgroundColor: proyecto.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tareas Recientes */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-100">
          <div className="p-6 border-b border-neutral-100">
            <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
              <Clock size={20} className="text-warning" />
              Tareas Recientes
            </h3>
          </div>
          <div className="divide-y divide-neutral-100">
            {tareasRecientes.map((tarea) => (
              <div key={tarea.id} className="p-4 hover:bg-neutral-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-neutral-700">{tarea.nombre}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 text-xs rounded ${getPriorityColor(tarea.prioridad)}`}>
                        {tarea.prioridad}
                      </span>
                      <span className={`text-xs ${getStatusColor(tarea.estado)}`}>
                        {tarea.estado.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alertas */}
      <div className="bg-warning-50 border border-warning-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <AlertTriangle className="text-warning-600 flex-shrink-0" size={24} />
          <div>
            <h4 className="font-semibold text-warning-800">Atención requerida</h4>
            <p className="text-warning-700 mt-1">
              Hay 3 tareas con fecha de vencimiento próxima que requieren tu atención.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
