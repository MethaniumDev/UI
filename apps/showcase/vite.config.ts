import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { methaniumUi } from "../../src/vite.ts";

const monorepoRoot = fileURLToPath(new URL("../..", import.meta.url));
const uiSrc = fileURLToPath(new URL("../../src", import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@methanium\/ui\/index\.css$/,
        replacement: `${uiSrc}/index.css`,
      },
      { find: /^@methanium\/ui$/, replacement: `${uiSrc}/index.ts` },
    ],
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: { exclude: ["@methanium/ui"] },
  server: { fs: { allow: [monorepoRoot] } },
  plugins: [
    methaniumUi({ defaultThemeId: "methanium" }),
    react(),
    tailwindcss(),
  ],
});
