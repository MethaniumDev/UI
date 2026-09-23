import type { HslColor, ResolvedThemePolarity, ThemePolarity } from "./types";

export const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";
export const THEME_VALUES: ThemePolarity[] = ["dark", "light", "system"];
export const COLOR_PICKER_FALLBACK = "#2f9b9b";

export function isTheme(value: string | null): value is ThemePolarity {
  if (value === null) return false;
  return THEME_VALUES.includes(value as ThemePolarity);
}

export function isHexColor(value: string | null): value is string {
  return value !== null && /^#[0-9a-f]{6}$/i.test(value);
}

export function getSystemTheme(): ResolvedThemePolarity {
  if (typeof window === "undefined") return "light";
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

export function hexToHsl(hex: string): HslColor {
  // Tolerate #rrggbbaa by ignoring the alpha channel.
  const withoutAlpha = /^#[0-9a-f]{8}$/i.test(hex) ? hex.slice(0, 7) : hex;
  const value = isHexColor(withoutAlpha) ? withoutAlpha : COLOR_PICKER_FALLBACK;
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

export function hslToHex({ h, s, l }: HslColor) {
  const saturation = Math.min(Math.max(s, 0), 100) / 100;
  const lightness = Math.min(Math.max(l, 0), 100) / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const section = (((h % 360) + 360) % 360) / 60;
  const x = chroma * (1 - Math.abs((section % 2) - 1));
  const [red, green, blue] =
    section < 1
      ? [chroma, x, 0]
      : section < 2
        ? [x, chroma, 0]
        : section < 3
          ? [0, chroma, x]
          : section < 4
            ? [0, x, chroma]
            : section < 5
              ? [x, 0, chroma]
              : [chroma, 0, x];
  const match = lightness - chroma / 2;
  return `#${[red, green, blue]
    .map((channel) =>
      Math.round((channel + match) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

export function readStoredValue<T extends string>(
  key: string | null | undefined,
  validate: (value: string | null) => value is T,
  fallback: T,
) {
  if (!key || typeof window === "undefined") return fallback;

  const value = localStorage.getItem(key);
  return validate(value) ? value : fallback;
}

export function saveStoredValue(key: string | null | undefined, value: string) {
  if (!key || typeof window === "undefined") return;
  localStorage.setItem(key, value);
}
