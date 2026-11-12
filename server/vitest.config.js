import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/preparer.js'],
    // Le premier lancement télécharge le binaire MongoDB de test : on laisse du temps
    testTimeout: 30000,
    hookTimeout: 300000,
    fileParallelism: false,
  },
})
