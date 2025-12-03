import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
  ],
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'WalletConnectKit',
      fileName: 'wallet-connect-kit',
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    }
  }
})

// package.json
// "main": "./dist/wallet-connect-kit.umd.js",
  // "module": "./dist/wallet-connect-kit.es.js",
  // "types": "./dist/index.d.ts",


  
  // "peerDependencies": {
  //   "react": "^19.2.0",
  //   "react-dom": "^19.2.0"
  // }