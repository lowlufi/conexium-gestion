// Servicio de API para conectar con el backend de Cloudflare Workers

const API_BASE_URL = 'https://conexium-gestion.daguilera.workers.dev';

// Helper para hacer requests
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error de conexión' }));
    throw new Error(error.error || `Error ${response.status}`);
  }

  return response.json();
}

// ==================== AUTH ====================

export const authAPI = {
  me: () => fetchAPI<{ user: Usuario }>('/api/auth/me'),
  logout: () => fetchAPI('/api/auth/logout', { method: 'POST' }),
};

// ==================== DASHBOARD ====================

export interface DashboardStats {
  proyectosActivos: number;
  tareasCompletadas: number;
  tareasEnProgreso: number;
  tareasConRetraso: number;
}

export const dashboardAPI = {
  getStats: () => fetchAPI<DashboardStats>('/api/dashboard/stats'),
};

// ==================== PROYECTOS ====================

export interface Proyecto {
  id: number;
  nombre: string;
  descripcion?: string;
  tipo: string;
  color: string;
  icono: string;
  estado: 'activo' | 'pausado' | 'completado' | 'cancelado';
  drive_url?: string;
  jefe_id?: number;
  segundo_id?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  created_at: string;
  // Joined fields
  jefe_nombre?: string;
  segundo_nombre?: string;
  total_tareas?: number;
  tareas_completadas?: number;
}

export const proyectosAPI = {
  list: () => fetchAPI<{ proyectos: Proyecto[] }>('/api/proyectos'),
  get: (id: number) => fetchAPI<{ proyecto: Proyecto }>(`/api/proyectos/${id}`),
  create: (data: Partial<Proyecto>) =>
    fetchAPI<{ id: number; success: boolean }>('/api/proyectos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Proyecto>) =>
    fetchAPI<{ success: boolean }>(`/api/proyectos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// ==================== TAREAS ====================

export interface Tarea {
  id: number;
  proyecto_id: number;
  tarea_padre_id?: number;
  titulo: string;
  descripcion?: string;
  responsable_id?: number;
  estado: 'sin_iniciar' | 'en_progreso' | 'en_espera' | 'aplazado' | 'terminado';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  progreso: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  orden: number;
  cerrada: boolean;
  cerrada_por?: number;
  cerrada_at?: string;
  created_at: string;
  // Joined fields
  responsable_nombre?: string;
  subtareas?: Tarea[];
}

export const tareasAPI = {
  listByProyecto: (proyectoId: number) =>
    fetchAPI<{ tareas: Tarea[] }>(`/api/proyectos/${proyectoId}/tareas`),
  create: (proyectoId: number, data: Partial<Tarea>) =>
    fetchAPI<{ id: number; success: boolean }>(`/api/proyectos/${proyectoId}/tareas`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Tarea>) =>
    fetchAPI<{ success: boolean }>(`/api/tareas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  cerrar: (id: number) =>
    fetchAPI<{ success: boolean }>(`/api/tareas/${id}/cerrar`, { method: 'POST' }),
  delete: (id: number) =>
    fetchAPI<{ success: boolean }>(`/api/tareas/${id}`, { method: 'DELETE' }),
};

// ==================== POSITS ====================

export interface Posit {
  id: number;
  proyecto_id?: number;
  creador_id: number;
  asignado_id?: number;
  contenido: string;
  color: 'yellow' | 'pink' | 'green' | 'blue' | 'orange';
  columna: 'esta_semana' | 'proxima_semana' | 'pendiente';
  fecha_vencimiento?: string;
  completado: boolean;
  created_at: string;
  // Joined fields
  proyecto_nombre?: string;
  creador_nombre?: string;
  asignado_nombre?: string;
}

export const positsAPI = {
  list: () => fetchAPI<{ posits: Posit[] }>('/api/posits'),
  create: (data: Partial<Posit>) =>
    fetchAPI<{ id: number; success: boolean }>('/api/posits', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Posit>) =>
    fetchAPI<{ success: boolean }>(`/api/posits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    fetchAPI<{ success: boolean }>(`/api/posits/${id}`, { method: 'DELETE' }),
};

// ==================== COMUNICACIONES ====================

export interface ComunicacionRespuesta {
  id: number;
  comunicacion_id: number;
  autor_id: number;
  contenido: string;
  created_at: string;
  autor_nombre?: string;
}

export interface Comunicacion {
  id: number;
  proyecto_id: number;
  autor_id: number;
  tipo: 'desviacion' | 'consulta' | 'actualizacion' | 'alerta';
  titulo: string;
  contenido: string;
  leido: boolean;
  created_at: string;
  // Joined fields
  proyecto_nombre?: string;
  autor_nombre?: string;
  respuestas?: ComunicacionRespuesta[];
}

export const comunicacionesAPI = {
  list: (tipo?: string) => {
    const query = tipo ? `?tipo=${tipo}` : '';
    return fetchAPI<{ comunicaciones: Comunicacion[] }>(`/api/comunicaciones${query}`);
  },
  get: (id: number) => fetchAPI<{ comunicacion: Comunicacion; respuestas: ComunicacionRespuesta[] }>(`/api/comunicaciones/${id}`),
  create: (data: Partial<Comunicacion>) =>
    fetchAPI<{ id: number; success: boolean }>('/api/comunicaciones', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  addRespuesta: (comunicacionId: number, contenido: string) =>
    fetchAPI<{ id: number; success: boolean }>(`/api/comunicaciones/${comunicacionId}/respuestas`, {
      method: 'POST',
      body: JSON.stringify({ contenido }),
    }),
};

// ==================== ALERTAS ====================

export interface Alerta {
  id: number;
  usuario_id: number;
  tipo: 'info' | 'vencimiento' | 'desviacion' | 'mencion';
  titulo: string;
  mensaje: string;
  referencia_tipo?: string;
  referencia_id?: number;
  leida: boolean;
  created_at: string;
}

export const alertasAPI = {
  list: () => fetchAPI<{ alertas: Alerta[] }>('/api/alertas'),
  markAsRead: (id: number) =>
    fetchAPI<{ success: boolean }>(`/api/alertas/${id}/leer`, { method: 'PUT' }),
  markAllAsRead: () =>
    fetchAPI<{ success: boolean }>('/api/alertas/leer-todas', { method: 'POST' }),
};

// ==================== USUARIOS ====================

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  rol: 'admin' | 'jefe_proyecto' | 'segundo_responsable' | 'visualizador';
  google_id?: string;
  avatar_url?: string;
  activo: boolean;
  created_at: string;
}

export const usuariosAPI = {
  list: () => fetchAPI<{ usuarios: Usuario[] }>('/api/usuarios'),
  create: (data: Partial<Usuario>) =>
    fetchAPI<{ id: number; success: boolean }>('/api/usuarios', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Usuario>) =>
    fetchAPI<{ success: boolean }>(`/api/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// ==================== INDICADORES ====================

export interface Indicador {
  id: number;
  proyecto_id: number;
  nombre: string;
  descripcion?: string;
  valor_actual: number;
  valor_meta: number;
  unidad: string;
  publico: boolean;
  created_at: string;
}

export const indicadoresAPI = {
  listByProyecto: (proyectoId: number) =>
    fetchAPI<{ indicadores: Indicador[] }>(`/api/proyectos/${proyectoId}/indicadores`),
  create: (proyectoId: number, data: Partial<Indicador>) =>
    fetchAPI<{ id: number; success: boolean }>(`/api/proyectos/${proyectoId}/indicadores`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
