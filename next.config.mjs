import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para Cloudflare Pages - pages router usa edge por defecto
};

// Configuración para desarrollo local con bindings de Cloudflare
if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform();
}

export default nextConfig;
