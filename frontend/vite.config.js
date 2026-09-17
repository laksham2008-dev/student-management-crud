import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Bind to all local interfaces (IPv4 + IPv6) so both
    // http://localhost:5173/ and http://127.0.0.1:5173/ work.
    // Vite's Windows default binds ::1 only, which breaks 127.0.0.1:5173.
    host: true,
    port: 5173,
  },
})
