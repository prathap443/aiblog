import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Optional: Load environment variables from .env file
import dotenv from 'dotenv'
dotenv.config()

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL)
  }
})
