'use client';

import { useState } from 'react';
import { Plus, X, GripVertical, Check, Calendar } from 'lucide-react';
import { Posit, PostitColor } from '@/types';

const colorClasses: Record<PostitColor, { bg: string; border: string; text: string }> = {
  amarillo: { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-800' },
  rosa: { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-800' },
  verde: { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-800' },
  azul: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800' },
  naranja: { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-800' },
};

const demoPostits: Posit[] = [
  { id: 1, proyecto_id: 1, contenido: 'Revisar informe de avance semanal con el equipo de Legado', color: 'amarillo', prioridad: 1, creado_por: 1, fecha_limite: '2024-01-20', completado: false, created_at: '' },
  { id: 2, proyecto_id: 1, contenido: 'Coordinar reunión con cliente para validación de entregables', color: 'rosa', prioridad: 2, creado_por: 1, fecha_limite: '2024-01-22', completado: false, created_at: '' },
  { id: 3, proyecto_id: 2, contenido: 'Actualizar documentación técnica del módulo de reportes', color: 'verde', prioridad: 3, creado_por: 1, completado: false, created_at: '' },
  { id: 4, proyecto_id: 2, contenido: 'Preparar presentación para directorio', color: 'azul', prioridad: 4, creado_por: 1, fecha_limite: '2024-01-25', completado: false, created_at: '' },
  { id: 5, proyecto_id: 3, contenido: 'Revisar presupuesto Q2 con finanzas', color: 'naranja', prioridad: 5, creado_por: 1, fecha_limite: '2024-01-18', completado: true, created_at: '' },
];

const proyectos = [
  { id: 1, nombre: 'Programa Legado' },
  { id: 2, nombre: 'SLEP SUR' },
  { id: 3, nombre: 'RFT' },
];

export default function Posits() {
  const [posits, setPostits] = useState<Posit[]>(demoPostits);
  const [showModal, setShowModal] = useState(false);
  const [newPostit, setNewPostit] = useState({
    contenido: '',
    color: 'amarillo' as PostitColor,
    proyecto_id: 1,
    fecha_limite: ''
  });

  const pendingPostits = posits.filter(p => !p.completado);
  const completedPostits = posits.filter(p => p.completado);

  const toggleComplete = (id: number) => {
    setPostits(prev => prev.map(p =>
      p.id === id ? { ...p, completado: !p.completado } : p
    ));
  };

  const deletePostit = (id: number) => {
    setPostits(prev => prev.filter(p => p.id !== id));
  };

  const addPostit = () => {
    if (!newPostit.contenido.trim()) return;

    const newId = Math.max(...posits.map(p => p.id)) + 1;
    setPostits(prev => [...prev, {
      id: newId,
      proyecto_id: newPostit.proyecto_id,
      contenido: newPostit.contenido,
      color: newPostit.color,
      prioridad: prev.length + 1,
      creado_por: 1,
      fecha_limite: newPostit.fecha_limite || undefined,
      completado: false,
      created_at: new Date().toISOString()
    }]);

    setNewPostit({ contenido: '', color: 'amarillo', proyecto_id: 1, fecha_limite: '' });
    setShowModal(false);
  };

  const PostitCard = ({ posit }: { posit: Posit }) => {
    const colors = colorClasses[posit.color];
    const proyecto = proyectos.find(p => p.id === posit.proyecto_id);
    const isOverdue = posit.fecha_limite && new Date(posit.fecha_limite) < new Date() && !posit.completado;

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
            onClick={() => toggleComplete(posit.id)}
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
          <span className="text-xs text-neutral-500">{proyecto?.nombre}</span>
          {posit.fecha_limite && (
            <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-danger font-medium' : 'text-neutral-500'}`}>
              <Calendar size={12} />
              {new Date(posit.fecha_limite).toLocaleDateString('es-CL')}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-800">Tareas Urgentes de la Semana</h3>
          <p className="text-sm text-neutral-500">Arrastra los posits para reorganizar prioridades</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {pendingPostits.map(posit => (
            <PostitCard key={posit.id} posit={posit} />
          ))}
        </div>
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
                  {proyectos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Color</label>
                <div className="flex gap-2">
                  {(Object.keys(colorClasses) as PostitColor[]).map(color => (
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
                  value={newPostit.fecha_limite}
                  onChange={(e) => setNewPostit({ ...newPostit, fecha_limite: e.target.value })}
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
