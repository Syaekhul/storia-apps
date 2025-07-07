import { defineConfig } from "vite";
import { resolve } from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  root: resolve(__dirname, "src"),
  publicDir: resolve(__dirname, "src", "public"),
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html")
      }
    }
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src")
    }
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      strategies: "injectManifest",
      srcDir: ".",
      filename: "sw.js",
      includeAssets: [
        "favicon.png",
        "images/logo-144x144.png",
        "images/logo.png",
        "images/add-icon.png",
        "marker-icon-2x.png",
        "marker-icon.png",
        "marker-shadow.png"
      ],
      manifest: {
        id: "/#/",
        start_url: "/#/",
        scope: "/",
        name: "Story Web App",
        short_name: "Storia App",
        description: "Aplikasi sosial media khusus murid dicoding",
        display: "standalone",
        background_color: "#FFFFFF",
        theme_color: "#007bff",
        icons: [
          {
            src: "/images/logo-144x144.png",
            sizes: "144x144",
            type: "image/png",
            purpose: "any"
          }
        ],
        shortcuts: [
          {
            name: "Tambah Story",
            short_name: "Tambah",
            description: "Membuat story baru",
            url: "/#/add",
            icons: [
              {
                src: "/images/add-icon.png",
                sizes: "96x96",
                type: "image/png"
              }
            ]
          }
        ],
        screenshots: [
          {
            src: "images/screenshots/story-app-home(mobile).png",
            sizes: "486x640",
            type: "image/png",
            label: "Tampilan Mobile",
            platform: "narrow"
          },
          {
            src: "images/screenshots/story-app-home.png",
            sizes: "1919x1001",
            type: "image/png",
            label: "Tampilan Desktop",
            platform: "wide"
          }
        ]
      }
    })
  ]
});
