import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts';
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
    dts({
      tsconfigPath: './tsconfig.build.json', // 使用专门的构建配置
      insertTypesEntry: true, // 生成类型入口
      rollupTypes: true,      // *确保类型文件被纳入dist
      entryRoot: 'src', // 明确指定入口根目录
      strictOutput: true, // 强制类型输出
      pathsToAliases: false, // 禁用路径别名转换（优先保证类型生成）
    })
  ],
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'WalletConnectKit',
      fileName: (format) => `wallet-connect-kit.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'tailwindcss'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          tailwindcss: 'tailwindcss',
        },
      },
    },
  }
})
