import { defineConfig, loadEnv } from "vite";
export default defineConfig(({ mode }) => { const env = loadEnv(mode, process.cwd(), ""); return { define: { "import.meta.env.VITE_CONVEX_URL": JSON.stringify(env.CONVEX_URL) }, server: { host: "127.0.0.1", port: 5173, strictPort: true } }; });
