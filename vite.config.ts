import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwind()],
  resolve: { tsconfigPaths: true },
  server: { port: 8080, strictPort: true },
  preview: { port: 8081, strictPort: true },
});
