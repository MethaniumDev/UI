import {
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback,
  useMemo,
} from "react";

import type {
  Base16Palette,
  ResolvedThemePolarity,
  ThemeProviderProps,
  ThemeProviderState,
  ThemeTint,
} from "./types";
import {
  COLOR_SCHEME_QUERY,
  DEFAULT_BORDER_RADIUS,
  DEFAULT_THEME_COLOR,
  THEME_VARIABLE_NAMES,
  disableTransitionsTemporarily,
  getBase16ThemeVariables,
  getPrimaryThemeVariables,
  getSystemTheme,
  getThemeVariables,
  isTheme,
  isThemeColor,
  isTint,
  parseBorderRadius,
  parseStoredBase16Palette,
  readStoredValue,
  saveStoredValue,
  serializeBase16Palette,
} from "./utils";

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined,
);
const CUSTOM_CSS_STYLE_ID = "tensamin-theme-custom-css";

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultColor = DEFAULT_THEME_COLOR,
  defaultPalette = null,
  defaultPrimaryColor = "",
  defaultTint = "soft",
  defaultBorderRadius = DEFAULT_BORDER_RADIUS,
  defaultCustomCss = "",
  storageKey = "theme",
  colorStorageKey = "theme_color",
  paletteStorageKey = "theme_palette",
  primaryColorStorageKey = "theme_primary_color",
  tintStorageKey = "theme_tint",
  borderRadiusStorageKey = "theme_border_radius",
  customCssStorageKey = "theme_custom_css",
  disableTransitionOnChange = true,
  ...props
}: ThemeProviderProps) {
  const [themePolarity, setThemePolarityState] = useState(() =>
    readStoredValue(storageKey, isTheme, defaultTheme),
  );
  const [themeColor, setThemeColorState] = useState<string>(() =>
    readStoredValue(colorStorageKey, isThemeColor, defaultColor),
  );
  const [themePalette, setThemePaletteState] = useState<Base16Palette | null>(
    () => {
      if (!paletteStorageKey) return defaultPalette;
      return parseStoredBase16Palette(localStorage.getItem(paletteStorageKey));
    },
  );
  const [themePrimaryColor, setThemePrimaryColorState] = useState(() =>
    readStoredValue(primaryColorStorageKey, isThemeColor, defaultPrimaryColor),
  );
  const [themeTint, setThemeTintState] = useState<ThemeTint>(() =>
    readStoredValue(tintStorageKey, isTint, defaultTint),
  );
  const [themeBorderRadius, setThemeBorderRadiusState] = useState(
    () =>
      parseBorderRadius(
        borderRadiusStorageKey
          ? localStorage.getItem(borderRadiusStorageKey)
          : null,
      ) ?? defaultBorderRadius,
  );
  const [themeCustomCss, setThemeCustomCssState] = useState(() =>
    customCssStorageKey
      ? (localStorage.getItem(customCssStorageKey) ?? defaultCustomCss)
      : defaultCustomCss,
  );
  const [systemPolarity, setSystemPolarity] = useState<ResolvedThemePolarity>(
    () => getSystemTheme(),
  );

  const resolvedPolarity =
    themePolarity === "system" ? systemPolarity : themePolarity;

  const setThemePolarity = useCallback(
    (nextPolarity: typeof themePolarity) => {
      saveStoredValue(storageKey, nextPolarity);
      setThemePolarityState(nextPolarity);
    },
    [storageKey],
  );

  const setThemeColor = useCallback(
    (nextColor: string) => {
      if (!isThemeColor(nextColor)) return;

      saveStoredValue(colorStorageKey, nextColor);
      setThemeColorState(nextColor);
    },
    [colorStorageKey],
  );

  const setThemePalette = useCallback(
    (nextPalette: Base16Palette | null) => {
      saveStoredValue(paletteStorageKey, serializeBase16Palette(nextPalette));
      setThemePaletteState(nextPalette);
    },
    [paletteStorageKey],
  );

  const setThemePrimaryColor = useCallback(
    (nextColor: string) => {
      if (!isThemeColor(nextColor)) return;

      saveStoredValue(primaryColorStorageKey, nextColor);
      setThemePrimaryColorState(nextColor);
    },
    [primaryColorStorageKey],
  );

  const setThemeTint = useCallback(
    (nextTint: ThemeTint) => {
      saveStoredValue(tintStorageKey, nextTint);
      setThemeTintState(nextTint);
    },
    [tintStorageKey],
  );

  const setThemeBorderRadius = useCallback(
    (nextRadius: number) => {
      const radius = parseBorderRadius(String(nextRadius));
      if (radius === null) return;

      saveStoredValue(borderRadiusStorageKey, String(radius));
      setThemeBorderRadiusState(radius);
    },
    [borderRadiusStorageKey],
  );

  const setThemeCustomCss = useCallback(
    (nextCss: string) => {
      saveStoredValue(customCssStorageKey, nextCss);
      setThemeCustomCssState(nextCss);
    },
    [customCssStorageKey],
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(COLOR_SCHEME_QUERY);
    const handleChange = () => {
      setSystemPolarity(getSystemTheme());
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const restoreTransitions = disableTransitionOnChange
      ? disableTransitionsTemporarily()
      : null;

    root.classList.remove("light", "dark");
    root.classList.add(resolvedPolarity);

    for (const name of THEME_VARIABLE_NAMES) {
      root.style.removeProperty(name);
    }

    const variables = themePalette
      ? getBase16ThemeVariables(themePalette)
      : themeColor === ""
        ? null
        : getThemeVariables(themeColor, resolvedPolarity, themeTint);

    if (variables) {
      for (const [name, value] of Object.entries(variables)) {
        root.style.setProperty(name, value);
      }
    }

    if (themePrimaryColor !== "") {
      for (const [name, value] of Object.entries(
        getPrimaryThemeVariables(themePrimaryColor),
      )) {
        root.style.setProperty(name, value);
      }
    }

    if (restoreTransitions) restoreTransitions();
  }, [
    disableTransitionOnChange,
    resolvedPolarity,
    themeColor,
    themePalette,
    themePrimaryColor,
    themeTint,
  ]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--radius",
      `${themeBorderRadius}rem`,
    );
  }, [themeBorderRadius]);

  useEffect(() => {
    const existingStyle = document.getElementById(CUSTOM_CSS_STYLE_ID);

    if (themeCustomCss.trim() === "") {
      existingStyle?.remove();
      return;
    }

    const style = existingStyle ?? document.createElement("style");
    style.id = CUSTOM_CSS_STYLE_ID;
    style.textContent = themeCustomCss;

    if (!existingStyle) document.head.appendChild(style);
  }, [themeCustomCss]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) return;

      if (event.key === storageKey) {
        setThemePolarityState(
          isTheme(event.newValue) ? event.newValue : defaultTheme,
        );
      }

      if (event.key === colorStorageKey) {
        setThemeColorState(
          isThemeColor(event.newValue) ? event.newValue : defaultColor,
        );
      }

      if (event.key === tintStorageKey) {
        setThemeTintState(
          isTint(event.newValue) ? event.newValue : defaultTint,
        );
      }

      if (event.key === borderRadiusStorageKey) {
        setThemeBorderRadiusState(
          parseBorderRadius(event.newValue) ?? defaultBorderRadius,
        );
      }

      if (event.key === customCssStorageKey) {
        setThemeCustomCssState(event.newValue ?? defaultCustomCss);
      }

      if (event.key === paletteStorageKey) {
        setThemePaletteState(parseStoredBase16Palette(event.newValue));
      }

      if (event.key === primaryColorStorageKey) {
        setThemePrimaryColorState(
          isThemeColor(event.newValue) ? event.newValue : defaultPrimaryColor,
        );
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [
    borderRadiusStorageKey,
    colorStorageKey,
    customCssStorageKey,
    defaultBorderRadius,
    defaultColor,
    defaultCustomCss,
    defaultPrimaryColor,
    defaultTheme,
    defaultTint,
    paletteStorageKey,
    primaryColorStorageKey,
    storageKey,
    tintStorageKey,
  ]);

  const value = useMemo(
    () => ({
      theme: themePolarity,
      setTheme: setThemePolarity,
      themeColor,
      setThemeColor,
      themePalette,
      setThemePalette,
      themePrimaryColor,
      setThemePrimaryColor,
      themePolarity,
      setThemePolarity,
      resolvedPolarity,
      themeTint,
      setThemeTint,
      themeBorderRadius,
      setThemeBorderRadius,
      themeCustomCss,
      setThemeCustomCss,
    }),
    [
      resolvedPolarity,
      setThemeBorderRadius,
      setThemeColor,
      setThemeCustomCss,
      setThemePalette,
      setThemePolarity,
      setThemePrimaryColor,
      setThemeTint,
      themeColor,
      themeBorderRadius,
      themeCustomCss,
      themePalette,
      themePolarity,
      themePrimaryColor,
      themeTint,
    ],
  );

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
