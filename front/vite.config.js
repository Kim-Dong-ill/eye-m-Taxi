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
    host: 'localhost',  // 명시적으로 localhost 지정
  }
})
