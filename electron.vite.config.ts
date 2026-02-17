import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    main: {
        resolve: {
            alias: {
                '@shared': resolve('src/shared'),
                '@main': resolve('src/main')
            }
        },
        build: {
            rollupOptions: {
                input: {
                    index: resolve('src/main/index.ts'),
                    KafkaWorker: resolve('src/main/kafka/worker/KafkaWorker.ts')
                },
                output: {
                    entryFileNames: '[name].js'
                }
            }
        }
    },
    preload: {
        resolve: {
            alias: {
                '@shared': resolve('src/shared'),
                '@main': resolve('src/main')
            }
        }
    },
    renderer: {
        resolve: {
            alias: {
                '@renderer': resolve('src/renderer/src'),
                '@shared': resolve('src/shared')
            }
        },
        plugins: [react()]
    }
})
