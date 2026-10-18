import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { nonaniumUi } from "../../src/vite.ts";

const monorepoRoot = fileURLToPath(new URL("../..", import.meta.url));
const uiSrc = fileURLToPath(new URL("../../src", import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@nonanium\/ui\/index\.css$/,
        replacement: `${uiSrc}/index.css`,
      },
      {
        find: /^@nonanium\/ui\/markdown$/,
        replacement: `${uiSrc}/markdown/index.ts`,
      },
      {
        find: /^@nonanium\/ui\/excalidraw$/,
        replacement: `${uiSrc}/excalidraw/index.ts`,
      },
      { find: /^@nonanium\/ui$/, replacement: `${uiSrc}/index.ts` },
    ],
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: { exclude: ["@nonanium/ui"] },
  server: { fs: { allow: [monorepoRoot] } },
  plugins: [
    nonaniumUi({ defaultThemeId: "nonanium" }),
    react(),
    tailwindcss(),
  ],
});
