import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

import { THEME_STYLE_ELEMENT_ID, renderThemeCss } from "./css";
import {
  BUILT_IN_THEMES,
  FALLBACK_THEME_ID,
  findTheme,
  isBuiltinThemeId,
} from "./presets";
import type {
  ResolvedThemePolarity,
  Theme,
  ThemePolarity,
  ThemeProviderProps,
  ThemeProviderState,
} from "./types";
import {
  COLOR_SCHEME_QUERY,
  disableTransitionsTemporarily,
  getSystemTheme,
  isTheme,
  readStoredValue,
  saveStoredValue,
} from "./utils";

declare const __NONANIUM_UI_DEFAULT_THEME_ID__: string | undefined;

const CUSTOM_CSS_STYLE_ID = "nonanium-theme-custom-css";

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined,
);

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Id of the fallback theme: the Vite-configured preset when valid, otherwise
 * the built-in nonanium preset.
 */
export function configuredDefaultThemeId(): string {
  const configured =
    typeof __NONANIUM_UI_DEFAULT_THEME_ID__ === "string"
      ? __NONANIUM_UI_DEFAULT_THEME_ID__
      : null;
  return isBuiltinThemeId(configured) ? configured : FALLBACK_THEME_ID;
}

function createThemeId() {
  return `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  customThemes = [],
  selectedThemeId = null,
  onCustomThemesChange,
  onSelectedThemeIdChange,
  storageKey = "theme",
  disableTransitionOnChange = true,
}: ThemeProviderProps) {
  const [themePolarity, setThemePolarityState] = useState(() =>
    readStoredValue(storageKey, isTheme, defaultTheme),
  );
  const [systemPolarity, setSystemPolarity] = useState<ResolvedThemePolarity>(
    () => getSystemTheme(),
  );

  const themes = useMemo<readonly Theme[]>(
    () => [...BUILT_IN_THEMES, ...customThemes],
    [customThemes],
  );
  const defaultThemeId = useMemo(configuredDefaultThemeId, []);

  const selectedTheme =
    findTheme(themes, selectedThemeId) ??
    findTheme(themes, defaultThemeId) ??
    BUILT_IN_THEMES[0];
  const activeThemeId = selectedTheme.id;
  const resolvedPolarity =
    themePolarity === "system" ? systemPolarity : themePolarity;

  const setThemePolarity = useCallback(
    (next: ThemePolarity) => {
      saveStoredValue(storageKey, next);
      setThemePolarityState(next);
    },
    [storageKey],
  );

  const updateCustomThemes = useCallback(
    (next: readonly Theme[]) => {
      onCustomThemesChange?.([...next]);
    },
    [onCustomThemesChange],
  );

  const selectTheme = useCallback(
    (id: string) => {
      if (!findTheme(themes, id)) return;
      onSelectedThemeIdChange?.(id);
    },
    [onSelectedThemeIdChange, themes],
  );

  const updateCustomTheme = useCallback(
    (id: string, update: Theme | ((current: Theme) => Theme)) => {
      if (isBuiltinThemeId(id)) return;
      let changed = false;
      const next = customThemes.map((theme) => {
        if (theme.id !== id) return theme;
        changed = true;
        return typeof update === "function" ? update(theme) : update;
      });
      if (changed) updateCustomThemes(next);
    },
    [customThemes, updateCustomThemes],
  );

  const updateSelectedStyle = useCallback(
    (update: Partial<Theme> | ((theme: Theme) => Partial<Theme>)) => {
      const id = selectedTheme.id;
      if (isBuiltinThemeId(id)) return;
      updateCustomTheme(id, (current) => ({
        ...current,
        ...(typeof update === "function" ? update(current) : update),
      }));
    },
    [selectedTheme.id, updateCustomTheme],
  );

  const duplicateTheme = useCallback(
    (id: string, title?: string) => {
      const source = findTheme(themes, id);
      if (!source) return null;
      const clone: Theme = {
        ...structuredClone(source),
        id: createThemeId(),
        title: title ?? `${source.title} Copy`,
      };
      updateCustomThemes([...customThemes, clone]);
      onSelectedThemeIdChange?.(clone.id);
      return clone;
    },
    [customThemes, onSelectedThemeIdChange, themes, updateCustomThemes],
  );

  const deleteTheme = useCallback(
    (id: string) => {
      if (isBuiltinThemeId(id)) return;
      if (!customThemes.some((theme) => theme.id === id)) return;
      updateCustomThemes(customThemes.filter((theme) => theme.id !== id));
      if (selectedThemeId === id) onSelectedThemeIdChange?.(defaultThemeId);
    },
    [
      customThemes,
      defaultThemeId,
      onSelectedThemeIdChange,
      selectedThemeId,
      updateCustomThemes,
    ],
  );

  const isBuiltinTheme = useCallback(
    (id: string | null | undefined) => isBuiltinThemeId(id),
    [],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia(COLOR_SCHEME_QUERY);
    const handleChange = () => setSystemPolarity(getSystemTheme());
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const restoreTransitions = disableTransitionOnChange
      ? disableTransitionsTemporarily()
      : null;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedPolarity);
    root.dataset.theme = activeThemeId;
    root.style.setProperty(
      "--ui-font-scale",
      String(selectedTheme.design.fontScale),
    );
    root.dataset.font = selectedTheme.design.fontFamily;
    root.dataset.monoFont = selectedTheme.design.monoFontFamily;
    restoreTransitions?.();
  }, [
    disableTransitionOnChange,
    resolvedPolarity,
    selectedTheme,
    activeThemeId,
  ]);

  useIsomorphicLayoutEffect(() => {
    if (typeof document === "undefined") return;
    const css = renderThemeCss(selectedTheme);
    const existing = document.getElementById(THEME_STYLE_ELEMENT_ID);
    if (existing) {
      existing.textContent = css;
      return;
    }
    const style = document.createElement("style");
    style.id = THEME_STYLE_ELEMENT_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }, [selectedTheme]);

  useIsomorphicLayoutEffect(() => {
    if (typeof document === "undefined") return;
    const existing = document.getElementById(CUSTOM_CSS_STYLE_ID);
    if (!selectedTheme.customCss.trim()) {
      existing?.remove();
      return;
    }
    const style = existing ?? document.createElement("style");
    style.id = CUSTOM_CSS_STYLE_ID;
    style.textContent = selectedTheme.customCss;
    if (!existing) document.head.appendChild(style);
  }, [selectedTheme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleStorageChange = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) return;
      if (event.key !== storageKey) return;
      setThemePolarityState(
        isTheme(event.newValue) ? event.newValue : defaultTheme,
      );
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [defaultTheme, storageKey]);

  const value = useMemo<ThemeProviderState>(
    () => ({
      themes,
      builtinThemes: BUILT_IN_THEMES,
      customThemes,
      isBuiltinTheme,
      defaultThemeId,
      selectedThemeId: activeThemeId,
      selectedTheme,
      selectTheme,
      duplicateTheme,
      deleteTheme,
      updateCustomTheme,
      updateSelectedStyle,
      theme: themePolarity,
      setTheme: setThemePolarity,
      themePolarity,
      setThemePolarity,
      resolvedPolarity,
    }),
    [
      activeThemeId,
      customThemes,
      defaultThemeId,
      deleteTheme,
      duplicateTheme,
      isBuiltinTheme,
      resolvedPolarity,
      selectTheme,
      selectedTheme,
      setThemePolarity,
      themePolarity,
      themes,
      updateCustomTheme,
      updateSelectedStyle,
    ],
  );

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeProviderContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
