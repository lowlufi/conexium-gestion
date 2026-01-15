/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exportación estática para Cloudflare Pages
  output: 'export',
  // Desactivar optimización de imágenes (no soportada en export estático)
  images: {
    unoptimized: true,
  },
  // Trailing slash para mejor compatibilidad
  trailingSlash: true,
};

export default nextConfig;
