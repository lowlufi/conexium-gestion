'use client';

import { useState, useEffect } from 'react';
import {
  FolderKanban,
  CheckSquare,
  Clock,
  AlertTriangle,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { dashboardAPI, proyectosAPI, Proyecto, DashboardStats } from '@/lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, proyectosRes] = await Promise.all([
        dashboardAPI.getStats(),
        proyectosAPI.list(),
      ]);

      setStats(statsRes);
      setProyectos(proyectosRes.proyectos);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Error al cargar los datos. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats ? [
    {
      title: 'Proyectos Activos',
      value: stats.proyectosActivos,
      icon: FolderKanban,
      color: 'bg-primary',
      textColor: 'text-primary'
    },
    {
      title: 'Tareas Completadas',
      value: stats.tareasCompletadas,
      icon: CheckSquare,
      color: 'bg-success',
      textColor: 'text-success'
    },
    {
      title: 'Tareas en Progreso',
      value: stats.tareasEnProgreso,
      icon: Clock,
      color: 'bg-warning',
      textColor: 'text-warning-600'
    },
    {
      title: 'Tareas con Retraso',
      value: stats.tareasConRetraso,
      icon: AlertTriangle,
      color: 'bg-danger',
      textColor: 'text-danger'
    },
  ] : [];

  // Calcular progreso de cada proyecto
  const getProyectoProgreso = (proyecto: Proyecto) => {
    if (!proyecto.total_tareas || proyecto.total_tareas === 0) return 0;
    return Math.round((proyecto.tareas_completadas || 0) / proyecto.total_tareas * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger-50 border border-danger-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-danger" size={24} />
          <div>
            <p className="font-medium text-danger-800">{error}</p>
            <button
              onClick={loadData}
              className="mt-2 text-sm text-primary hover:underline"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

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

      {/* Proyectos */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100">
        <div className="p-6 border-b border-neutral-100">
          <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" />
            Progreso de Proyectos
          </h3>
        </div>
        <div className="p-6 space-y-4">
          {proyectos.length === 0 ? (
            <p className="text-neutral-500 text-center py-4">No hay proyectos</p>
          ) : (
            proyectos.map((proyecto) => {
              const progreso = getProyectoProgreso(proyecto);
              return (
                <div key={proyecto.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: proyecto.color }}
                      />
                      <span className="font-medium text-neutral-700">{proyecto.nombre}</span>
                      {proyecto.jefe_nombre && (
                        <span className="text-xs text-neutral-400">({proyecto.jefe_nombre})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-400">
                        {proyecto.tareas_completadas || 0}/{proyecto.total_tareas || 0} tareas
                      </span>
                      <span className="text-sm font-medium text-neutral-600">{progreso}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${progreso}%`,
                        backgroundColor: proyecto.color
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Alerta de tareas con retraso */}
      {stats && stats.tareasConRetraso > 0 && (
        <div className="bg-warning-50 border border-warning-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="text-warning-600 flex-shrink-0" size={24} />
            <div>
              <h4 className="font-semibold text-warning-800">Atención requerida</h4>
              <p className="text-warning-700 mt-1">
                Hay {stats.tareasConRetraso} tarea{stats.tareasConRetraso !== 1 ? 's' : ''} con fecha de vencimiento pasada que requiere{stats.tareasConRetraso !== 1 ? 'n' : ''} tu atención.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
