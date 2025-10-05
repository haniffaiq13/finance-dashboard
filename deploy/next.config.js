/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Kamu mau build lanjut walau error -> aktifkan dua ini
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // boleh kosongkan experimental; plugin akan handle SSR/Edge
}

module.exports = nextConfig
