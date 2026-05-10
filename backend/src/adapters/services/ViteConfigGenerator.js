const ViteConfigGenerator = {
  generate: () => {
    const files = [];

    try {
      const viteConfig = ViteConfigGenerator.generateViteConfig();
      files.push({
        path: 'frontend/vite.config.js',
        content: viteConfig,
      });
    } catch (error) {
      console.error('Error generating vite.config.js:', error.message);
    }

    return files;
  },

  generateViteConfig: () => {
    return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    cors: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
`;
  },
};

module.exports = ViteConfigGenerator;
