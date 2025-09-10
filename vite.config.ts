import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr"

export default defineConfig({
  plugins: [tailwindcss(), react(), svgr(),],
  server: {
    host: '0.0.0.0',  // Allow access from other devices
    port: 5173,
  },
});