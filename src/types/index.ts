// Tipos de la aplicación

export type UserRole = 'admin' | 'jefe_proyecto' | 'segundo_responsable' | 'visualizador';

export interface User {
  id: number;
  email: string;
  nombre: string;
  rol: UserRole;
  avatar?: string;
  activo: boolean;
  created_at: string;
}

export interface Proyecto {
  id: number;
  nombre: string;
  descripcion?: string;
  cliente?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  estado: 'activo' | 'pausado' | 'completado' | 'cancelado';
  progreso: number;
  color: string;
  responsable_id: number;
  segundo_responsable_id?: number;
  created_at: string;
  // Joined fields
  responsable?: User;
  segundo_responsable?: User;
}

export interface Tarea {
  id: number;
  proyecto_id: number;
  padre_id?: number;
  nombre: string;
  descripcion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  estado: 'pendiente' | 'en_progreso' | 'completado' | 'bloqueado';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  progreso: number;
  responsable_id?: number;
  orden: number;
  created_at: string;
  // Joined fields
  proyecto?: Proyecto;
  responsable?: User;
  subtareas?: Tarea[];
}

export type PostitColor = 'amarillo' | 'rosa' | 'verde' | 'azul' | 'naranja';

export interface Posit {
  id: number;
  proyecto_id: number;
  contenido: string;
  color: PostitColor;
  prioridad: number;
  creado_por: number;
  fecha_limite?: string;
  completado: boolean;
  created_at: string;
  // Joined fields
  proyecto?: Proyecto;
  creador?: User;
}

export type ComunicacionTipo = 'reporte' | 'alerta' | 'consulta' | 'actualizacion';
export type ComunicacionEstado = 'abierto' | 'en_revision' | 'resuelto' | 'cerrado';

export interface Comunicacion {
  id: number;
  proyecto_id: number;
  tipo: ComunicacionTipo;
  asunto: string;
  mensaje: string;
  estado: ComunicacionEstado;
  creado_por: number;
  created_at: string;
  // Joined fields
  proyecto?: Proyecto;
  creador?: User;
  respuestas?: ComunicacionRespuesta[];
}

export interface ComunicacionRespuesta {
  id: number;
  comunicacion_id: number;
  mensaje: string;
  creado_por: number;
  created_at: string;
  // Joined fields
  creador?: User;
}

export type AlertaTipo = 'info' | 'warning' | 'danger' | 'success';

export interface Alerta {
  id: number;
  usuario_id: number;
  tipo: AlertaTipo;
  titulo: string;
  mensaje: string;
  leida: boolean;
  enlace?: string;
  created_at: string;
}

export interface DashboardStats {
  proyectos_activos: number;
  tareas_pendientes: number;
  posits_urgentes: number;
  comunicaciones_abiertas: number;
}

// Props para componentes
export interface SidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  user: User | null;
}

export interface HeaderProps {
  user: User | null;
  alertas: Alerta[];
  onLogout: () => void;
}
