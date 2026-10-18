import type * as React from "react";

export type ThemePolarity = "dark" | "light" | "system";
export type ResolvedThemePolarity = "dark" | "light";

export type ThemeFontFamily =
  | "public-sans"
  | "inter"
  | "roboto"
  | "open-sans"
  | "noto-sans"
  | "source-serif-4"
  | "atkinson-hyperlegible-next"
  | "opendyslexic"
  | "system";

export type ThemeMonoFontFamily =
  | "jetbrains-mono"
  | "fira-code"
  | "source-code-pro"
  | "roboto-mono"
  | "geist-mono"
  | "noto-sans-mono"
  | "system";

export type ThemeDesign = {
  fontScale: number;
  fontFamily: ThemeFontFamily;
  monoFontFamily: ThemeMonoFontFamily;
};

/**
 * Which polarity a rule or token set applies to. "both" qualifies the root
 * without a polarity class, "light" only applies without `.dark` and "dark"
 * only applies with `.dark` on the root element.
 */
export type ThemeModeScope = "both" | "light" | "dark";

/**
 * A single style rule scoped to the active theme. The selector is relative to
 * the theme root: `:root[data-theme="<id>"] <selector>`, or the qualifier
 * itself when the selector contains `&`. `mode` decides whether the rule is
 * additionally qualified with `.dark` / `:not(.dark)`.
 */
export type ThemeRule = {
  id: string;
  label: string;
  group: string;
  mode: ThemeModeScope;
  selector: string;
  declarations: string;
  layer?: string;
};

/**
 * CSS custom properties for one polarity. Keys include the leading `--`.
 * Unset properties fall back to the base styles shipped with the package.
 */
export type ThemeTokens = Record<string, string>;

/**
 * The full editable appearance of a theme. Both built-in presets and
 * application-owned custom themes share this shape, so duplicating a preset
 * is a plain deep copy.
 */
export type ThemeStyle = {
  tokens: { light: ThemeTokens; dark: ThemeTokens };
  design: ThemeDesign;
  rules: ThemeRule[];
  customCss: string;
};

export type Theme = ThemeStyle & {
  id: string;
  title: string;
  /** Icon URL. Built-ins ship asset URLs, custom themes store data URLs. */
  logo: string;
};

export type ThemeProviderProps = {
  children: React.ReactNode;
  /** Initial viewing preference for polarity. Defaults to "system". */
  defaultTheme?: ThemePolarity;
  /** Application-owned custom themes. The package never persists them. */
  customThemes?: readonly Theme[];
  /** Application-owned selection. Falls back to the configured default. */
  selectedThemeId?: string | null;
  onCustomThemesChange?: (themes: Theme[]) => void;
  onSelectedThemeIdChange?: (id: string) => void;
  /** Storage key for the polarity viewing preference. `null` disables it. */
  storageKey?: string | null;
  disableTransitionOnChange?: boolean;
};

export type ThemeProviderState = {
  /** Every theme available for selection: built-ins plus custom themes. */
  themes: readonly Theme[];
  builtinThemes: readonly Theme[];
  customThemes: readonly Theme[];
  isBuiltinTheme: (id: string | null | undefined) => boolean;
  /** Effective fallback id: the Vite-configured preset or "nonanium". */
  defaultThemeId: string;
  selectedThemeId: string;
  selectedTheme: Theme;

  selectTheme: (id: string) => void;
  /** Deep-copies any theme into a new custom theme and selects it. */
  duplicateTheme: (id: string, title?: string) => Theme | null;
  /** Deletes a custom theme. Built-ins cannot be deleted. */
  deleteTheme: (id: string) => void;
  updateCustomTheme: (
    id: string,
    update: Theme | ((current: Theme) => Theme),
  ) => void;
  /** Updates the selected theme. No-op while a preset is selected. */
  updateSelectedStyle: (
    update: Partial<Theme> | ((theme: Theme) => Partial<Theme>),
  ) => void;

  theme: ThemePolarity;
  setTheme: (theme: ThemePolarity) => void;
  themePolarity: ThemePolarity;
  setThemePolarity: (polarity: ThemePolarity) => void;
  /** The polarity currently used for rendering and for token editing. */
  resolvedPolarity: ResolvedThemePolarity;
};

export type HslColor = {
  h: number;
  s: number;
  l: number;
};
