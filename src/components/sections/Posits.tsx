'use client';

import { useState, useEffect } from 'react';
import { Plus, X, GripVertical, Check, Calendar, Loader2, StickyNote } from 'lucide-react';
import { positsAPI, proyectosAPI, Posit, Proyecto } from '@/lib/api';

const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
  yellow: { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-800' },
  pink: { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-800' },
  green: { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-800' },
  blue: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800' },
  orange: { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-800' },
};

export default function Posits() {
  const [posits, setPostits] = useState<Posit[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newPostit, setNewPostit] = useState({
    contenido: '',
    color: 'yellow' as Posit['color'],
    proyecto_id: 0,
    fecha_vencimiento: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [positsRes, proyectosRes] = await Promise.all([
        positsAPI.list(),
        proyectosAPI.list(),
      ]);
      setPostits(positsRes.posits);
      setProyectos(proyectosRes.proyectos);
      if (proyectosRes.proyectos.length > 0) {
        setNewPostit(prev => ({ ...prev, proyecto_id: proyectosRes.proyectos[0].id }));
      }
    } catch (err) {
      console.error('Error loading posits:', err);
    } finally {
      setLoading(false);
    }
  };

  const pendingPostits = posits.filter(p => !p.completado);
  const completedPostits = posits.filter(p => p.completado);

  const toggleComplete = async (id: number, completado: boolean) => {
    try {
      await positsAPI.update(id, { completado: !completado });
      setPostits(prev => prev.map(p =>
        p.id === id ? { ...p, completado: !completado } : p
      ));
    } catch (err) {
      console.error('Error updating posit:', err);
    }
  };

  const deletePostit = async (id: number) => {
    try {
      await positsAPI.delete(id);
      setPostits(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting posit:', err);
    }
  };

  const addPostit = async () => {
    if (!newPostit.contenido.trim()) return;

    try {
      const res = await positsAPI.create({
        contenido: newPostit.contenido,
        color: newPostit.color,
        proyecto_id: newPostit.proyecto_id || undefined,
        fecha_vencimiento: newPostit.fecha_vencimiento || undefined,
        columna: 'esta_semana',
      });

      await loadData();
      setNewPostit({ contenido: '', color: 'yellow', proyecto_id: proyectos[0]?.id || 0, fecha_vencimiento: '' });
      setShowModal(false);
    } catch (err) {
      console.error('Error creating posit:', err);
    }
  };

  const PostitCard = ({ posit }: { posit: Posit }) => {
    const colors = colorClasses[posit.color] || colorClasses.yellow;
    const isOverdue = posit.fecha_vencimiento && new Date(posit.fecha_vencimiento) < new Date() && !posit.completado;

    return (
      <div
        className={`${colors.bg} ${colors.border} border-2 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative group ${
          posit.completado ? 'opacity-60' : ''
        }`}
      >
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 cursor-grab">
          <GripVertical size={16} className="text-neutral-400" />
        </div>

        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100">
          <button
            onClick={() => toggleComplete(posit.id, posit.completado)}
            className={`p-1 rounded hover:bg-white/50 ${posit.completado ? 'text-success' : 'text-neutral-400'}`}
          >
            <Check size={16} />
          </button>
          <button
            onClick={() => deletePostit(posit.id)}
            className="p-1 rounded hover:bg-white/50 text-neutral-400 hover:text-danger"
          >
            <X size={16} />
          </button>
        </div>

        <p className={`${colors.text} mt-4 ${posit.completado ? 'line-through' : ''}`}>
          {posit.contenido}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-neutral-500">{posit.proyecto_nombre || 'General'}</span>
          {posit.fecha_vencimiento && (
            <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-danger font-medium' : 'text-neutral-500'}`}>
              <Calendar size={12} />
              {new Date(posit.fecha_vencimiento).toLocaleDateString('es-CL')}
            </span>
          )}
        </div>
      </div>
    );
  };

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
        <div>
          <h3 className="text-lg font-semibold text-neutral-800">Tareas Urgentes de la Semana</h3>
          <p className="text-sm text-neutral-500">Notas rápidas para recordatorios importantes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus size={18} />
          Nuevo Posit
        </button>
      </div>

      {/* Pending Posits */}
      <div>
        <h4 className="text-sm font-semibold text-neutral-600 mb-4 uppercase tracking-wider">
          Pendientes ({pendingPostits.length})
        </h4>
        {pendingPostits.length === 0 ? (
          <div className="text-center py-8 bg-neutral-50 rounded-xl">
            <StickyNote size={40} className="mx-auto text-neutral-300 mb-2" />
            <p className="text-neutral-500">No hay posits pendientes</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pendingPostits.map(posit => (
              <PostitCard key={posit.id} posit={posit} />
            ))}
          </div>
        )}
      </div>

      {/* Completed Posits */}
      {completedPostits.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-neutral-600 mb-4 uppercase tracking-wider">
            Completados ({completedPostits.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {completedPostits.map(posit => (
              <PostitCard key={posit.id} posit={posit} />
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Nuevo Posit</h3>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Contenido</label>
                <textarea
                  value={newPostit.contenido}
                  onChange={(e) => setNewPostit({ ...newPostit, contenido: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
                  rows={3}
                  placeholder="¿Qué necesitas recordar?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Proyecto</label>
                <select
                  value={newPostit.proyecto_id}
                  onChange={(e) => setNewPostit({ ...newPostit, proyecto_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
                >
                  <option value={0}>General</option>
                  {proyectos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Color</label>
                <div className="flex gap-2">
                  {(Object.keys(colorClasses) as Posit['color'][]).map(color => (
                    <button
                      key={color}
                      onClick={() => setNewPostit({ ...newPostit, color })}
                      className={`w-8 h-8 rounded-full border-2 ${colorClasses[color].bg} ${
                        newPostit.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Fecha límite (opcional)</label>
                <input
                  type="date"
                  value={newPostit.fecha_vencimiento}
                  onChange={(e) => setNewPostit({ ...newPostit, fecha_vencimiento: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>

              <button
                onClick={addPostit}
                className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Crear Posit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
