'use client';

import { useState } from 'react';
import {
  Plus,
  Search,
  MoreVertical,
  Users,
  Calendar,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { Proyecto } from '@/types';

const demoProyectos: Proyecto[] = [
  {
    id: 1,
    nombre: 'Programa Legado',
    descripcion: 'Implementación del programa de legado educativo para establecimientos de la zona norte',
    cliente: 'MINEDUC',
    fecha_inicio: '2024-01-15',
    fecha_fin: '2024-12-31',
    estado: 'activo',
    progreso: 65,
    color: '#218acb',
    responsable_id: 2,
    segundo_responsable_id: 7,
    created_at: '2024-01-01',
  },
  {
    id: 2,
    nombre: 'SLEP SUR',
    descripcion: 'Proyecto de servicios locales de educación pública zona sur',
    cliente: 'SLEP',
    fecha_inicio: '2024-02-01',
    fecha_fin: '2024-11-30',
    estado: 'activo',
    progreso: 45,
    color: '#58b998',
    responsable_id: 3,
    segundo_responsable_id: 7,
    created_at: '2024-01-15',
  },
  {
    id: 3,
    nombre: 'RFT',
    descripcion: 'Proyecto de recursos para la formación técnica',
    cliente: 'SENCE',
    fecha_inicio: '2024-03-01',
    fecha_fin: '2024-10-31',
    estado: 'activo',
    progreso: 30,
    color: '#ce95c2',
    responsable_id: 4,
    segundo_responsable_id: 8,
    created_at: '2024-02-01',
  },
];

const responsables: Record<number, string> = {
  2: 'Chantall Huerta',
  3: 'Carlos Concha',
  4: 'Marisol Tapia',
  7: 'Luis Silva',
  8: 'Brigitte Ortiz',
};

export default function Proyectos() {
  const [proyectos, setProyectos] = useState<Proyecto[]>(demoProyectos);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedProyecto, setSelectedProyecto] = useState<Proyecto | null>(null);

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
          onClick={() => {
            setSelectedProyecto(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus size={18} />
          Nuevo Proyecto
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProyectos.map((proyecto) => (
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
                  <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${getEstadoBadge(proyecto.estado)}`}>
                    {proyecto.estado}
                  </span>
                </div>
                <div className="relative group">
                  <button className="p-1 hover:bg-neutral-100 rounded">
                    <MoreVertical size={18} className="text-neutral-400" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 hidden group-hover:block z-10 min-w-[120px]">
                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-2">
                      <Eye size={14} /> Ver
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-2">
                      <Edit size={14} /> Editar
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 text-danger flex items-center gap-2">
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-neutral-500 text-sm mb-4 line-clamp-2">
                {proyecto.descripcion}
              </p>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-neutral-500">Progreso</span>
                  <span className="font-medium" style={{ color: proyecto.color }}>
                    {proyecto.progreso}%
                  </span>
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

              {/* Meta info */}
              <div className="space-y-2 text-sm text-neutral-500">
                <div className="flex items-center gap-2">
                  <Users size={14} />
                  <span>{responsables[proyecto.responsable_id]}</span>
                </div>
                {proyecto.fecha_fin && (
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>Vence: {new Date(proyecto.fecha_fin).toLocaleDateString('es-CL')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProyectos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-neutral-500">No se encontraron proyectos</p>
        </div>
      )}
    </div>
  );
}
