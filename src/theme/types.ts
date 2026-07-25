import type * as React from "react";

export type ThemePolarity = "dark" | "light" | "system";
export type ResolvedThemePolarity = "dark" | "light";
export type ThemeTint = "soft" | "hard" | "extreme";
export type Base16Key =
  | "base00"
  | "base01"
  | "base02"
  | "base03"
  | "base04"
  | "base05"
  | "base06"
  | "base07"
  | "base08"
  | "base09"
  | "base0A"
  | "base0B"
  | "base0C"
  | "base0D"
  | "base0E"
  | "base0F";

export type Base16Palette = Record<Base16Key, string>;

export type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: ThemePolarity;
  defaultColor?: string;
  defaultPalette?: Base16Palette | null;
  defaultPrimaryColor?: string;
  defaultTint?: ThemeTint;
  defaultBorderRadius?: number;
  defaultCustomCss?: string;
  storageKey?: string | null;
  colorStorageKey?: string | null;
  paletteStorageKey?: string | null;
  primaryColorStorageKey?: string | null;
  tintStorageKey?: string | null;
  borderRadiusStorageKey?: string | null;
  customCssStorageKey?: string | null;
  disableTransitionOnChange?: boolean;
};

export type ThemeProviderState = {
  theme: ThemePolarity;
  setTheme: (theme: ThemePolarity) => void;
  themeColor: string;
  setThemeColor: (color: string) => void;
  themePalette: Base16Palette | null;
  setThemePalette: (palette: Base16Palette | null) => void;
  themePrimaryColor: string;
  setThemePrimaryColor: (color: string) => void;
  themePolarity: ThemePolarity;
  setThemePolarity: (polarity: ThemePolarity) => void;
  resolvedPolarity: ResolvedThemePolarity;
  themeTint: ThemeTint;
  setThemeTint: (tint: ThemeTint) => void;
  themeBorderRadius: number;
  setThemeBorderRadius: (radius: number) => void;
  themeCustomCss: string;
  setThemeCustomCss: (css: string) => void;
};

export type HslColor = {
  h: number;
  s: number;
  l: number;
};
