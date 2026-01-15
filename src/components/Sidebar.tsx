'use client';

import {
  LayoutDashboard,
  FolderKanban,
  Calendar,
  StickyNote,
  MessageSquare,
  Bell,
  Users,
  Settings,
  LogOut
} from 'lucide-react';
import { User } from '@/types';

interface SidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  user: User | null;
  onLogout: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'proyectos', label: 'Proyectos', icon: FolderKanban },
  { id: 'cronograma', label: 'Cronograma', icon: Calendar },
  { id: 'posits', label: 'Posits', icon: StickyNote },
  { id: 'comunicacion', label: 'Comunicación', icon: MessageSquare },
  { id: 'alertas', label: 'Alertas', icon: Bell },
];

const adminItems = [
  { id: 'usuarios', label: 'Usuarios', icon: Users },
  { id: 'configuracion', label: 'Configuración', icon: Settings },
];

export default function Sidebar({ currentSection, onSectionChange, user, onLogout }: SidebarProps) {
  const isAdmin = user?.rol === 'admin';

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-neutral-200">
        <h1 className="text-2xl font-bold text-primary">
          Conexium
        </h1>
        <p className="text-sm text-neutral-500">Gestión de Proyectos</p>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
              {user.nombre.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-neutral-800 truncate">{user.nombre}</p>
              <p className="text-xs text-neutral-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {isAdmin && (
          <>
            <div className="my-4 border-t border-neutral-200" />
            <p className="px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Administración
            </p>
            <ul className="space-y-1">
              {adminItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentSection === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onSectionChange(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-neutral-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-danger hover:bg-danger-50 transition-colors"
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
