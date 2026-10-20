import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O jogo é uma página estática (public/index.html, gerada por `npm run jogo`): a raiz do site abre ele
  async rewrites() {
    return { beforeFiles: [{ source: "/", destination: "/index.html" }], afterFiles: [], fallback: [] };
  },
};

export default nextConfig;
