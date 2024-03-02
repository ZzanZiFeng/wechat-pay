import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // disableHostcheck: true,
    host: "0.0.0.0",
    port: 8001,

    proxy: {
      "/api": {
        target: "http://192.168.0.28:7073",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(__dirname, "src"),
      },
    ], 
    extensions: [".js", ".ts", ".jsx", ".tsx", ".tsx"],
  },
  optimizeDeps: {
    include: ["axios"],
  },
});
