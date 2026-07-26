import type { ThemeDesign, ThemePreset } from "./types";

export const DEFAULT_THEME_DESIGN: ThemeDesign = {
  density: 1,
  borderWidth: 1,
  shadowStrength: 0,
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
const OG_TENSAMIN_LOGO = new URL(
  "./assets/tensamin-og-logo.png",
  import.meta.url,
).href;

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
    defaultValues: {
      borderRadius: 0.625,
      design: DEFAULT_THEME_DESIGN,
    },
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
  border-left-color: color-mix(in oklch, var(--tensamin-edge) 89%, black);
  border-right-color: color-mix(in oklch, var(--tensamin-edge) 89%, black);
  border-top-color: color-mix(in oklch, var(--tensamin-edge) 98%, white);
  border-bottom-color: color-mix(in oklch, var(--tensamin-edge) 83%, black);
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
  background-color: color-mix(in oklch, var(--primary) 10%, transparent);
  border-color: transparent;
  color: var(--primary-foreground-alt);
}
:root[data-theme="tensamin"] [data-slot="button"][data-variant="subtleDefault"]:hover {
  background-color: color-mix(in oklch, var(--primary) 20%, transparent);
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
  border-top-color: color-mix(in oklch, color-mix(in oklch, var(--background) 86%, var(--destructive)) 98%, white);
  border-left-color: color-mix(in oklch, color-mix(in oklch, var(--background) 86%, var(--destructive)) 89%, black);
  border-right-color: color-mix(in oklch, color-mix(in oklch, var(--background) 86%, var(--destructive)) 89%, black);
  border-bottom-color: color-mix(in oklch, color-mix(in oklch, var(--background) 86%, var(--destructive)) 83%, black);
}
:root[data-theme="tensamin"] :where([data-slot="button"], [data-slot="badge"], [data-slot="toggle"])[data-variant="outline"] {
  --tensamin-edge: var(--input);
}
:root[data-theme="tensamin"] :where([data-slot="input"], [data-slot="textarea"], [data-slot="select-trigger"], [data-slot="native-select"], [data-slot="input-group"], [data-slot="button"][data-variant="outline"], [data-slot="badge"][data-variant="outline"], [data-slot="toggle"][data-variant="outline"]):is(:hover, :focus-visible, :focus-within) {
  --tensamin-edge: color-mix(in oklch, var(--input) 75%, var(--ring));
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
    id: "og-tensamin",
    title: "OG Tensamin",
    logo: OG_TENSAMIN_LOGO,
    defaultValues: {
      borderRadius: 0.625,
      design: DEFAULT_THEME_DESIGN,
    },
    css: `:root[data-theme="og-tensamin"] {
  --background: #f2f1f3;
  --foreground: #17181e;
  --card: #d8d6db;
  --card-foreground: #17181e;
  --popover: #f2f1f3;
  --popover-foreground: #17181e;
  --primary: #aca1cf;
  --primary-foreground: #0f1014;
  --primary-foreground-alt: #aca1cf;
  --secondary: #d8d6db;
  --secondary-foreground: #17181e;
  --muted: #d8d6db;
  --muted-foreground: #383b46;
  --accent: #bebbc3;
  --accent-foreground: #0f1014;
  --destructive: #e78284;
  --border: #a4a0ab;
  --input: #a4a0ab;
  --ring: #aca1cf;
  --sidebar: #d8d6db;
  --sidebar-foreground: #17181e;
  --sidebar-primary: #aca1cf;
  --sidebar-primary-foreground: #0f1014;
  --sidebar-accent: #bebbc3;
  --sidebar-accent-foreground: #0f1014;
  --sidebar-border: #a4a0ab;
  --sidebar-ring: #aca1cf;
  --chart-1: #90b99f;
  --chart-2: #babbf1;
  --chart-3: #aca1cf;
  --chart-4: #e29eca;
  --chart-5: #e5c890;
}
:root.dark[data-theme="og-tensamin"] {
  --background: #0f1014;
  --foreground: #bebbc3;
  --card: #17181e;
  --card-foreground: #bebbc3;
  --popover: #17181e;
  --popover-foreground: #bebbc3;
  --primary: #aca1cf;
  --primary-foreground: #0f1014;
  --primary-foreground-alt: #babbf1;
  --secondary: #282a33;
  --secondary-foreground: #d8d6db;
  --muted: #17181e;
  --muted-foreground: #a4a0ab;
  --accent: #282a33;
  --accent-foreground: #f2f1f3;
  --destructive: #e78284;
  --border: #282a33;
  --input: #383b46;
  --ring: #aca1cf;
  --sidebar: #0f1014;
  --sidebar-foreground: #bebbc3;
  --sidebar-primary: #aca1cf;
  --sidebar-primary-foreground: #0f1014;
  --sidebar-accent: #282a33;
  --sidebar-accent-foreground: #f2f1f3;
  --sidebar-border: #282a33;
  --sidebar-ring: #aca1cf;
  --chart-1: #90b99f;
  --chart-2: #babbf1;
  --chart-3: #aca1cf;
  --chart-4: #e29eca;
  --chart-5: #e5c890;
}
:root[data-theme="og-tensamin"] :where([data-slot="select-content"], [data-slot="dropdown-menu-content"], [data-slot="dropdown-menu-sub-content"], [data-slot="context-menu-content"], [data-slot="context-menu-sub-content"], [data-slot="menubar-content"], [data-slot="menubar-sub-content"], [data-slot="combobox-content"], [data-slot="popover-content"], [data-slot="hover-card-content"]) {
  background-color: var(--popover);
  border-color: var(--border);
  color: var(--popover-foreground);
}
:root[data-theme="og-tensamin"] :where([data-slot="select-item"], [data-slot="dropdown-menu-item"], [data-slot="dropdown-menu-checkbox-item"], [data-slot="dropdown-menu-radio-item"], [data-slot="dropdown-menu-sub-trigger"], [data-slot="context-menu-item"], [data-slot="context-menu-checkbox-item"], [data-slot="context-menu-radio-item"], [data-slot="context-menu-sub-trigger"], [data-slot="menubar-item"], [data-slot="menubar-checkbox-item"], [data-slot="menubar-radio-item"], [data-slot="menubar-sub-trigger"]):focus,
:root[data-theme="og-tensamin"] [data-slot="combobox-item"][data-highlighted],
:root[data-theme="og-tensamin"] [data-slot="command-item"][data-selected] {
  background-color: var(--accent);
  color: var(--accent-foreground);
}`,
  },
  {
    id: "methanium",
    title: "Methanium",
    logo: METHANIUM_LOGO,
    defaultValues: {
      borderRadius: 0.25,
      design: {
        ...DEFAULT_THEME_DESIGN,
        headingWeight: 500,
        fontFamily: "system",
      },
    },
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
  border-radius: var(--radius);
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
  border-color: transparent;
}
:root[data-theme="methanium"] [data-slot="button"][data-variant="default"]:hover {
  background-color: #bb6fd6;
}
:root[data-theme="methanium"] [data-slot="button"][data-variant="secondary"] {
  background-color: var(--secondary);
  border-color: color-mix(in srgb, white 16%, transparent);
  color: var(--secondary-foreground);
}
:root[data-theme="methanium"] [data-slot="button"][data-variant="secondary"]:hover {
  background-color: color-mix(in srgb, var(--secondary) 80%, var(--foreground) 20%);
}
:root[data-theme="methanium"] :where([data-slot="input"], [data-slot="textarea"], [data-slot="native-select"], [data-slot="select-trigger"], [data-slot="input-group"], [data-slot="button"][data-variant="outline"]) {
  background-color: color-mix(in srgb, var(--input) 55%, var(--background));
  border-color: var(--input);
  color: var(--foreground);
  transition: background-color 100ms ease, border-color 100ms ease;
}
:root[data-theme="methanium"] :where([data-slot="input"], [data-slot="textarea"], [data-slot="native-select"], [data-slot="select-trigger"], [data-slot="input-group"], [data-slot="button"][data-variant="outline"]):not(:disabled):not([data-disabled]):not(:has(:disabled)):hover {
  background-color: color-mix(in srgb, var(--input) 72%, var(--background));
  border-color: color-mix(in srgb, var(--input) 75%, var(--foreground) 25%);
}`,
  },
  {
    id: "secret",
    title: "Secret",
    logo: SECRET_LOGO,
    defaultValues: {
      borderRadius: 0.625,
      design: DEFAULT_THEME_DESIGN,
    },
    css: `:root[data-theme="secret"] {
  --secret-border: color-mix(in srgb, #ffe8b4 15%, #24120c 85%);
  --secret-control: #5e244e;
  --background: #2f1b13;
  --foreground: #fffaf2;
  --card: #f9b637;
  --card-foreground: #24120c;
  --popover: #5e244e;
  --popover-foreground: #fffaf2;
  --primary: #f9b637;
  --primary-foreground: #24120c;
  --primary-foreground-alt: #fb6c00;
  --secondary: #5e244e;
  --secondary-foreground: #fffaf2;
  --muted: #24120c;
  --muted-foreground: #ffe8b4;
  --accent: #fb6c00;
  --accent-foreground: #24120c;
  --destructive: #e73f1e;
  --border: var(--secret-border);
  --input: var(--secret-border);
  --ring: #fb6c00;
  --sidebar: #24120c;
  --sidebar-foreground: #fffaf2;
  --sidebar-primary: #f9b637;
  --sidebar-primary-foreground: #24120c;
  --sidebar-accent: #aa1c41;
  --sidebar-accent-foreground: #fffaf2;
  --sidebar-border: var(--secret-border);
}
:root.dark[data-theme="secret"] {
  --background: #24120c;
  --foreground: #ffe8b4;
  --card: #f9b637;
  --card-foreground: #24120c;
  --popover: #2f1b13;
  --popover-foreground: #ffe8b4;
  --primary: #f9b637;
  --primary-foreground: #24120c;
  --primary-foreground-alt: #fb6c00;
  --secondary: #5e244e;
  --secondary-foreground: #fffaf2;
  --muted: #2f1b13;
  --muted-foreground: #e68457;
  --accent: #e73f1e;
  --accent-foreground: #fffaf2;
  --destructive: #e73f1e;
  --border: var(--secret-border);
  --input: var(--secret-border);
  --ring: #fb6c00;
  --sidebar: #24120c;
  --sidebar-foreground: #ffe8b4;
  --sidebar-primary: #f9b637;
  --sidebar-primary-foreground: #24120c;
  --sidebar-accent: #aa1c41;
  --sidebar-accent-foreground: #fffaf2;
  --sidebar-border: var(--secret-border);
}
:root[data-theme="secret"] body {
  background-color: var(--background);
  background-image: radial-gradient(circle at 12% 8%, rgb(94 36 78 / 24%), transparent 34%), radial-gradient(circle at 90% 5%, rgb(231 63 30 / 14%), transparent 30%);
  background-attachment: fixed;
}
:root.dark[data-theme="secret"] body {
  background-image: radial-gradient(circle at 12% 8%, rgb(94 36 78 / 42%), transparent 38%), radial-gradient(circle at 92% 4%, rgb(170 28 65 / 30%), transparent 34%);
}
:root[data-theme="secret"] :where([data-slot="button"], [data-slot="toggle"], [data-slot="input"], [data-slot="textarea"], [data-slot="native-select"], [data-slot="select-trigger"], [data-slot="input-group"], [data-slot="checkbox"], [data-slot="radio-group-item"], [data-slot="switch"]) {
  background-image: linear-gradient(to top, rgb(255 255 255 / 12%), rgb(255 255 255 / 2%));
  background-repeat: no-repeat;
}
:root[data-theme="secret"] [data-slot="button"][data-variant="subtleDefault"] {
  background-image: linear-gradient(to top, rgb(255 232 180 / 12%), rgb(255 232 180 / 2%));
  color: var(--foreground);
}
:root[data-theme="secret"] :where([data-slot="input"], [data-slot="textarea"], [data-slot="native-select"], [data-slot="select-trigger"], [data-slot="input-group"]) {
  background-color: var(--secret-control);
  color: var(--foreground);
}
:root[data-theme="secret"] :where([data-slot="input"], [data-slot="textarea"], [data-slot="native-select"], [data-slot="select-trigger"], [data-slot="input-group"]):hover {
  background-color: color-mix(in srgb, var(--secret-control) 84%, #24120c 16%);
  border-color: var(--input);
}
:root[data-theme="secret"] :where([data-slot="input"], [data-slot="textarea"], [data-slot="native-select"], [data-slot="select-trigger"], [data-slot="input-group"]):is(:focus-visible, :focus-within) {
  background-color: color-mix(in srgb, var(--secret-control) 84%, #24120c 16%);
  border-color: var(--input);
}
:root[data-theme="secret"] [data-slot="select-trigger"]:is([data-popup-open], [data-open], [aria-expanded="true"]) {
  background-color: color-mix(in srgb, var(--secret-control) 84%, #24120c 16%);
  border-color: var(--input);
}
:root[data-theme="secret"] [data-slot="select-content"] {
  background-color: var(--popover);
  border-color: var(--secret-border);
  color: var(--popover-foreground);
}
:root.dark[data-theme="secret"] [data-slot="select-content"] {
  border-color: var(--secret-border);
}
:root[data-theme="secret"] [data-slot="select-item"]:is(:hover, :focus, [data-highlighted], [data-selected]) {
  background-color: #24120c;
  color: #ffe8b4;
}
:root[data-theme="secret"] [data-slot="button"][data-variant="default"] {
  background-color: var(--primary);
  background-image: linear-gradient(to top, rgb(255 255 255 / 12%), rgb(255 255 255 / 2%)), linear-gradient(115deg, #e73f1e 0%, #fb6c00 30%, #ffdd9c 47%, #f9b637 58%, #fb6c00 100%);
  border-color: var(--secret-border);
  color: var(--primary-foreground);
  text-shadow: 0 1px rgb(255 255 255 / 35%);
  box-shadow: inset 0 1px rgb(255 255 255 / 45%), 0 0.45rem 1.2rem rgb(36 18 12 / 28%);
}
:root[data-theme="secret"] :where([data-slot="card"], [data-slot="dialog-content"], [data-slot="alert-dialog-content"]) {
  border-color: var(--secret-border);
  box-shadow: inset 0 1px color-mix(in oklch, white 8%, transparent), 0 1rem 3rem rgb(97 37 82 / 12%);
}
:root[data-theme="secret"] [data-slot="card"] {
  background: linear-gradient(115deg, #e68457 0%, #f9b637 30%, #fffaf2 47%, #ffdd9c 58%, #fb6c00 100%);
}
:root.dark[data-theme="secret"] [data-slot="card"] {
  background: linear-gradient(115deg, #5e244e 0%, #aa1c41 18%, #e68457 32%, #f9b637 44%, #fffaf2 50%, #ffdd9c 58%, #fb6c00 72%, #5e244e 100%);
}
:root[data-theme="secret"] :where([data-slot="button"], [data-slot="badge"], [data-slot="toggle"])[data-variant="outline"] {
  background-color: #5e244e;
  border-color: var(--input);
  color: #fffaf2;
}
:root[data-theme="secret"] [data-slot="button"][data-variant="outline"]:hover {
  background-color: color-mix(in srgb, #5e244e 82%, #24120c 18%);
  border-color: var(--input);
}
:root[data-theme="secret"] :where([data-slot="badge"], [data-slot="toggle"])[data-variant="outline"]:hover {
  background-color: color-mix(in srgb, #5e244e 82%, #24120c 18%);
  border-color: var(--input);
}
:root[data-theme="secret"] :where([data-slot="button"], [data-slot="badge"], [data-slot="toggle"])[data-variant="outline"]:is(:focus-visible, [aria-expanded="true"], [data-popup-open], [data-open]) {
  background-color: color-mix(in srgb, #5e244e 82%, #24120c 18%);
  border-color: var(--input);
}
:root.dark[data-theme="secret"] :where([data-slot="button"], [data-slot="badge"], [data-slot="toggle"])[data-variant="outline"] {
  background-color: #5e244e;
  border-color: var(--input);
  color: #ffe8b4;
}
:root.dark[data-theme="secret"] [data-slot="button"][data-variant="outline"]:hover {
  background-color: color-mix(in srgb, #5e244e 82%, #24120c 18%);
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
