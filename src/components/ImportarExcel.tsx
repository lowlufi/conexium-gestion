'use client';

import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import {
  X,
  Upload,
  FileSpreadsheet,
  Check,
  AlertCircle,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { tareasAPI, Proyecto, Tarea } from '@/lib/api';

interface ImportarExcelProps {
  proyecto: Proyecto;
  onClose: () => void;
  onSuccess: () => void;
}

interface FilaExcel {
  [key: string]: any;
}

interface MapeoCampos {
  titulo: string;
  descripcion: string;
  responsable: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  prioridad: string;
  tarea_padre: string;
}

const CAMPOS_TAREA = [
  { key: 'titulo', label: 'Título / Nombre de Tarea', required: true },
  { key: 'descripcion', label: 'Descripción', required: false },
  { key: 'responsable', label: 'Responsable', required: false },
  { key: 'fecha_inicio', label: 'Fecha Inicio', required: false },
  { key: 'fecha_fin', label: 'Fecha Fin / Vencimiento', required: false },
  { key: 'estado', label: 'Estado', required: false },
  { key: 'prioridad', label: 'Prioridad', required: false },
  { key: 'tarea_padre', label: 'Tarea Padre (para subtareas)', required: false },
];

const ESTADOS_MAP: Record<string, string> = {
  'sin iniciar': 'sin_iniciar',
  'no iniciado': 'sin_iniciar',
  'pendiente': 'sin_iniciar',
  'en progreso': 'en_progreso',
  'en curso': 'en_progreso',
  'activo': 'en_progreso',
  'en espera': 'en_espera',
  'esperando': 'en_espera',
  'bloqueado': 'en_espera',
  'aplazado': 'aplazado',
  'pospuesto': 'aplazado',
  'terminado': 'terminado',
  'completado': 'terminado',
  'finalizado': 'terminado',
  'hecho': 'terminado',
  'done': 'terminado',
};

const PRIORIDAD_MAP: Record<string, string> = {
  'urgente': 'urgente',
  'crítica': 'urgente',
  'critica': 'urgente',
  'alta': 'alta',
  'importante': 'alta',
  'media': 'media',
  'normal': 'media',
  'baja': 'baja',
  'menor': 'baja',
};

export default function ImportarExcel({ proyecto, onClose, onSuccess }: ImportarExcelProps) {
  const [paso, setPaso] = useState<'subir' | 'mapear' | 'importar' | 'resultado'>('subir');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [columnas, setColumnas] = useState<string[]>([]);
  const [datos, setDatos] = useState<FilaExcel[]>([]);
  const [mapeo, setMapeo] = useState<MapeoCampos>({
    titulo: '',
    descripcion: '',
    responsable: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: '',
    prioridad: '',
    tarea_padre: '',
  });
  const [importando, setImportando] = useState(false);
  const [resultado, setResultado] = useState<{ exitosas: number; errores: string[] }>({ exitosas: 0, errores: [] });

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setArchivo(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<FilaExcel>(sheet, { defval: '' });

      if (jsonData.length > 0) {
        const cols = Object.keys(jsonData[0]);
        setColumnas(cols);
        setDatos(jsonData);

        // Auto-mapeo inteligente
        const nuevoMapeo = { ...mapeo };
        cols.forEach(col => {
          const colLower = col.toLowerCase();
          if (colLower.includes('tarea') || colLower.includes('nombre') || colLower.includes('titulo') || colLower.includes('actividad')) {
            if (!nuevoMapeo.titulo) nuevoMapeo.titulo = col;
          }
          if (colLower.includes('descripcion') || colLower.includes('detalle')) {
            if (!nuevoMapeo.descripcion) nuevoMapeo.descripcion = col;
          }
          if (colLower.includes('responsable') || colLower.includes('asignado') || colLower.includes('encargado')) {
            if (!nuevoMapeo.responsable) nuevoMapeo.responsable = col;
          }
          if (colLower.includes('inicio') || colLower.includes('start') || colLower.includes('desde')) {
            if (!nuevoMapeo.fecha_inicio) nuevoMapeo.fecha_inicio = col;
          }
          if (colLower.includes('fin') || colLower.includes('end') || colLower.includes('vencimiento') || colLower.includes('hasta') || colLower.includes('termino')) {
            if (!nuevoMapeo.fecha_fin) nuevoMapeo.fecha_fin = col;
          }
          if (colLower.includes('estado') || colLower.includes('status')) {
            if (!nuevoMapeo.estado) nuevoMapeo.estado = col;
          }
          if (colLower.includes('prioridad') || colLower.includes('priority') || colLower.includes('urgencia')) {
            if (!nuevoMapeo.prioridad) nuevoMapeo.prioridad = col;
          }
          if (colLower.includes('padre') || colLower.includes('parent') || colLower.includes('superior')) {
            if (!nuevoMapeo.tarea_padre) nuevoMapeo.tarea_padre = col;
          }
        });
        setMapeo(nuevoMapeo);
        setPaso('mapear');
      }
    };
    reader.readAsBinaryString(file);
  }, [mapeo]);

  const parseDate = (value: any): string | null => {
    if (!value) return null;

    // Si ya es una fecha
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }

    // Si es un número (fecha de Excel)
    if (typeof value === 'number') {
      const date = XLSX.SSF.parse_date_code(value);
      if (date) {
        return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
      }
    }

    // Si es string, intentar parsear
    if (typeof value === 'string') {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }

      // Formato dd/mm/yyyy o dd-mm-yyyy
      const match = value.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
      if (match) {
        return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
      }
    }

    return null;
  };

  const parseEstado = (value: any): Tarea['estado'] => {
    if (!value) return 'sin_iniciar';
    const lower = String(value).toLowerCase().trim();
    return (ESTADOS_MAP[lower] || 'sin_iniciar') as Tarea['estado'];
  };

  const parsePrioridad = (value: any): Tarea['prioridad'] => {
    if (!value) return 'media';
    const lower = String(value).toLowerCase().trim();
    return (PRIORIDAD_MAP[lower] || 'media') as Tarea['prioridad'];
  };

  const handleImportar = async () => {
    if (!mapeo.titulo) {
      alert('Debes mapear al menos el campo "Título"');
      return;
    }

    setImportando(true);
    setPaso('importar');

    const errores: string[] = [];
    let exitosas = 0;
    const tareasCreadas = new Map<string, number>(); // Mapeo de nombre tarea -> id

    // Primera pasada: crear tareas padre (sin tarea_padre)
    for (let i = 0; i < datos.length; i++) {
      const fila = datos[i];
      const titulo = fila[mapeo.titulo];
      const tareaPadreNombre = mapeo.tarea_padre ? fila[mapeo.tarea_padre] : null;

      if (!titulo || (tareaPadreNombre && tareaPadreNombre.trim())) {
        continue; // Saltar filas sin título o que son subtareas
      }

      try {
        const tareaData: Partial<Tarea> = {
          titulo: String(titulo).trim(),
          descripcion: mapeo.descripcion ? String(fila[mapeo.descripcion] || '').trim() || undefined : undefined,
          fecha_inicio: mapeo.fecha_inicio ? parseDate(fila[mapeo.fecha_inicio]) || undefined : undefined,
          fecha_fin: mapeo.fecha_fin ? parseDate(fila[mapeo.fecha_fin]) || undefined : undefined,
          estado: mapeo.estado ? parseEstado(fila[mapeo.estado]) : 'sin_iniciar',
          prioridad: mapeo.prioridad ? parsePrioridad(fila[mapeo.prioridad]) : 'media',
        };

        const res = await tareasAPI.create(proyecto.id, tareaData);
        tareasCreadas.set(String(titulo).trim().toLowerCase(), res.id);
        exitosas++;
      } catch (err: any) {
        errores.push(`Fila ${i + 2}: ${err.message || 'Error desconocido'}`);
      }
    }

    // Segunda pasada: crear subtareas
    for (let i = 0; i < datos.length; i++) {
      const fila = datos[i];
      const titulo = fila[mapeo.titulo];
      const tareaPadreNombre = mapeo.tarea_padre ? fila[mapeo.tarea_padre] : null;

      if (!titulo || !tareaPadreNombre || !tareaPadreNombre.trim()) {
        continue; // Saltar filas sin título o sin padre
      }

      const padreId = tareasCreadas.get(String(tareaPadreNombre).trim().toLowerCase());

      try {
        const tareaData: Partial<Tarea> = {
          titulo: String(titulo).trim(),
          descripcion: mapeo.descripcion ? String(fila[mapeo.descripcion] || '').trim() || undefined : undefined,
          fecha_inicio: mapeo.fecha_inicio ? parseDate(fila[mapeo.fecha_inicio]) || undefined : undefined,
          fecha_fin: mapeo.fecha_fin ? parseDate(fila[mapeo.fecha_fin]) || undefined : undefined,
          estado: mapeo.estado ? parseEstado(fila[mapeo.estado]) : 'sin_iniciar',
          prioridad: mapeo.prioridad ? parsePrioridad(fila[mapeo.prioridad]) : 'media',
          tarea_padre_id: padreId,
        };

        await tareasAPI.create(proyecto.id, tareaData);
        exitosas++;
      } catch (err: any) {
        errores.push(`Fila ${i + 2} (subtarea): ${err.message || 'Error desconocido'}`);
      }
    }

    setResultado({ exitosas, errores });
    setImportando(false);
    setPaso('resultado');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div>
            <h2 className="text-xl font-semibold text-neutral-800">Importar Cronograma</h2>
            <p className="text-sm text-neutral-500 mt-1">Proyecto: {proyecto.nombre}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg">
            <X size={20} className="text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Paso 1: Subir archivo */}
          {paso === 'subir' && (
            <div className="text-center py-8">
              <FileSpreadsheet size={64} className="mx-auto text-neutral-300 mb-4" />
              <h3 className="text-lg font-medium text-neutral-800 mb-2">Sube tu archivo Excel</h3>
              <p className="text-sm text-neutral-500 mb-6">
                Formatos soportados: .xlsx, .xls, .csv
              </p>
              <label className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 cursor-pointer transition-colors">
                <Upload size={20} />
                Seleccionar archivo
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Paso 2: Mapear columnas */}
          {paso === 'mapear' && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Check size={20} className="text-success" />
                <span className="text-sm text-neutral-600">
                  Archivo cargado: <strong>{archivo?.name}</strong> ({datos.length} filas)
                </span>
              </div>

              <h3 className="font-medium text-neutral-800 mb-4">Mapea las columnas del Excel</h3>

              <div className="space-y-3">
                {CAMPOS_TAREA.map(campo => (
                  <div key={campo.key} className="flex items-center gap-4">
                    <label className="w-48 text-sm text-neutral-600">
                      {campo.label}
                      {campo.required && <span className="text-danger ml-1">*</span>}
                    </label>
                    <div className="relative flex-1">
                      <select
                        value={mapeo[campo.key as keyof MapeoCampos]}
                        onChange={(e) => setMapeo({ ...mapeo, [campo.key]: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"
                      >
                        <option value="">-- No mapear --</option>
                        {columnas.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Vista previa */}
              <div className="mt-6">
                <h4 className="font-medium text-neutral-800 mb-2">Vista previa (primeras 3 filas)</h4>
                <div className="overflow-x-auto border border-neutral-200 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-50">
                      <tr>
                        {CAMPOS_TAREA.filter(c => mapeo[c.key as keyof MapeoCampos]).map(campo => (
                          <th key={campo.key} className="px-3 py-2 text-left text-neutral-600 font-medium">
                            {campo.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {datos.slice(0, 3).map((fila, idx) => (
                        <tr key={idx} className="border-t border-neutral-100">
                          {CAMPOS_TAREA.filter(c => mapeo[c.key as keyof MapeoCampos]).map(campo => (
                            <td key={campo.key} className="px-3 py-2 text-neutral-700">
                              {String(fila[mapeo[campo.key as keyof MapeoCampos]] || '-').substring(0, 30)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Paso 3: Importando */}
          {paso === 'importar' && (
            <div className="text-center py-12">
              <Loader2 size={48} className="mx-auto text-primary animate-spin mb-4" />
              <h3 className="text-lg font-medium text-neutral-800">Importando tareas...</h3>
              <p className="text-sm text-neutral-500 mt-2">Por favor espera, esto puede tomar unos segundos.</p>
            </div>
          )}

          {/* Paso 4: Resultado */}
          {paso === 'resultado' && (
            <div className="py-4">
              <div className={`flex items-center gap-3 p-4 rounded-lg mb-4 ${resultado.errores.length === 0 ? 'bg-success-50' : 'bg-warning-50'}`}>
                {resultado.errores.length === 0 ? (
                  <Check size={24} className="text-success" />
                ) : (
                  <AlertCircle size={24} className="text-warning" />
                )}
                <div>
                  <p className="font-medium text-neutral-800">
                    {resultado.exitosas} tareas importadas correctamente
                  </p>
                  {resultado.errores.length > 0 && (
                    <p className="text-sm text-neutral-600">{resultado.errores.length} errores</p>
                  )}
                </div>
              </div>

              {resultado.errores.length > 0 && (
                <div className="bg-neutral-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <h4 className="font-medium text-neutral-700 mb-2">Errores:</h4>
                  <ul className="text-sm text-neutral-600 space-y-1">
                    {resultado.errores.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200">
          {paso === 'subir' && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          )}

          {paso === 'mapear' && (
            <>
              <button
                onClick={() => setPaso('subir')}
                className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Volver
              </button>
              <button
                onClick={handleImportar}
                disabled={!mapeo.titulo}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Importar {datos.length} tareas
              </button>
            </>
          )}

          {paso === 'resultado' && (
            <button
              onClick={() => {
                onSuccess();
                onClose();
              }}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
