import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
declare const __dirname: string; // Add this line

export default defineConfig({
  // base: "/arcane-odyssey-guides/",
  plugins: [react()],
  /*
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        armor: path.resolve(__dirname, "armor/index.html"),
        treasure: path.resolve(__dirname, "treasure/index.html"),
      }
    }
  },
  resolve: {
    alias: {
        "styles.css": "./styles.css",
    }
  }
  */
})
