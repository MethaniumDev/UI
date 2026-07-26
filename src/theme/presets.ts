import type { ThemeDesign, ThemePreset } from "./types";

export const DEFAULT_THEME_DESIGN: ThemeDesign = {
  density: 1,
  borderWidth: 1,
  shadowStrength: 0,
  surfaceContrast: 0,
  fontScale: 1,
  headingWeight: 600,
  motion: 1,
  fontFamily: "public-sans",
};

const TENSAMIN_LOGO = new URL("./assets/tensamin-logo.svg", import.meta.url)
  .href;
const METHANIUM_LOGO = new URL("./assets/methanium-logo.svg", import.meta.url)
  .href;
const SECRET_LOGO = new URL("./assets/secret-logo.svg", import.meta.url).href;

export function defineThemes<const T extends readonly ThemePreset[]>(
  themes: T,
): T {
  const ids = new Set<string>();
  for (const theme of themes) {
    if (!theme.id || ids.has(theme.id)) {
      throw new Error(`Theme ids must be non-empty and unique: ${theme.id}`);
    }
    ids.add(theme.id);
  }
  return themes;
}

export const BUILT_IN_THEMES = defineThemes([
  {
    id: "tensamin",
    title: "Tensamin",
    logo: TENSAMIN_LOGO,
    css: `:root[data-theme="tensamin"] {
  --card: oklch(0.97 0 0);
  --primary: oklch(0.54 0.105 186);
  --primary-foreground: oklch(0.985 0.012 184);
  --primary-foreground-alt: oklch(0.58 0.13 185);
  --ring: oklch(0.62 0.12 185);
  --sidebar-primary: oklch(0.58 0.12 185);
}
:root.dark[data-theme="tensamin"] {
  --card: oklch(0.2 0 0);
  --primary: oklch(0.68 0.12 184);
  --primary-foreground: oklch(0.16 0.025 190);
  --primary-foreground-alt: oklch(0.72 0.13 183);
}
:root[data-theme="tensamin"] [data-slot] {
  --tensamin-edge: var(--border);
  border-left-width: 0;
  border-right-width: 0;
  border-top-color: color-mix(in oklch, var(--tensamin-edge) 98%, white);
  border-bottom-color: color-mix(in oklch, var(--tensamin-edge) 88%, black);
  transition: border-color 160ms ease, background-color 160ms ease;
}
:root[data-theme="tensamin"] :where([data-slot="input"], [data-slot="textarea"], [data-slot="select-trigger"], [data-slot="native-select"], [data-slot="input-group"]) {
  --tensamin-edge: var(--input);
}
:root[data-theme="tensamin"] :where([data-slot="button"], [data-slot="badge"], [data-slot="toggle"])[data-variant="default"] {
  --tensamin-edge: var(--primary);
}
:root[data-theme="tensamin"] [data-slot="button"] {
  background-color: color-mix(in oklch, var(--background) 94%, white);
}
:root[data-theme="tensamin"] [data-slot="button"]:hover {
  background-color: color-mix(in oklch, var(--background) 88%, var(--foreground));
}
:root[data-theme="tensamin"] [data-slot="button"][data-variant="default"] {
  background-color: color-mix(in oklch, var(--primary) 93%, white);
}
:root[data-theme="tensamin"] [data-slot="button"][data-variant="default"]:hover {
  background-color: color-mix(in oklch, var(--primary) 85%, var(--primary-foreground));
}
:root[data-theme="tensamin"] :where([data-slot="button"], [data-slot="badge"], [data-slot="toggle"])[data-variant="subtleDefault"] {
  --tensamin-edge: var(--primary-foreground-alt);
}
:root[data-theme="tensamin"] [data-slot="button"][data-variant="subtleDefault"] {
  background-color: color-mix(in oklch, var(--background) 88%, var(--primary-foreground-alt));
  border-top-color: color-mix(in oklch, color-mix(in oklch, var(--background) 88%, var(--primary-foreground-alt)) 82%, white);
  border-bottom-color: color-mix(in oklch, color-mix(in oklch, var(--background) 88%, var(--primary-foreground-alt)) 90%, white);
}
:root[data-theme="tensamin"] [data-slot="button"][data-variant="subtleDefault"]:hover {
  background-color: color-mix(in oklch, var(--background) 80%, var(--primary-foreground-alt));
}
:root[data-theme="tensamin"] :where([data-slot="button"], [data-slot="badge"], [data-slot="toggle"])[data-variant="secondary"] {
  --tensamin-edge: var(--secondary);
}
:root[data-theme="tensamin"] [data-slot="button"][data-variant="secondary"] {
  background-color: color-mix(in oklch, var(--secondary) 94%, white);
}
:root[data-theme="tensamin"] [data-slot="button"][data-variant="secondary"]:hover {
  background-color: color-mix(in oklch, var(--secondary) 86%, var(--secondary-foreground));
}
:root[data-theme="tensamin"] :where([data-slot="button"], [data-slot="badge"], [data-slot="toggle"])[data-variant="destructive"] {
  --tensamin-edge: var(--destructive);
}
:root[data-theme="tensamin"] [data-slot="button"][data-variant="destructive"] {
  background-color: color-mix(in oklch, var(--background) 86%, var(--destructive));
}
:root[data-theme="tensamin"] [data-slot="button"][data-variant="destructive"]:hover {
  background-color: color-mix(in oklch, var(--background) 76%, var(--destructive));
}
:root[data-theme="tensamin"] [data-slot][data-variant="destructive"] {
  border-top-color: color-mix(in oklch, color-mix(in oklch, var(--background) 86%, var(--destructive)) 82%, white);
  border-bottom-color: color-mix(in oklch, color-mix(in oklch, var(--background) 86%, var(--destructive)) 90%, white);
}
:root[data-theme="tensamin"] :where([data-slot="button"], [data-slot="badge"], [data-slot="toggle"])[data-variant="outline"] {
  --tensamin-edge: color-mix(in oklch, var(--primary) 16%, var(--border));
}
:root[data-theme="tensamin"] :where([data-slot="button"], [data-slot="badge"], [data-slot="toggle"]):where([data-variant="ghost"], [data-variant="link"]) {
  --tensamin-edge: color-mix(in oklch, currentColor 12%, var(--border));
}
:root[data-theme="tensamin"] [data-slot][data-checked],
:root[data-theme="tensamin"] [data-slot][data-active] {
  --tensamin-edge: var(--primary);
}
:root[data-theme="tensamin"] [data-slot][aria-invalid="true"] {
  --tensamin-edge: var(--destructive);
}`,
  },
  {
    id: "methanium",
    title: "Methanium",
    logo: METHANIUM_LOGO,
    css: `:root[data-theme="methanium"] {
  --background: #d2e0f0;
  --foreground: #10161d;
  --card: #c0cfe0;
  --card-foreground: #10161d;
  --popover: #d2e0f0;
  --popover-foreground: #10161d;
  --primary: #8c47ad;
  --primary-foreground: #ffffff;
  --primary-foreground-alt: #7b3d98;
  --secondary: #aebed0;
  --secondary-foreground: #171e26;
  --muted: #c0cfe0;
  --muted-foreground: #515f70;
  --accent: #cf8fe633;
  --accent-foreground: #5a2a6d;
  --destructive: #b91c1c;
  --border: #8c9caf;
  --input: #9dadc0;
  --ring: #9d53bc;
  --chart-1: #8c47ad;
  --chart-2: #2563eb;
  --chart-3: #15803d;
  --chart-4: #ca8a04;
  --chart-5: #db2777;
  --sidebar: #aebed0;
  --sidebar-foreground: #10161d;
  --sidebar-primary: #8c47ad;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #cf8fe633;
  --sidebar-accent-foreground: #5a2a6d;
  --sidebar-border: #8c9caf;
  --sidebar-ring: #9d53bc;
}
:root.dark[data-theme="methanium"] {
  --background: #10161d;
  --foreground: #d2e0f0;
  --card: #242d38;
  --card-foreground: #d2e0f0;
  --popover: #242d38;
  --popover-foreground: #d2e0f0;
  --primary: #cf8fe6;
  --primary-foreground: #000000;
  --primary-foreground-alt: #bb6fd6;
  --secondary: #374351;
  --secondary-foreground: #d2e0f0;
  --muted: #1d262f;
  --muted-foreground: #9dadc0;
  --accent: #cf8fe633;
  --accent-foreground: #faecfc;
  --destructive: #cc4848;
  --border: #374351;
  --input: #445161;
  --ring: #cf8fe6;
  --chart-1: #cf8fe6;
  --chart-2: #4e96cc;
  --chart-3: #93b373;
  --chart-4: #eaaf03;
  --chart-5: #d74397;
  --sidebar: #10161d;
  --sidebar-foreground: #d2e0f0;
  --sidebar-primary: #cf8fe6;
  --sidebar-primary-foreground: #000000;
  --sidebar-accent: #2b3642;
  --sidebar-accent-foreground: #d2e0f0;
  --sidebar-border: #374351;
  --sidebar-ring: #cf8fe6;
}
:root[data-theme="methanium"] body {
  background-color: var(--background);
}
:root[data-theme="methanium"] :where([data-slot="card"], [data-slot="button"], [data-slot="input"], [data-slot="textarea"], [data-slot="native-select"], [data-slot="select-trigger"], [data-slot="input-group"], [data-slot="dialog-content"], [data-slot="alert-dialog-content"], [data-slot="popover-content"]) {
  border-radius: 0.25rem;
  border-style: solid;
}
:root[data-theme="methanium"] [data-slot="button"] {
  min-height: 0;
  font-weight: 500;
  transition-duration: 100ms;
}
:root[data-theme="methanium"] [data-slot="button"][data-size="xs"] {
  height: calc(2rem * var(--ui-density));
}
:root[data-theme="methanium"] :where([data-slot="button"], [data-slot="select-trigger"])[data-size="sm"] {
  height: calc(2.125rem * var(--ui-density));
}
:root[data-theme="methanium"] :where([data-slot="button"], [data-slot="select-trigger"])[data-size="default"],
:root[data-theme="methanium"] :where([data-slot="input"], [data-slot="native-select"], [data-slot="input-group"]) {
  height: calc(2.25rem * var(--ui-density));
}
:root[data-theme="methanium"] [data-slot="button"][data-size="lg"] {
  height: calc(2.5rem * var(--ui-density));
}
:root[data-theme="methanium"] [data-slot="button"]:not([data-size^="icon"]) {
  padding-inline: calc(1.35rem * var(--ui-density));
}
:root[data-theme="methanium"] [data-slot="button"][data-size="sm"]:not([data-size^="icon"]),
:root[data-theme="methanium"] [data-slot="button"][data-size="xs"]:not([data-size^="icon"]) {
  padding-inline: calc(1.25rem * var(--ui-density));
}
:root[data-theme="methanium"] :where([data-slot="input"], [data-slot="native-select"], [data-slot="select-trigger"]) {
  padding-inline: calc(1rem * var(--ui-density));
}
:root[data-theme="methanium"] [data-slot="textarea"] {
  padding: calc(0.785rem * var(--ui-density)) calc(1rem * var(--ui-density));
}
:root[data-theme="methanium"] :where([data-slot="card-header"], [data-slot="card-content"], [data-slot="card-footer"]) {
  padding-inline: calc(1rem * var(--ui-density));
}
:root[data-theme="methanium"] [data-slot="card"] {
  padding-block: calc(1rem * var(--ui-density));
}
:root[data-theme="methanium"] [data-slot="button"][data-variant="default"] {
  background-color: var(--primary);
  color: var(--primary-foreground);
}
:root[data-theme="methanium"] [data-slot="button"][data-variant="default"]:hover {
  background-color: #bb6fd6;
}
:root[data-theme="methanium"] [data-slot="button"][data-variant="secondary"] {
  background-color: var(--secondary);
  border-color: color-mix(in srgb, white 16%, transparent);
  color: var(--secondary-foreground);
}
:root[data-theme="methanium"] [data-slot="button"][data-variant="secondary"]:hover,
:root[data-theme="methanium"] [data-slot="button"][data-variant="outline"]:hover {
  background-color: color-mix(in srgb, var(--secondary) 80%, var(--foreground) 20%);
}
:root[data-theme="methanium"] [data-slot="button"][data-variant="outline"] {
  background-color: transparent;
  border-color: var(--input);
  color: var(--foreground);
}
:root[data-theme="methanium"] :where([data-slot="input"], [data-slot="textarea"], [data-slot="native-select"], [data-slot="select-trigger"], [data-slot="input-group"]) {
  background-color: color-mix(in srgb, var(--input) 55%, var(--background));
  border-color: var(--input);
  transition: background-color 100ms ease, border-color 100ms ease;
}
:root[data-theme="methanium"] :where([data-slot="input"], [data-slot="textarea"], [data-slot="native-select"], [data-slot="select-trigger"], [data-slot="input-group"]):not(:disabled):not([data-disabled]):not(:has(:disabled)):hover {
  background-color: color-mix(in srgb, var(--input) 72%, var(--background));
  border-color: color-mix(in srgb, var(--input) 75%, var(--foreground) 25%);
}`,
  },
  {
    id: "secret",
    title: "Secret",
    logo: SECRET_LOGO,
    css: `:root[data-theme="secret"] {
  --background: oklch(0.93 0.04 150);
  --foreground: oklch(0.2 0.025 150);
  --card: oklch(0.84 0.1 84);
  --card-foreground: oklch(0.2 0.025 150);
  --popover: oklch(0.975 0.012 135);
  --popover-foreground: oklch(0.2 0.025 150);
  --primary: oklch(0.72 0.14 80);
  --primary-foreground: oklch(0.19 0.025 75);
  --primary-foreground-alt: oklch(0.59 0.13 76);
  --secondary: oklch(0.925 0.025 145);
  --secondary-foreground: oklch(0.25 0.035 150);
  --muted: oklch(0.935 0.016 105);
  --muted-foreground: oklch(0.48 0.025 125);
  --accent: oklch(0.91 0.035 145);
  --accent-foreground: oklch(0.3 0.06 150);
  --destructive: oklch(0.52 0.11 95);
  --border: oklch(0.79 0.045 78);
  --input: oklch(0.86 0.025 110);
  --ring: oklch(0.7 0.13 80);
  --sidebar: oklch(0.945 0.018 145);
  --sidebar-foreground: oklch(0.22 0.03 150);
  --sidebar-primary: oklch(0.7 0.13 80);
  --sidebar-primary-foreground: oklch(0.19 0.025 75);
  --sidebar-accent: oklch(0.9 0.03 145);
  --sidebar-accent-foreground: oklch(0.3 0.06 150);
  --sidebar-border: oklch(0.78 0.04 78);
}
:root.dark[data-theme="secret"] {
  --background: oklch(0.16 0.025 155);
  --foreground: oklch(0.92 0.018 88);
  --card: oklch(0.38 0.08 82);
  --card-foreground: oklch(0.92 0.018 88);
  --popover: oklch(0.205 0.035 150);
  --popover-foreground: oklch(0.93 0.018 88);
  --primary: oklch(0.78 0.13 82);
  --primary-foreground: oklch(0.2 0.025 75);
  --primary-foreground-alt: oklch(0.8 0.12 84);
  --secondary: oklch(0.235 0.035 150);
  --secondary-foreground: oklch(0.9 0.018 88);
  --muted: oklch(0.225 0.025 145);
  --muted-foreground: oklch(0.7 0.025 95);
  --accent: oklch(0.235 0.055 150);
  --accent-foreground: oklch(0.91 0.025 82);
  --destructive: oklch(0.66 0.13 95);
  --border: oklch(0.34 0.045 76);
  --input: oklch(0.275 0.035 145);
  --ring: oklch(0.76 0.12 82);
  --sidebar: oklch(0.175 0.03 150);
  --sidebar-foreground: oklch(0.92 0.018 88);
  --sidebar-primary: oklch(0.76 0.12 82);
  --sidebar-primary-foreground: oklch(0.2 0.025 75);
  --sidebar-accent: oklch(0.225 0.05 150);
  --sidebar-accent-foreground: oklch(0.91 0.025 82);
  --sidebar-border: oklch(0.32 0.04 75);
}
:root[data-theme="secret"] body {
  background-color: var(--background);
  background-image: radial-gradient(circle at 12% 8%, oklch(0.3 0.07 150 / 9%), transparent 34%), radial-gradient(circle at 90% 5%, oklch(0.58 0.09 165 / 8%), transparent 30%);
  background-attachment: fixed;
}
:root.dark[data-theme="secret"] body {
  background-image: radial-gradient(circle at 12% 8%, oklch(0.29 0.075 150 / 52%), transparent 38%), radial-gradient(circle at 92% 4%, oklch(0.25 0.08 165 / 42%), transparent 34%);
}
:root[data-theme="secret"] [data-slot="button"][data-variant="default"] {
  background-color: var(--primary);
  background-image: linear-gradient(115deg, oklch(0.57 0.12 72) 0%, oklch(0.76 0.15 82) 30%, oklch(0.96 0.035 92) 47%, oklch(0.79 0.14 84) 58%, oklch(0.62 0.13 74) 100%);
  border-color: oklch(0.62 0.12 76);
  color: var(--primary-foreground);
  text-shadow: 0 1px rgb(255 255 255 / 35%);
  box-shadow: inset 0 1px rgb(255 255 255 / 45%), 0 0.45rem 1.2rem oklch(0.35 0.07 75 / 16%);
}
:root[data-theme="secret"] :where([data-slot="card"], [data-slot="dialog-content"], [data-slot="alert-dialog-content"]) {
  border-color: color-mix(in oklch, var(--border) 72%, var(--primary));
  box-shadow: inset 0 1px color-mix(in oklch, white 8%, transparent), 0 1rem 3rem oklch(0.1 0.03 150 / 12%);
}
:root[data-theme="secret"] [data-slot="card"] {
  background: linear-gradient(115deg, oklch(0.68 0.1 74) 0%, oklch(0.86 0.12 84) 30%, oklch(0.98 0.025 94) 47%, oklch(0.88 0.11 86) 58%, oklch(0.72 0.1 76) 100%);
}
:root.dark[data-theme="secret"] [data-slot="card"] {
  background: linear-gradient(115deg, oklch(0.27 0.055 72) 0%, oklch(0.43 0.09 82) 30%, oklch(0.68 0.075 91) 47%, oklch(0.46 0.09 84) 58%, oklch(0.3 0.06 74) 100%);
}
:root[data-theme="secret"] :where([data-slot="button"], [data-slot="badge"], [data-slot="toggle"])[data-variant="outline"] {
  background-color: oklch(0.86 0.055 150);
  border-color: oklch(0.5 0.09 150);
  color: oklch(0.27 0.07 150);
}
:root[data-theme="secret"] [data-slot="button"][data-variant="outline"]:hover {
  background-color: oklch(0.8 0.075 150);
}
:root.dark[data-theme="secret"] :where([data-slot="button"], [data-slot="badge"], [data-slot="toggle"])[data-variant="outline"] {
  background-color: oklch(0.22 0.055 150);
  border-color: oklch(0.52 0.1 150);
  color: oklch(0.82 0.08 150);
}
:root.dark[data-theme="secret"] [data-slot="button"][data-variant="outline"]:hover {
  background-color: oklch(0.3 0.07 150);
}
:root[data-theme="secret"] :where([data-slot="card-title"], [data-slot="item-media"][data-variant="icon"], [data-slot="badge"][data-variant="outline"]) svg {
  color: var(--primary);
}
:root[data-theme="secret"] [data-slot="separator"] {
  background: linear-gradient(90deg, transparent, color-mix(in oklch, var(--primary) 42%, var(--border)), transparent);
}`,
  },
] as const);

export function findTheme(
  themes: readonly ThemePreset[],
  id: string | null | undefined,
) {
  return id ? (themes.find((theme) => theme.id === id) ?? null) : null;
}
