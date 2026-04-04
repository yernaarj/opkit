// vite.config.ts
import { defineConfig } from "file:///home/user/projects/opkit/node_modules/vite/dist/node/index.js";
import react from "file:///home/user/projects/opkit/node_modules/@vitejs/plugin-react/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [react()],
  // Proxy API and WebSocket requests to the NestJS backend
  // so the frontend doesn't need CORS handling in development
  server: {
    host: true,
    // bind to 0.0.0.0 so Windows browser can reach WSL
    port: 5173,
    proxy: {
      // REST API
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true
      },
      // WebSocket (Socket.IO uses /socket.io path by default)
      "/socket.io": {
        target: "http://localhost:3000",
        ws: true,
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      // Allows: import { something } from '@/components/...'
      "@": "/src"
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS91c2VyL3Byb2plY3RzL29wa2l0L2FwcHMvZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3VzZXIvcHJvamVjdHMvb3BraXQvYXBwcy9mcm9udGVuZC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS91c2VyL3Byb2plY3RzL29wa2l0L2FwcHMvZnJvbnRlbmQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG5cbiAgLy8gUHJveHkgQVBJIGFuZCBXZWJTb2NrZXQgcmVxdWVzdHMgdG8gdGhlIE5lc3RKUyBiYWNrZW5kXG4gIC8vIHNvIHRoZSBmcm9udGVuZCBkb2Vzbid0IG5lZWQgQ09SUyBoYW5kbGluZyBpbiBkZXZlbG9wbWVudFxuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiB0cnVlLCAgIC8vIGJpbmQgdG8gMC4wLjAuMCBzbyBXaW5kb3dzIGJyb3dzZXIgY2FuIHJlYWNoIFdTTFxuICAgIHBvcnQ6IDUxNzMsXG4gICAgcHJveHk6IHtcbiAgICAgIC8vIFJFU1QgQVBJXG4gICAgICAnL2FwaSc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDozMDAwJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIC8vIFdlYlNvY2tldCAoU29ja2V0LklPIHVzZXMgL3NvY2tldC5pbyBwYXRoIGJ5IGRlZmF1bHQpXG4gICAgICAnL3NvY2tldC5pbyc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDozMDAwJyxcbiAgICAgICAgd3M6IHRydWUsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcblxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIC8vIEFsbG93czogaW1wb3J0IHsgc29tZXRoaW5nIH0gZnJvbSAnQC9jb21wb25lbnRzLy4uLidcbiAgICAgICdAJzogJy9zcmMnLFxuICAgIH0sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBdVMsU0FBUyxvQkFBb0I7QUFDcFUsT0FBTyxXQUFXO0FBR2xCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQTtBQUFBO0FBQUEsRUFJakIsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUE7QUFBQSxNQUVMLFFBQVE7QUFBQSxRQUNOLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxNQUNoQjtBQUFBO0FBQUEsTUFFQSxjQUFjO0FBQUEsUUFDWixRQUFRO0FBQUEsUUFDUixJQUFJO0FBQUEsUUFDSixjQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBRUEsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBO0FBQUEsTUFFTCxLQUFLO0FBQUEsSUFDUDtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
