import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite 配置文件
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // 前端运行在 3000 端口
    proxy: {
      // 代理 API 请求到后端
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})

