import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/.{idea,git,cache,output,temp}/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.next/',
        'e2e/',
        'frontend/',
        'backend/',
        '**/*.config.ts',
        '**/*.d.ts',
        '**/dist/**',
      ],
      thresholds: {
        lines: 65,
        functions: 60,
        branches: 60,
        statements: 65,
      },
    },
    globals: true,
  },
  resolve: {
    alias: {
      '@/app': path.resolve(__dirname, './app'),
      '@': path.resolve(__dirname, './'),
    },
  },
})
