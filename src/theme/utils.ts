import config from "../config.json" with { type: "json" };

import type {
  Base16Key,
  Base16Palette,
  HslColor,
  ResolvedThemePolarity,
  ThemePolarity,
  ThemeTint,
} from "./types";

export const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";
export const THEME_VALUES: ThemePolarity[] = ["dark", "light", "system"];
export const BASE16_KEYS: Base16Key[] = [
  "base00",
  "base01",
  "base02",
  "base03",
  "base04",
  "base05",
  "base06",
  "base07",
  "base08",
  "base09",
  "base0A",
  "base0B",
  "base0C",
  "base0D",
  "base0E",
  "base0F",
];
export const THEME_TINT_OPTIONS = [
  { value: "soft", label: "Soft" },
  { value: "hard", label: "Hard" },
  { value: "extreme", label: "Extreme" },
] as const satisfies { value: ThemeTint; label: string }[];

export const TINT_VALUES = THEME_TINT_OPTIONS.map((option) => option.value);
export const DEFAULT_THEME_COLOR = "";
export const DEFAULT_BORDER_RADIUS = 0.5;
export const MIN_BORDER_RADIUS = 0;
export const MAX_BORDER_RADIUS = 1.5;
export const COLOR_PICKER_FALLBACK = "#2f9b9b";
export const DEFAULT_BASE16_PALETTE: Base16Palette = {
  base00: "#151718",
  base01: "#1d2224",
  base02: "#2c3336",
  base03: "#6b767a",
  base04: "#8f9a9e",
  base05: "#d7dee0",
  base06: "#edf1f2",
  base07: "#ffffff",
  base08: "#e05f65",
  base09: "#d98f45",
  base0A: "#d1b85c",
  base0B: "#7dbb72",
  base0C: "#65b8b4",
  base0D: "#5da8c7",
  base0E: "#b18fd6",
  base0F: "#c58b70",
};
export const THEME_VARIABLE_NAMES = [
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--primary",
  "--primary-foreground",
  "--primary-foreground-alt",
  "--secondary",
  "--secondary-foreground",
  "--muted",
  "--muted-foreground",
  "--accent",
  "--accent-foreground",
  "--destructive",
  "--border",
  "--input",
  "--ring",
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-4",
  "--chart-5",
  "--sidebar",
  "--sidebar-foreground",
  "--sidebar-primary",
  "--sidebar-primary-foreground",
  "--sidebar-accent",
  "--sidebar-accent-foreground",
  "--sidebar-border",
  "--sidebar-ring",
];

export function isTheme(value: string | null): value is ThemePolarity {
  if (value === null) return false;
  return THEME_VALUES.includes(value as ThemePolarity);
}

export function isTint(value: string | null): value is ThemeTint {
  if (value === null) return false;
  return TINT_VALUES.includes(value as ThemeTint);
}

export function isHexColor(value: string | null): value is string {
  return value !== null && /^#[0-9a-f]{6}$/i.test(value);
}

export function isThemeColor(value: string | null): value is string {
  return value === "" || isHexColor(value);
}

export function parseBorderRadius(value: string | null) {
  if (value === null || value === "") return null;

  const radius = Number(value);
  if (!Number.isFinite(radius)) return null;

  return clamp(radius, MIN_BORDER_RADIUS, MAX_BORDER_RADIUS);
}

export function parseBase16Palette(value: unknown): Base16Palette | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  const palette: Partial<Base16Palette> = {};
  const record = value as Record<string, unknown>;

  for (const key of BASE16_KEYS) {
    const color = record[key];

    if (typeof color !== "string" || !isHexColor(color)) return null;
    palette[key] = color.toLowerCase();
  }

  return palette as Base16Palette;
}

export function parseStoredBase16Palette(value: string | null) {
  if (value === null || value === "") return null;

  try {
    return parseBase16Palette(JSON.parse(value));
  } catch {
    return null;
  }
}

export function serializeBase16Palette(palette: Base16Palette | null) {
  return palette === null ? "" : JSON.stringify(palette);
}

export function formatPaletteJson(palette: Base16Palette | null) {
  return JSON.stringify(palette ?? DEFAULT_BASE16_PALETTE, null, 2);
}

export function getSystemTheme(): ResolvedThemePolarity {
  if (window.matchMedia(COLOR_SCHEME_QUERY).matches) return "dark";
  return "light";
}

export function disableTransitionsTemporarily() {
  const style = document.createElement("style");
  style.appendChild(
    document.createTextNode(
      "*,*::before,*::after{-webkit-transition:none!important;transition:none!important}",
    ),
  );
  document.head.appendChild(style);

  return () => {
    window.getComputedStyle(document.body);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        style.remove();
      });
    });
  };
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function smoothToward(value: number, target: number, smoothness: number) {
  return value + (target - value) * smoothness;
}

function hexToHsl(hex: string): HslColor {
  const value = isHexColor(hex) ? hex : COLOR_PICKER_FALLBACK;
  const red = Number.parseInt(value.slice(1, 3), 16) / 255;
  const green = Number.parseInt(value.slice(3, 5), 16) / 255;
  const blue = Number.parseInt(value.slice(5, 7), 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  const delta = max - min;

  if (delta === 0) return { h: 0, s: 0, l: Math.round(lightness * 100) };

  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue = 0;

  if (max === red) hue = ((green - blue) / delta) % 6;
  else if (max === green) hue = (blue - red) / delta + 2;
  else hue = (red - green) / delta + 4;

  return {
    h: Math.round((hue * 60 + 360) % 360),
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100),
  };
}

function hsl({ h, s, l }: HslColor, alpha?: number) {
  const base = `hsl(${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;
  return alpha === undefined ? `${base})` : `${base} / ${alpha})`;
}

function withHsl(color: HslColor, next: Partial<HslColor>) {
  return {
    h: next.h ?? color.h,
    s: clamp(next.s ?? color.s, 0, 100),
    l: clamp(next.l ?? color.l, 0, 100),
  };
}

function getForegroundFor(lightness: number) {
  return lightness > 58 ? "hsl(222 47% 11%)" : "hsl(0 0% 100%)";
}

export function getThemeVariables(
  color: string,
  polarity: ResolvedThemePolarity,
  tint: ThemeTint,
) {
  const source = hexToHsl(color);
  const tintConfig = config.theme[tint];
  const colorIntensity = tintConfig.colorIntensity;
  const borderIntensity = tintConfig.borderIntensity;
  const backgroundSmoothness = tintConfig.backgroundSmoothness;
  const darkBackgroundLightness = tint === "soft" ? 12 : 8;
  const lightBackgroundLightness =
    tint === "soft" ? 99 : tint === "hard" ? 98 : 97;
  const smoothDark = (lightness: number) =>
    smoothToward(lightness, darkBackgroundLightness, backgroundSmoothness);
  const smoothLight = (lightness: number) =>
    smoothToward(lightness, lightBackgroundLightness, backgroundSmoothness);
  const borderAlpha = (alpha: number) => clamp(alpha * borderIntensity, 0, 1);
  const smoothLightBorder = (lightness: number) =>
    smoothToward(
      smoothLight(lightness),
      lightBackgroundLightness,
      clamp(1 - borderIntensity, 0, 1),
    );
  const primary = withHsl(source, {
    s: clamp(source.s * clamp(colorIntensity * 1.08, 0.66, 1.18), 24, 96),
    l:
      polarity === "dark"
        ? clamp(
            source.l + (tint === "extreme" ? -1 : tint === "hard" ? 2 : 9),
            34,
            68,
          )
        : clamp(
            source.l - (tint === "extreme" ? 8 : tint === "hard" ? 5 : -4),
            25,
            62,
          ),
  });
  const quietSaturation = clamp(source.s * colorIntensity, 6, 72);

  if (polarity === "dark") {
    return {
      "--background": hsl(
        withHsl(source, {
          s: quietSaturation * 0.13,
          l: darkBackgroundLightness,
        }),
      ),
      "--foreground": "hsl(210 40% 98%)",
      "--card": hsl(
        withHsl(source, {
          s: quietSaturation * 0.18,
          l: smoothDark(tint === "extreme" ? 11 : tint === "hard" ? 13 : 14),
        }),
      ),
      "--card-foreground": "hsl(210 40% 98%)",
      "--popover": hsl(
        withHsl(source, {
          s: quietSaturation * 0.2,
          l: smoothDark(tint === "extreme" ? 9 : tint === "hard" ? 11 : 13),
        }),
      ),
      "--popover-foreground": "hsl(210 40% 98%)",
      "--primary": hsl(primary),
      "--primary-foreground": getForegroundFor(primary.l),
      "--primary-foreground-alt": hsl(
        withHsl(primary, { l: clamp(primary.l + 16, 55, 82) }),
      ),
      "--secondary": hsl(
        withHsl(source, {
          s: quietSaturation * 0.22,
          l: smoothDark(tint === "extreme" ? 18 : tint === "hard" ? 20 : 19),
        }),
      ),
      "--secondary-foreground": "hsl(210 40% 98%)",
      "--muted": hsl(
        withHsl(source, {
          s: quietSaturation * 0.16,
          l: smoothDark(tint === "extreme" ? 16 : tint === "hard" ? 18 : 18),
        }),
      ),
      "--muted-foreground": "hsl(215 20% 68%)",
      "--accent": hsl(
        withHsl(source, {
          s: quietSaturation * 0.4,
          l: smoothDark(tint === "extreme" ? 19 : tint === "hard" ? 22 : 20),
        }),
      ),
      "--accent-foreground": "hsl(210 40% 98%)",
      "--destructive": "hsl(0 72% 51%)",
      "--border": hsl(
        withHsl(source, {
          s: quietSaturation * 0.25,
          l: smoothDark(tint === "extreme" ? 30 : tint === "hard" ? 27 : 21),
        }),
        borderAlpha(tint === "soft" ? 0.5 : 0.65),
      ),
      "--input": hsl(
        withHsl(source, {
          s: quietSaturation * 0.28,
          l: smoothDark(tint === "extreme" ? 32 : tint === "hard" ? 29 : 22),
        }),
        borderAlpha(tint === "soft" ? 0.58 : 0.72),
      ),
      "--ring": hsl(withHsl(primary, { l: clamp(primary.l + 8, 45, 75) })),
      "--chart-1": hsl(
        withHsl(source, { h: source.h, s: quietSaturation + 16, l: 70 }),
      ),
      "--chart-2": hsl(
        withHsl(source, { h: source.h + 32, s: quietSaturation + 12, l: 63 }),
      ),
      "--chart-3": hsl(
        withHsl(source, { h: source.h + 64, s: quietSaturation + 8, l: 57 }),
      ),
      "--chart-4": hsl(
        withHsl(source, { h: source.h + 96, s: quietSaturation + 4, l: 52 }),
      ),
      "--chart-5": hsl(
        withHsl(source, { h: source.h + 128, s: quietSaturation, l: 47 }),
      ),
      "--sidebar": hsl(
        withHsl(source, {
          s: quietSaturation * 0.16,
          l: tint === "extreme" ? 8 : tint === "hard" ? 10 : 12,
        }),
      ),
      "--sidebar-foreground": "hsl(210 40% 98%)",
      "--sidebar-primary": hsl(primary),
      "--sidebar-primary-foreground": getForegroundFor(primary.l),
      "--sidebar-accent": hsl(
        withHsl(source, {
          s: quietSaturation * 0.36,
          l: smoothDark(tint === "extreme" ? 17 : tint === "hard" ? 20 : 18),
        }),
      ),
      "--sidebar-accent-foreground": "hsl(210 40% 98%)",
      "--sidebar-border": hsl(
        withHsl(source, {
          s: quietSaturation * 0.22,
          l: smoothDark(tint === "soft" ? 20 : 25),
        }),
        borderAlpha(tint === "soft" ? 0.55 : 0.7),
      ),
      "--sidebar-ring": hsl(primary),
    };
  }

  return {
    "--background": hsl(
      withHsl(source, {
        s: quietSaturation * 0.12,
        l: lightBackgroundLightness,
      }),
    ),
    "--foreground": "hsl(222 47% 11%)",
    "--card":
      tint === "soft"
        ? hsl(
            withHsl(source, { s: quietSaturation * 0.08, l: smoothLight(99) }),
          )
        : "hsl(0 0% 100%)",
    "--card-foreground": "hsl(222 47% 11%)",
    "--popover":
      tint === "soft"
        ? hsl(
            withHsl(source, { s: quietSaturation * 0.08, l: smoothLight(99) }),
          )
        : "hsl(0 0% 100%)",
    "--popover-foreground": "hsl(222 47% 11%)",
    "--primary": hsl(primary),
    "--primary-foreground": getForegroundFor(primary.l),
    "--primary-foreground-alt": hsl(
      withHsl(primary, { l: clamp(primary.l - 8, 24, 48) }),
    ),
    "--secondary": hsl(
      withHsl(source, {
        s: quietSaturation * 0.16,
        l: smoothLight(tint === "extreme" ? 87 : tint === "hard" ? 90 : 96),
      }),
    ),
    "--secondary-foreground": "hsl(222 47% 11%)",
    "--muted": hsl(
      withHsl(source, {
        s: quietSaturation * 0.12,
        l: smoothLight(tint === "extreme" ? 88 : tint === "hard" ? 91 : 97),
      }),
    ),
    "--muted-foreground": "hsl(215 16% 43%)",
    "--accent": hsl(
      withHsl(source, {
        s: quietSaturation * 0.34,
        l: smoothLight(tint === "extreme" ? 84 : tint === "hard" ? 87 : 96),
      }),
    ),
    "--accent-foreground": "hsl(222 47% 11%)",
    "--destructive": "hsl(0 84% 60%)",
    "--border": hsl(
      withHsl(source, {
        s: quietSaturation * 0.15,
        l: smoothLightBorder(
          tint === "extreme" ? 78 : tint === "hard" ? 82 : 92,
        ),
      }),
    ),
    "--input": hsl(
      withHsl(source, {
        s: quietSaturation * 0.16,
        l: smoothLightBorder(
          tint === "extreme" ? 76 : tint === "hard" ? 80 : 91,
        ),
      }),
    ),
    "--ring": hsl(withHsl(primary, { l: clamp(primary.l + 4, 34, 64) })),
    "--chart-1": hsl(
      withHsl(source, { h: source.h, s: quietSaturation + 16, l: 72 }),
    ),
    "--chart-2": hsl(
      withHsl(source, { h: source.h + 32, s: quietSaturation + 12, l: 64 }),
    ),
    "--chart-3": hsl(
      withHsl(source, { h: source.h + 64, s: quietSaturation + 8, l: 56 }),
    ),
    "--chart-4": hsl(
      withHsl(source, { h: source.h + 96, s: quietSaturation + 4, l: 48 }),
    ),
    "--chart-5": hsl(
      withHsl(source, { h: source.h + 128, s: quietSaturation, l: 40 }),
    ),
    "--sidebar": hsl(
      withHsl(source, {
        s: quietSaturation * 0.12,
        l: tint === "extreme" ? 93 : tint === "hard" ? 95 : 98,
      }),
    ),
    "--sidebar-foreground": "hsl(222 47% 11%)",
    "--sidebar-primary": hsl(primary),
    "--sidebar-primary-foreground": getForegroundFor(primary.l),
    "--sidebar-accent": hsl(
      withHsl(source, {
        s: quietSaturation * 0.28,
        l: smoothLight(tint === "extreme" ? 85 : tint === "hard" ? 88 : 96),
      }),
    ),
    "--sidebar-accent-foreground": "hsl(222 47% 11%)",
    "--sidebar-border": hsl(
      withHsl(source, {
        s: quietSaturation * 0.14,
        l: smoothLightBorder(
          tint === "extreme" ? 79 : tint === "hard" ? 83 : 92,
        ),
      }),
    ),
    "--sidebar-ring": hsl(primary),
  };
}

export function getBase16ThemeVariables(palette: Base16Palette) {
  return {
    "--background": palette.base00,
    "--foreground": palette.base05,
    "--card": palette.base01,
    "--card-foreground": palette.base05,
    "--popover": palette.base01,
    "--popover-foreground": palette.base05,
    "--primary": palette.base0D,
    "--primary-foreground": palette.base00,
    "--primary-foreground-alt": palette.base0C,
    "--secondary": palette.base01,
    "--secondary-foreground": palette.base05,
    "--muted": palette.base01,
    "--muted-foreground": palette.base04,
    "--accent": palette.base0B,
    "--accent-foreground": palette.base05,
    "--destructive": palette.base08,
    "--border": palette.base02,
    "--input": palette.base02,
    "--ring": palette.base03,
    "--chart-1": palette.base0B,
    "--chart-2": palette.base0C,
    "--chart-3": palette.base0D,
    "--chart-4": palette.base0E,
    "--chart-5": palette.base0A,
    "--sidebar": palette.base00,
    "--sidebar-foreground": palette.base05,
    "--sidebar-primary": palette.base0D,
    "--sidebar-primary-foreground": palette.base00,
    "--sidebar-accent": palette.base01,
    "--sidebar-accent-foreground": palette.base05,
    "--sidebar-border": palette.base02,
    "--sidebar-ring": palette.base03,
  };
}

export function getPrimaryThemeVariables(color: string) {
  const primary = hexToHsl(color);

  return {
    "--primary": color,
    "--primary-foreground": getForegroundFor(primary.l),
    "--primary-foreground-alt": hsl(
      withHsl(primary, {
        l:
          primary.l > 58
            ? clamp(primary.l - 18, 18, 62)
            : clamp(primary.l + 18, 42, 86),
      }),
    ),
    "--ring": color,
    "--sidebar-primary": color,
    "--sidebar-primary-foreground": getForegroundFor(primary.l),
  };
}

export function readStoredValue<T extends string>(
  key: string | null | undefined,
  validate: (value: string | null) => value is T,
  fallback: T,
) {
  if (!key) return fallback;

  const value = localStorage.getItem(key);
  return validate(value) ? value : fallback;
}

export function saveStoredValue(key: string | null | undefined, value: string) {
  if (!key) return;
  localStorage.setItem(key, value);
}
