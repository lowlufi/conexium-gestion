'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  MessageSquare,
  AlertTriangle,
  HelpCircle,
  RefreshCw,
  Send,
  X,
  ChevronDown,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { comunicacionesAPI, Comunicacion as ComunicacionType, ComunicacionRespuesta } from '@/lib/api';

interface ComunicacionConRespuestas extends ComunicacionType {
  expanded?: boolean;
}

const tipoIcons: Record<string, typeof MessageSquare> = {
  desviacion: AlertTriangle,
  consulta: HelpCircle,
  actualizacion: RefreshCw,
  alerta: AlertTriangle,
};

const tipoColors: Record<string, string> = {
  desviacion: 'bg-danger-100 text-danger-700',
  consulta: 'bg-accent-100 text-accent-700',
  actualizacion: 'bg-success-100 text-success-700',
  alerta: 'bg-warning-100 text-warning-700',
};

const tipoLabels: Record<string, string> = {
  desviacion: 'Desviación',
  consulta: 'Consulta',
  actualizacion: 'Actualización',
  alerta: 'Alerta',
};

export default function Comunicacion() {
  const [comunicaciones, setComunicaciones] = useState<ComunicacionConRespuestas[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<Record<number, string>>({});
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [sendingReply, setSendingReply] = useState<number | null>(null);

  useEffect(() => {
    loadComunicaciones();
  }, []);

  const loadComunicaciones = async () => {
    try {
      setLoading(true);
      const res = await comunicacionesAPI.list();
      setComunicaciones(res.comunicaciones.map(c => ({ ...c, expanded: false })));
    } catch (err) {
      console.error('Error loading comunicaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = async (id: number) => {
    const comunicacion = comunicaciones.find(c => c.id === id);
    if (comunicacion && !comunicacion.expanded && !comunicacion.respuestas) {
      // Cargar respuestas al expandir por primera vez
      try {
        const res = await comunicacionesAPI.get(id);
        setComunicaciones(prev => prev.map(c =>
          c.id === id ? { ...c, expanded: true, respuestas: res.respuestas } : c
        ));
      } catch (err) {
        console.error('Error loading respuestas:', err);
      }
    } else {
      setComunicaciones(prev => prev.map(c =>
        c.id === id ? { ...c, expanded: !c.expanded } : c
      ));
    }
  };

  const addReply = async (comunicacionId: number) => {
    const text = replyText[comunicacionId];
    if (!text?.trim()) return;

    try {
      setSendingReply(comunicacionId);
      await comunicacionesAPI.addRespuesta(comunicacionId, text);

      // Recargar respuestas
      const res = await comunicacionesAPI.get(comunicacionId);
      setComunicaciones(prev => prev.map(c =>
        c.id === comunicacionId ? { ...c, respuestas: res.respuestas } : c
      ));

      setReplyText(prev => ({ ...prev, [comunicacionId]: '' }));
    } catch (err) {
      console.error('Error adding reply:', err);
    } finally {
      setSendingReply(null);
    }
  };

  const filteredComunicaciones = comunicaciones.filter(c => {
    if (filterTipo !== 'todos' && c.tipo !== filterTipo) return false;
    return true;
  });

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
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            <option value="todos">Todos los tipos</option>
            <option value="desviacion">Desviaciones</option>
            <option value="consulta">Consultas</option>
            <option value="actualizacion">Actualizaciones</option>
            <option value="alerta">Alertas</option>
          </select>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors">
          <Plus size={18} />
          Nueva Comunicación
        </button>
      </div>

      {/* Communications List */}
      <div className="space-y-4">
        {filteredComunicaciones.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <MessageSquare size={48} className="mx-auto text-neutral-300 mb-4" />
            <p className="text-neutral-500">No hay comunicaciones que mostrar</p>
          </div>
        ) : (
          filteredComunicaciones.map(comunicacion => {
            const Icon = tipoIcons[comunicacion.tipo] || MessageSquare;

            return (
              <div key={comunicacion.id} className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
                {/* Header */}
                <div
                  className="p-4 flex items-start gap-4 cursor-pointer hover:bg-neutral-50"
                  onClick={() => toggleExpand(comunicacion.id)}
                >
                  <div className={`p-2 rounded-lg ${tipoColors[comunicacion.tipo] || 'bg-neutral-100'}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-neutral-800">{comunicacion.titulo}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded ${tipoColors[comunicacion.tipo] || 'bg-neutral-100'}`}>
                        {tipoLabels[comunicacion.tipo] || comunicacion.tipo}
                      </span>
                      {!comunicacion.leido && (
                        <span className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                    <p className="text-sm text-neutral-500 line-clamp-1">{comunicacion.contenido}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-neutral-400">
                      <span>{comunicacion.autor_nombre}</span>
                      <span>{comunicacion.proyecto_nombre}</span>
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
                      <p className="text-neutral-700 whitespace-pre-wrap">{comunicacion.contenido}</p>
                    </div>

                    {/* Replies */}
                    {comunicacion.respuestas && comunicacion.respuestas.length > 0 && (
                      <div className="p-4 space-y-3">
                        {comunicacion.respuestas.map(respuesta => (
                          <div key={respuesta.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                              {respuesta.autor_nombre?.charAt(0) || '?'}
                            </div>
                            <div className="flex-1 bg-neutral-50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm text-neutral-800">
                                  {respuesta.autor_nombre}
                                </span>
                                <span className="text-xs text-neutral-400">
                                  {new Date(respuesta.created_at).toLocaleString('es-CL')}
                                </span>
                              </div>
                              <p className="text-sm text-neutral-600">{respuesta.contenido}</p>
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
                          disabled={sendingReply === comunicacion.id}
                        />
                        <button
                          onClick={() => addReply(comunicacion.id)}
                          disabled={sendingReply === comunicacion.id}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                        >
                          {sendingReply === comunicacion.id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Send size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
