'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  MoreVertical,
  Users,
  Calendar,
  Edit,
  Trash2,
  Eye,
  Loader2,
  ExternalLink,
  FolderOpen
} from 'lucide-react';
import { proyectosAPI, Proyecto } from '@/lib/api';

export default function Proyectos() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProyectos();
  }, []);

  const loadProyectos = async () => {
    try {
      setLoading(true);
      const res = await proyectosAPI.list();
      setProyectos(res.proyectos);
    } catch (err) {
      console.error('Error loading proyectos:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProyectos = proyectos.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'activo': return 'bg-success-100 text-success-700';
      case 'pausado': return 'bg-warning-100 text-warning-700';
      case 'completado': return 'bg-primary-100 text-primary-700';
      case 'cancelado': return 'bg-danger-100 text-danger-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  const getProgreso = (proyecto: Proyecto) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input
            type="text"
            placeholder="Buscar proyectos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus size={18} />
          Nuevo Proyecto
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProyectos.map((proyecto) => {
          const progreso = getProgreso(proyecto);
          return (
            <div
              key={proyecto.id}
              className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Color bar */}
              <div className="h-2" style={{ backgroundColor: proyecto.color }} />

              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-neutral-800 text-lg">{proyecto.nombre}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getEstadoBadge(proyecto.estado)}`}>
                        {proyecto.estado}
                      </span>
                      <span className="text-xs text-neutral-400">{proyecto.tipo}</span>
                    </div>
                  </div>
                  <div className="relative group">
                    <button className="p-1 hover:bg-neutral-100 rounded">
                      <MoreVertical size={18} className="text-neutral-400" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 hidden group-hover:block z-10 min-w-[140px]">
                      <button className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-2">
                        <Eye size={14} /> Ver detalles
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-2">
                        <Edit size={14} /> Editar
                      </button>
                      {proyecto.drive_url && (
                        <a
                          href={proyecto.drive_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-2"
                        >
                          <ExternalLink size={14} /> Abrir Drive
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {proyecto.descripcion && (
                  <p className="text-neutral-500 text-sm mb-4 line-clamp-2">
                    {proyecto.descripcion}
                  </p>
                )}

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-neutral-500">Progreso</span>
                    <span className="font-medium" style={{ color: proyecto.color }}>
                      {progreso}%
                    </span>
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
                  <div className="text-xs text-neutral-400 mt-1">
                    {proyecto.tareas_completadas || 0} de {proyecto.total_tareas || 0} tareas
                  </div>
                </div>

                {/* Meta info */}
                <div className="space-y-2 text-sm text-neutral-500">
                  {proyecto.jefe_nombre && (
                    <div className="flex items-center gap-2">
                      <Users size={14} />
                      <span>{proyecto.jefe_nombre}</span>
                      {proyecto.segundo_nombre && (
                        <span className="text-neutral-400">/ {proyecto.segundo_nombre}</span>
                      )}
                    </div>
                  )}
                  {proyecto.fecha_fin && (
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      <span>Vence: {new Date(proyecto.fecha_fin).toLocaleDateString('es-CL')}</span>
                    </div>
                  )}
                </div>

                {/* Drive Button */}
                {proyecto.drive_url && (
                  <a
                    href={proyecto.drive_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 w-full py-2 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors text-sm font-medium"
                  >
                    <ExternalLink size={16} />
                    Abrir en Google Drive
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredProyectos.length === 0 && !loading && (
        <div className="text-center py-12">
          <FolderOpen size={48} className="mx-auto text-neutral-300 mb-4" />
          <p className="text-neutral-500">
            {searchTerm ? 'No se encontraron proyectos' : 'No hay proyectos creados'}
          </p>
        </div>
      )}
    </div>
  );
}
