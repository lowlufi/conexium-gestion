'use client';

import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Shield, UserCheck, Eye } from 'lucide-react';
import { User, UserRole } from '@/types';

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  jefe_proyecto: 'Jefe de Proyecto',
  segundo_responsable: '2do Responsable',
  visualizador: 'Visualizador',
};

const roleColors: Record<UserRole, string> = {
  admin: 'bg-danger-100 text-danger-700',
  jefe_proyecto: 'bg-primary-100 text-primary-700',
  segundo_responsable: 'bg-success-100 text-success-700',
  visualizador: 'bg-neutral-100 text-neutral-700',
};

const demoUsuarios: User[] = [
  { id: 1, email: 'mariella.ruiz@connexium.cl', nombre: 'Mariella Ruiz', rol: 'admin', activo: true, created_at: '2024-01-01' },
  { id: 2, email: 'chantall.huerta@connexium.cl', nombre: 'Chantall Huerta', rol: 'jefe_proyecto', activo: true, created_at: '2024-01-01' },
  { id: 3, email: 'carlos.concha@connexium.cl', nombre: 'Carlos Concha', rol: 'jefe_proyecto', activo: true, created_at: '2024-01-01' },
  { id: 4, email: 'marisol.tapia@connexium.cl', nombre: 'Marisol Tapia', rol: 'jefe_proyecto', activo: true, created_at: '2024-01-01' },
  { id: 5, email: 'pilar.soto@connexium.cl', nombre: 'Pilar Soto', rol: 'jefe_proyecto', activo: true, created_at: '2024-01-01' },
  { id: 6, email: 'jc@connexium.cl', nombre: 'Juan Carlos Díaz', rol: 'jefe_proyecto', activo: true, created_at: '2024-01-01' },
  { id: 7, email: 'luis.silva@connexium.cl', nombre: 'Luis Silva', rol: 'segundo_responsable', activo: true, created_at: '2024-01-01' },
  { id: 8, email: 'brigitte.ortiz@connexium.cl', nombre: 'Brigitte Ortiz', rol: 'segundo_responsable', activo: true, created_at: '2024-01-01' },
  { id: 9, email: 'daniel.aguilera@connexium.cl', nombre: 'Daniel Aguilera', rol: 'segundo_responsable', activo: true, created_at: '2024-01-01' },
];

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<User[]>(demoUsuarios);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState<UserRole | 'todos'>('todos');

  const filteredUsuarios = usuarios.filter(u => {
    const matchesSearch = u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRol = filterRol === 'todos' || u.rol === filterRol;
    return matchesSearch && matchesRol;
  });

  const getRoleIcon = (rol: UserRole) => {
    switch (rol) {
      case 'admin': return Shield;
      case 'jefe_proyecto': return UserCheck;
      default: return Eye;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 w-64"
            />
          </div>
          <select
            value={filterRol}
            onChange={(e) => setFilterRol(e.target.value as UserRole | 'todos')}
            className="px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            <option value="todos">Todos los roles</option>
            <option value="admin">Administradores</option>
            <option value="jefe_proyecto">Jefes de Proyecto</option>
            <option value="segundo_responsable">2dos Responsables</option>
            <option value="visualizador">Visualizadores</option>
          </select>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors">
          <Plus size={18} />
          Nuevo Usuario
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {(['admin', 'jefe_proyecto', 'segundo_responsable', 'visualizador'] as UserRole[]).map(rol => {
          const count = usuarios.filter(u => u.rol === rol).length;
          const Icon = getRoleIcon(rol);

          return (
            <div key={rol} className="bg-white rounded-lg border border-neutral-100 p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${roleColors[rol]}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-800">{count}</p>
                  <p className="text-sm text-neutral-500">{roleLabels[rol]}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-600">Usuario</th>
              <th className="text-left px-4 py-4 text-sm font-semibold text-neutral-600">Email</th>
              <th className="text-left px-4 py-4 text-sm font-semibold text-neutral-600">Rol</th>
              <th className="text-left px-4 py-4 text-sm font-semibold text-neutral-600">Estado</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-neutral-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredUsuarios.map(usuario => {
              const Icon = getRoleIcon(usuario.rol);

              return (
                <tr key={usuario.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                        {usuario.nombre.charAt(0)}
                      </div>
                      <span className="font-medium text-neutral-800">{usuario.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-neutral-500">{usuario.email}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded ${roleColors[usuario.rol]}`}>
                      <Icon size={12} />
                      {roleLabels[usuario.rol]}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 text-xs rounded ${usuario.activo ? 'bg-success-100 text-success-700' : 'bg-neutral-100 text-neutral-500'}`}>
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-neutral-400 hover:text-primary hover:bg-primary-50 rounded-lg transition-colors">
                        <Edit size={16} />
                      </button>
                      <button className="p-2 text-neutral-400 hover:text-danger hover:bg-danger-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredUsuarios.length === 0 && (
        <div className="text-center py-12">
          <p className="text-neutral-500">No se encontraron usuarios</p>
        </div>
      )}
    </div>
  );
}
