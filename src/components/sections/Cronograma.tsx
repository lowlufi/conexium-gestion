'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Filter,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Loader2,
  Calendar
} from 'lucide-react';
import { proyectosAPI, tareasAPI, Proyecto, Tarea } from '@/lib/api';

interface TareaConSubtareas extends Tarea {
  subtareas?: TareaConSubtareas[];
  expanded?: boolean;
}

export default function Cronograma() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [selectedProyecto, setSelectedProyecto] = useState<number | null>(null);
  const [tareas, setTareas] = useState<TareaConSubtareas[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTareas, setLoadingTareas] = useState(false);

  useEffect(() => {
    loadProyectos();
  }, []);

  useEffect(() => {
    if (selectedProyecto) {
      loadTareas(selectedProyecto);
    }
  }, [selectedProyecto]);

  const loadProyectos = async () => {
    try {
      setLoading(true);
      const res = await proyectosAPI.list();
      setProyectos(res.proyectos);
      if (res.proyectos.length > 0) {
        setSelectedProyecto(res.proyectos[0].id);
      }
    } catch (err) {
      console.error('Error loading proyectos:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTareas = async (proyectoId: number) => {
    try {
      setLoadingTareas(true);
      const res = await tareasAPI.listByProyecto(proyectoId);

      // Organizar tareas en jerarquía
      const tareasMap = new Map<number, TareaConSubtareas>();
      const rootTareas: TareaConSubtareas[] = [];

      res.tareas.forEach(tarea => {
        tareasMap.set(tarea.id, { ...tarea, subtareas: [], expanded: true });
      });

      res.tareas.forEach(tarea => {
        const tareaConSub = tareasMap.get(tarea.id)!;
        if (tarea.tarea_padre_id) {
          const padre = tareasMap.get(tarea.tarea_padre_id);
          if (padre) {
            padre.subtareas!.push(tareaConSub);
          } else {
            rootTareas.push(tareaConSub);
          }
        } else {
          rootTareas.push(tareaConSub);
        }
      });

      setTareas(rootTareas);
    } catch (err) {
      console.error('Error loading tareas:', err);
    } finally {
      setLoadingTareas(false);
    }
  };

  const toggleExpand = (tareaId: number) => {
    const updateTareas = (items: TareaConSubtareas[]): TareaConSubtareas[] => {
      return items.map(t => {
        if (t.id === tareaId) {
          return { ...t, expanded: !t.expanded };
        }
        if (t.subtareas) {
          return { ...t, subtareas: updateTareas(t.subtareas) };
        }
        return t;
      });
    };
    setTareas(updateTareas(tareas));
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'terminado': return <CheckCircle2 className="text-success" size={18} />;
      case 'en_progreso': return <Clock className="text-primary" size={18} />;
      case 'en_espera': return <AlertCircle className="text-warning" size={18} />;
      case 'aplazado': return <AlertCircle className="text-neutral-400" size={18} />;
      default: return <Circle className="text-neutral-400" size={18} />;
    }
  };

  const getPriorityBadge = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente': return 'bg-danger text-white';
      case 'alta': return 'bg-warning text-neutral-800';
      case 'media': return 'bg-primary-100 text-primary-700';
      default: return 'bg-neutral-100 text-neutral-600';
    }
  };

  const getEstadoLabel = (estado: string) => {
    const labels: Record<string, string> = {
      'sin_iniciar': 'Sin iniciar',
      'en_progreso': 'En progreso',
      'en_espera': 'En espera',
      'aplazado': 'Aplazado',
      'terminado': 'Terminado'
    };
    return labels[estado] || estado;
  };

  const currentProyecto = proyectos.find(p => p.id === selectedProyecto);

  const renderTarea = (tarea: TareaConSubtareas, nivel: number = 0): React.ReactNode => (
    <>
      <tr key={tarea.id} className={`hover:bg-neutral-50 ${nivel > 0 ? 'bg-neutral-25' : ''}`}>
        <td className="px-6 py-4" style={{ paddingLeft: `${24 + nivel * 24}px` }}>
          <div className="flex items-center gap-2">
            {tarea.subtareas && tarea.subtareas.length > 0 && (
              <button
                onClick={() => toggleExpand(tarea.id)}
                className="p-1 hover:bg-neutral-200 rounded"
              >
                {tarea.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            )}
            {(!tarea.subtareas || tarea.subtareas.length === 0) && <div className="w-6" />}
            <span className={`${nivel === 0 ? 'font-medium' : ''} text-neutral-800`}>
              {tarea.titulo}
            </span>
          </div>
        </td>
        <td className="px-4 py-4">
          <div className="flex items-center gap-2">
            {getStatusIcon(tarea.estado)}
            <span className="text-sm">{getEstadoLabel(tarea.estado)}</span>
          </div>
        </td>
        <td className="px-4 py-4">
          <span className={`px-2 py-1 text-xs rounded ${getPriorityBadge(tarea.prioridad)}`}>
            {tarea.prioridad}
          </span>
        </td>
        <td className="px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="w-20 bg-neutral-100 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${tarea.progreso}%` }}
              />
            </div>
            <span className="text-sm text-neutral-500">{tarea.progreso}%</span>
          </div>
        </td>
        <td className="px-4 py-4 text-sm text-neutral-500">
          {tarea.responsable_nombre || '-'}
        </td>
        <td className="px-4 py-4 text-sm text-neutral-500">
          {tarea.fecha_fin ? new Date(tarea.fecha_fin).toLocaleDateString('es-CL') : '-'}
        </td>
      </tr>
      {tarea.expanded && tarea.subtareas?.map(subtarea => renderTarea(subtarea, nivel + 1))}
    </>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={selectedProyecto || ''}
            onChange={(e) => setSelectedProyecto(Number(e.target.value))}
            className="px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            {proyectos.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors">
          <Plus size={18} />
          Nueva Tarea
        </button>
      </div>

      {/* Project Progress Bar */}
      {currentProyecto && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-neutral-800">{currentProyecto.nombre}</h3>
            <span className="text-lg font-bold" style={{ color: currentProyecto.color }}>
              {currentProyecto.total_tareas
                ? Math.round((currentProyecto.tareas_completadas || 0) / currentProyecto.total_tareas * 100)
                : 0}%
            </span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all"
              style={{
                width: `${currentProyecto.total_tareas
                  ? Math.round((currentProyecto.tareas_completadas || 0) / currentProyecto.total_tareas * 100)
                  : 0}%`,
                backgroundColor: currentProyecto.color
              }}
            />
          </div>
          <p className="text-sm text-neutral-500 mt-2">
            {currentProyecto.tareas_completadas || 0} de {currentProyecto.total_tareas || 0} tareas completadas
          </p>
        </div>
      )}

      {/* Tasks Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
        {loadingTareas ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : tareas.length === 0 ? (
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto text-neutral-300 mb-4" />
            <p className="text-neutral-500">No hay tareas en este proyecto</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-600 w-1/3">Tarea</th>
                <th className="text-left px-4 py-4 text-sm font-semibold text-neutral-600">Estado</th>
                <th className="text-left px-4 py-4 text-sm font-semibold text-neutral-600">Prioridad</th>
                <th className="text-left px-4 py-4 text-sm font-semibold text-neutral-600">Progreso</th>
                <th className="text-left px-4 py-4 text-sm font-semibold text-neutral-600">Responsable</th>
                <th className="text-left px-4 py-4 text-sm font-semibold text-neutral-600">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {tareas.map(tarea => renderTarea(tarea))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
