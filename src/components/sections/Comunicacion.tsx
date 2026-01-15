'use client';

import { useState } from 'react';
import {
  Plus,
  MessageSquare,
  AlertTriangle,
  HelpCircle,
  RefreshCw,
  Send,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Comunicacion as ComunicacionType, ComunicacionTipo, ComunicacionEstado } from '@/types';

interface ComunicacionConRespuestas extends ComunicacionType {
  expanded?: boolean;
}

const tipoIcons: Record<ComunicacionTipo, typeof MessageSquare> = {
  reporte: MessageSquare,
  alerta: AlertTriangle,
  consulta: HelpCircle,
  actualizacion: RefreshCw,
};

const tipoColors: Record<ComunicacionTipo, string> = {
  reporte: 'bg-primary-100 text-primary-700',
  alerta: 'bg-danger-100 text-danger-700',
  consulta: 'bg-accent-100 text-accent-700',
  actualizacion: 'bg-success-100 text-success-700',
};

const estadoColors: Record<ComunicacionEstado, string> = {
  abierto: 'bg-warning-100 text-warning-700',
  en_revision: 'bg-primary-100 text-primary-700',
  resuelto: 'bg-success-100 text-success-700',
  cerrado: 'bg-neutral-100 text-neutral-600',
};

const demoComunicaciones: ComunicacionConRespuestas[] = [
  {
    id: 1,
    proyecto_id: 1,
    tipo: 'alerta',
    asunto: 'Retraso en entrega de módulo de reportes',
    mensaje: 'El módulo de reportes tiene un retraso de 3 días debido a cambios en los requerimientos del cliente. Se requiere aprobación para extender el plazo.',
    estado: 'abierto',
    creado_por: 2,
    created_at: '2024-01-15T10:30:00',
    expanded: true,
    respuestas: [
      { id: 1, comunicacion_id: 1, mensaje: 'Entendido. ¿Cuántos días adicionales necesitan?', creado_por: 1, created_at: '2024-01-15T11:00:00' },
      { id: 2, comunicacion_id: 1, mensaje: 'Estimamos 5 días hábiles adicionales para completar los cambios.', creado_por: 2, created_at: '2024-01-15T11:30:00' },
    ]
  },
  {
    id: 2,
    proyecto_id: 2,
    tipo: 'reporte',
    asunto: 'Avance semanal - Semana 3',
    mensaje: 'Se completaron las tareas planificadas para esta semana. El avance general del proyecto es del 45%. No hay bloqueantes activos.',
    estado: 'resuelto',
    creado_por: 3,
    created_at: '2024-01-14T16:00:00',
    expanded: false,
    respuestas: []
  },
  {
    id: 3,
    proyecto_id: 1,
    tipo: 'consulta',
    asunto: 'Validación de diseño de interfaz',
    mensaje: '¿Podemos agendar una reunión para validar los diseños de la nueva interfaz con el equipo de UX?',
    estado: 'en_revision',
    creado_por: 7,
    created_at: '2024-01-14T09:15:00',
    expanded: false,
    respuestas: []
  },
];

const usuarios: Record<number, string> = {
  1: 'Mariella Ruiz',
  2: 'Chantall Huerta',
  3: 'Carlos Concha',
  7: 'Luis Silva',
};

const proyectos = [
  { id: 1, nombre: 'Programa Legado' },
  { id: 2, nombre: 'SLEP SUR' },
  { id: 3, nombre: 'RFT' },
];

export default function Comunicacion() {
  const [comunicaciones, setComunicaciones] = useState<ComunicacionConRespuestas[]>(demoComunicaciones);
  const [showModal, setShowModal] = useState(false);
  const [replyText, setReplyText] = useState<Record<number, string>>({});
  const [filterTipo, setFilterTipo] = useState<ComunicacionTipo | 'todos'>('todos');
  const [filterEstado, setFilterEstado] = useState<ComunicacionEstado | 'todos'>('todos');

  const toggleExpand = (id: number) => {
    setComunicaciones(prev => prev.map(c =>
      c.id === id ? { ...c, expanded: !c.expanded } : c
    ));
  };

  const addReply = (comunicacionId: number) => {
    const text = replyText[comunicacionId];
    if (!text?.trim()) return;

    setComunicaciones(prev => prev.map(c => {
      if (c.id === comunicacionId) {
        const newReply = {
          id: (c.respuestas?.length || 0) + 1,
          comunicacion_id: comunicacionId,
          mensaje: text,
          creado_por: 1,
          created_at: new Date().toISOString()
        };
        return {
          ...c,
          respuestas: [...(c.respuestas || []), newReply]
        };
      }
      return c;
    }));

    setReplyText(prev => ({ ...prev, [comunicacionId]: '' }));
  };

  const filteredComunicaciones = comunicaciones.filter(c => {
    if (filterTipo !== 'todos' && c.tipo !== filterTipo) return false;
    if (filterEstado !== 'todos' && c.estado !== filterEstado) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value as ComunicacionTipo | 'todos')}
            className="px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            <option value="todos">Todos los tipos</option>
            <option value="reporte">Reportes</option>
            <option value="alerta">Alertas</option>
            <option value="consulta">Consultas</option>
            <option value="actualizacion">Actualizaciones</option>
          </select>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value as ComunicacionEstado | 'todos')}
            className="px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            <option value="todos">Todos los estados</option>
            <option value="abierto">Abiertos</option>
            <option value="en_revision">En revisión</option>
            <option value="resuelto">Resueltos</option>
            <option value="cerrado">Cerrados</option>
          </select>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus size={18} />
          Nueva Comunicación
        </button>
      </div>

      {/* Communications List */}
      <div className="space-y-4">
        {filteredComunicaciones.map(comunicacion => {
          const Icon = tipoIcons[comunicacion.tipo];
          const proyecto = proyectos.find(p => p.id === comunicacion.proyecto_id);

          return (
            <div key={comunicacion.id} className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
              {/* Header */}
              <div
                className="p-4 flex items-start gap-4 cursor-pointer hover:bg-neutral-50"
                onClick={() => toggleExpand(comunicacion.id)}
              >
                <div className={`p-2 rounded-lg ${tipoColors[comunicacion.tipo]}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-neutral-800">{comunicacion.asunto}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded ${estadoColors[comunicacion.estado]}`}>
                      {comunicacion.estado.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500 line-clamp-1">{comunicacion.mensaje}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-neutral-400">
                    <span>{usuarios[comunicacion.creado_por]}</span>
                    <span>{proyecto?.nombre}</span>
                    <span>{new Date(comunicacion.created_at).toLocaleDateString('es-CL')}</span>
                    {comunicacion.respuestas && comunicacion.respuestas.length > 0 && (
                      <span className="flex items-center gap-1">
                        <MessageSquare size={12} />
                        {comunicacion.respuestas.length} respuesta(s)
                      </span>
                    )}
                  </div>
                </div>
                <button className="text-neutral-400">
                  {comunicacion.expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>
              </div>

              {/* Expanded Content */}
              {comunicacion.expanded && (
                <div className="border-t border-neutral-100">
                  {/* Full Message */}
                  <div className="p-4 bg-neutral-50">
                    <p className="text-neutral-700">{comunicacion.mensaje}</p>
                  </div>

                  {/* Replies */}
                  {comunicacion.respuestas && comunicacion.respuestas.length > 0 && (
                    <div className="p-4 space-y-3">
                      {comunicacion.respuestas.map(respuesta => (
                        <div key={respuesta.id} className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                            {usuarios[respuesta.creado_por]?.charAt(0)}
                          </div>
                          <div className="flex-1 bg-neutral-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm text-neutral-800">
                                {usuarios[respuesta.creado_por]}
                              </span>
                              <span className="text-xs text-neutral-400">
                                {new Date(respuesta.created_at).toLocaleString('es-CL')}
                              </span>
                            </div>
                            <p className="text-sm text-neutral-600">{respuesta.mensaje}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Input */}
                  <div className="p-4 border-t border-neutral-100">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={replyText[comunicacion.id] || ''}
                        onChange={(e) => setReplyText(prev => ({ ...prev, [comunicacion.id]: e.target.value }))}
                        placeholder="Escribe una respuesta..."
                        className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
                        onKeyDown={(e) => e.key === 'Enter' && addReply(comunicacion.id)}
                      />
                      <button
                        onClick={() => addReply(comunicacion.id)}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredComunicaciones.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare size={48} className="mx-auto text-neutral-300 mb-4" />
          <p className="text-neutral-500">No hay comunicaciones que mostrar</p>
        </div>
      )}
    </div>
  );
}
