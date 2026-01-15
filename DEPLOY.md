# Despliegue de Conexium Gestión - Next.js

## Opción 1: Despliegue vía Git (Recomendado)

### Paso 1: Subir código a GitHub/GitLab

```bash
git init
git add .
git commit -m "Initial commit - Conexium Gestion Next.js"
git remote add origin https://github.com/TU_USUARIO/conexium-gestion.git
git push -u origin main
```

### Paso 2: Conectar con Cloudflare Pages

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Selecciona tu cuenta (daguilera@conexium.cl)
3. Ve a **Workers & Pages** > **Create** > **Pages**
4. Selecciona **Connect to Git**
5. Autoriza acceso al repositorio
6. Configuración de build:
   - **Framework preset**: Next.js
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Node.js version**: 18.x

### Paso 3: Variables de Entorno (Opcional)

En Cloudflare Pages > Settings > Environment variables:
- `ENVIRONMENT`: `production`

---

## Opción 2: Despliegue manual con Vercel

```bash
npm install -g vercel
vercel login
vercel
```

---

## Opción 3: Usar la versión Workers (Ya desplegada)

La versión vanilla JS ya está desplegada y funcionando en:
**https://conexium-gestion.daguilera.workers.dev**

Para actualizar esa versión:
```bash
cd "../Gestion de proyectos"
npm run deploy
```

---

## Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abre http://localhost:3000

---

## Estructura del Proyecto

```
gestion-next/
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Layout principal
│   │   ├── page.tsx        # Página principal (SPA)
│   │   └── globals.css     # Estilos globales
│   ├── components/
│   │   ├── Sidebar.tsx     # Navegación lateral
│   │   ├── Header.tsx      # Cabecera con búsqueda
│   │   └── sections/       # Secciones de la app
│   │       ├── Dashboard.tsx
│   │       ├── Proyectos.tsx
│   │       ├── Cronograma.tsx
│   │       ├── Posits.tsx
│   │       ├── Comunicacion.tsx
│   │       ├── Alertas.tsx
│   │       └── Usuarios.tsx
│   ├── context/
│   │   └── AuthContext.tsx # Contexto de autenticación
│   └── types/
│       └── index.ts        # Tipos TypeScript
├── tailwind.config.ts      # Colores corporativos
├── next.config.mjs         # Configuración Next.js
└── package.json
```

---

## Colores Corporativos

- **Primary (Azul)**: #218acb
- **Danger (Rojo)**: #e63426
- **Success (Verde)**: #58b998
- **Accent (Morado)**: #ce95c2
- **Warning (Amarillo)**: #ffcc07
- **Neutral (Gris)**: #707070

---

## Notas

- El modo demo está activado (simula usuario Mariella Ruiz como admin)
- Para conectar con la BD D1, se necesitan crear API Routes en `/src/app/api/`
- La base de datos D1 ya existe: `conexium-gestion-db`
