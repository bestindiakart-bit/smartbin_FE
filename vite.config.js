import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react"; // 1. Add this import
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), // 2. Add this to the plugins array
    tailwindcss(),
  ],
});
