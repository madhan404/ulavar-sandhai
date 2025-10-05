// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// const VITE_URL_API = import.meta.env.VITE_URL_API || 'http://localhost:3000';

// console.log('VITE_URL_API:', VITE_URL_API);

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 5173,
//     proxy: {
//       '/api': {
//         target: VITE_URL_API,
//         changeOrigin: true,
//       },
//     },
//   },
//   build: {
//     outDir: 'dist',
//     sourcemap: true,
//   },
// });


import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  console.log('Loaded env VITE_URL_API:', env.VITE_URL_API);

  return defineConfig({
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_URL_API || 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
  });
};
