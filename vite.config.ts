import { defineConfig } from 'vite'
import 'path'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/arcane-odyssey-guides/",
  plugins: [react()]
})
