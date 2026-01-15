'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Filter,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Tarea, Proyecto } from '@/types';

interface TareaConSubtareas extends Tarea {
  subtareas?: TareaConSubtareas[];
  expanded?: boolean;
}

const demoProyectos: Proyecto[] = [
  { id: 1, nombre: 'Programa Legado', estado: 'activo', progreso: 65, color: '#218acb', responsable_id: 2, created_at: '' },
  { id: 2, nombre: 'SLEP SUR', estado: 'activo', progreso: 45, color: '#58b998', responsable_id: 3, created_at: '' },
  { id: 3, nombre: 'RFT', estado: 'activo', progreso: 30, color: '#ce95c2', responsable_id: 4, created_at: '' },
];

const demoTareas: TareaConSubtareas[] = [
  {
    id: 1,
    proyecto_id: 1,
    nombre: 'Fase de Planificación',
    estado: 'completado',
    prioridad: 'alta',
    progreso: 100,
    fecha_inicio: '2024-01-15',
    fecha_fin: '2024-02-15',
    orden: 1,
    created_at: '',
    expanded: true,
    subtareas: [
      { id: 11, proyecto_id: 1, padre_id: 1, nombre: 'Definir alcance del proyecto', estado: 'completado', prioridad: 'alta', progreso: 100, orden: 1, created_at: '' },
      { id: 12, proyecto_id: 1, padre_id: 1, nombre: 'Identificar stakeholders', estado: 'completado', prioridad: 'media', progreso: 100, orden: 2, created_at: '' },
      { id: 13, proyecto_id: 1, padre_id: 1, nombre: 'Crear cronograma inicial', estado: 'completado', prioridad: 'alta', progreso: 100, orden: 3, created_at: '' },
    ]
  },
  {
    id: 2,
    proyecto_id: 1,
    nombre: 'Fase de Ejecución',
    estado: 'en_progreso',
    prioridad: 'alta',
    progreso: 45,
    fecha_inicio: '2024-02-16',
    fecha_fin: '2024-08-31',
    orden: 2,
    created_at: '',
    expanded: true,
    subtareas: [
      { id: 21, proyecto_id: 1, padre_id: 2, nombre: 'Desarrollo de módulo A', estado: 'completado', prioridad: 'alta', progreso: 100, orden: 1, created_at: '' },
      { id: 22, proyecto_id: 1, padre_id: 2, nombre: 'Desarrollo de módulo B', estado: 'en_progreso', prioridad: 'alta', progreso: 60, orden: 2, created_at: '' },
      { id: 23, proyecto_id: 1, padre_id: 2, nombre: 'Integración de sistemas', estado: 'pendiente', prioridad: 'media', progreso: 0, orden: 3, created_at: '' },
    ]
  },
  {
    id: 3,
    proyecto_id: 1,
    nombre: 'Fase de Testing',
    estado: 'pendiente',
    prioridad: 'media',
    progreso: 0,
    fecha_inicio: '2024-09-01',
    fecha_fin: '2024-10-31',
    orden: 3,
    created_at: '',
    expanded: false,
    subtareas: [
      { id: 31, proyecto_id: 1, padre_id: 3, nombre: 'Pruebas unitarias', estado: 'pendiente', prioridad: 'alta', progreso: 0, orden: 1, created_at: '' },
      { id: 32, proyecto_id: 1, padre_id: 3, nombre: 'Pruebas de integración', estado: 'pendiente', prioridad: 'alta', progreso: 0, orden: 2, created_at: '' },
    ]
  },
];

export default function Cronograma() {
  const [selectedProyecto, setSelectedProyecto] = useState<number>(1);
  const [tareas, setTareas] = useState<TareaConSubtareas[]>(demoTareas);

  const toggleExpand = (tareaId: number) => {
    setTareas(prev => prev.map(t =>
      t.id === tareaId ? { ...t, expanded: !t.expanded } : t
    ));
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'completado': return <CheckCircle2 className="text-success" size={18} />;
      case 'en_progreso': return <Clock className="text-primary" size={18} />;
      case 'bloqueado': return <AlertCircle className="text-danger" size={18} />;
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

  const currentProyecto = demoProyectos.find(p => p.id === selectedProyecto);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={selectedProyecto}
            onChange={(e) => setSelectedProyecto(Number(e.target.value))}
            className="px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            {demoProyectos.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
          <button className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50">
            <Filter size={18} />
            Filtrar
          </button>
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
              {currentProyecto.progreso}%
            </span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all"
              style={{
                width: `${currentProyecto.progreso}%`,
                backgroundColor: currentProyecto.color
              }}
            />
          </div>
        </div>
      )}

      {/* Tasks Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-600 w-1/2">Tarea</th>
              <th className="text-left px-4 py-4 text-sm font-semibold text-neutral-600">Estado</th>
              <th className="text-left px-4 py-4 text-sm font-semibold text-neutral-600">Prioridad</th>
              <th className="text-left px-4 py-4 text-sm font-semibold text-neutral-600">Progreso</th>
              <th className="text-left px-4 py-4 text-sm font-semibold text-neutral-600">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {tareas.map((tarea) => (
              <>
                {/* Parent Task */}
                <tr key={tarea.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {tarea.subtareas && tarea.subtareas.length > 0 && (
                        <button
                          onClick={() => toggleExpand(tarea.id)}
                          className="p-1 hover:bg-neutral-200 rounded"
                        >
                          {tarea.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                      )}
                      <span className="font-medium text-neutral-800">{tarea.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(tarea.estado)}
                      <span className="text-sm capitalize">{tarea.estado.replace('_', ' ')}</span>
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
                    {tarea.fecha_fin && new Date(tarea.fecha_fin).toLocaleDateString('es-CL')}
                  </td>
                </tr>

                {/* Subtasks */}
                {tarea.expanded && tarea.subtareas?.map((subtarea) => (
                  <tr key={subtarea.id} className="hover:bg-neutral-50 bg-neutral-25">
                    <td className="px-6 py-3 pl-14">
                      <span className="text-neutral-700">{subtarea.nombre}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(subtarea.estado)}
                        <span className="text-sm capitalize">{subtarea.estado.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded ${getPriorityBadge(subtarea.prioridad)}`}>
                        {subtarea.prioridad}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-neutral-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${subtarea.progreso}%` }}
                          />
                        </div>
                        <span className="text-sm text-neutral-500">{subtarea.progreso}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-500">
                      {subtarea.fecha_fin && new Date(subtarea.fecha_fin).toLocaleDateString('es-CL')}
                    </td>
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
