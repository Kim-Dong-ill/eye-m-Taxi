import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// __dirname 정의 (ESM에서 사용하기 위함)
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,  // 기본 포트
    host: 'true',  // 모든 IP 주소에서 접근 허용
    strictPort: true,
    hmr: {
      host: '192.168.106.239',
      port: 5173
    }
  },
})
