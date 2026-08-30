import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

import { BUILT_IN_THEMES, DEFAULT_THEME_DESIGN, findTheme } from "./presets";
import type {
  Base16Palette,
  ResolvedThemePolarity,
  ThemeDesign,
  ThemeFontFamily,
  ThemePreset,
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

declare const __METHANIUM_UI_DEFAULT_THEME_ID__: string | undefined;

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined,
);
const CUSTOM_CSS_STYLE_ID = "methanium-theme-custom-css";
const FONT_FAMILIES: ThemeFontFamily[] = [
  "public-sans",
  "inter",
  "source-serif-4",
  "jetbrains-mono",
  "system",
];
const DESIGN_NUMBER_FIELDS = [
  "density",
  "borderWidth",
  "shadowStrength",
  "fontScale",
  "headingWeight",
  "motion",
] as const;
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function configuredDefaultThemeId() {
  return typeof __METHANIUM_UI_DEFAULT_THEME_ID__ === "string"
    ? __METHANIUM_UI_DEFAULT_THEME_ID__
    : null;
}

function storageValue(key: string | null) {
  return key && typeof window !== "undefined"
    ? localStorage.getItem(key)
    : null;
}

function isThemeDesign(value: unknown): value is ThemeDesign {
  if (!value || typeof value !== "object") return false;
  const design = value as Record<string, unknown>;
  return (
    DESIGN_NUMBER_FIELDS.every((field) => typeof design[field] === "number") &&
    FONT_FAMILIES.includes(design.fontFamily as ThemeFontFamily)
  );
}

function parseDesign(value: string | null, fallback: ThemeDesign) {
  if (!value) return fallback;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!isThemeDesign(parsed)) return fallback;
    return {
      density: parsed.density,
      borderWidth: parsed.borderWidth,
      shadowStrength: parsed.shadowStrength,
      fontScale: parsed.fontScale,
      headingWeight: parsed.headingWeight,
      motion: parsed.motion,
      fontFamily: parsed.fontFamily,
    };
  } catch {
    return fallback;
  }
}

function storedDesign(key: string | null, fallback: ThemeDesign) {
  return parseDesign(storageValue(key), fallback);
}

function designsEqual(left: ThemeDesign, right: ThemeDesign) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function presetDesign(theme: ThemePreset | null, fallback: ThemeDesign) {
  return theme?.defaultValues?.design ?? fallback;
}

function presetBorderRadius(theme: ThemePreset | null, fallback: number) {
  return theme?.defaultValues?.borderRadius ?? fallback;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultColor = DEFAULT_THEME_COLOR,
  defaultPalette = null,
  defaultPrimaryColor = "",
  defaultTint = "soft",
  defaultBorderRadius = DEFAULT_BORDER_RADIUS,
  defaultCustomCss = "",
  themes = BUILT_IN_THEMES,
  defaultParentThemeId = configuredDefaultThemeId(),
  defaultDesign = DEFAULT_THEME_DESIGN,
  storageKey = "theme",
  colorStorageKey = "theme_color",
  paletteStorageKey = "theme_palette",
  primaryColorStorageKey = "theme_primary_color",
  tintStorageKey = "theme_tint",
  borderRadiusStorageKey = "theme_border_radius",
  customCssStorageKey = "theme_custom_css",
  parentThemeStorageKey = "theme_parent",
  designStorageKey = "theme_design",
  notCustomizedStorageKey = "theme_not_customized",
  disableTransitionOnChange = true,
  ...props
}: ThemeProviderProps) {
  const configuredParent = findTheme(themes, defaultParentThemeId);
  const [parentThemeId, setParentThemeIdState] = useState<string | null>(() => {
    const stored = storageValue(parentThemeStorageKey);
    return findTheme(themes, stored)?.id ?? configuredParent?.id ?? null;
  });
  const initialParent = findTheme(themes, parentThemeId);
  const initialDesign = presetDesign(initialParent, defaultDesign);
  const initialBorderRadius = presetBorderRadius(
    initialParent,
    defaultBorderRadius,
  );
  const [themePolarity, setThemePolarityState] = useState(() =>
    readStoredValue(storageKey, isTheme, defaultTheme),
  );
  const [themeColor, setThemeColorState] = useState<string>(() =>
    readStoredValue(colorStorageKey, isThemeColor, defaultColor),
  );
  const [themePalette, setThemePaletteState] = useState<Base16Palette | null>(
    () => {
      const stored = storageValue(paletteStorageKey);
      return stored === null
        ? defaultPalette
        : parseStoredBase16Palette(stored);
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
      parseBorderRadius(storageValue(borderRadiusStorageKey)) ??
      initialBorderRadius,
  );
  const [themeCustomCss, setThemeCustomCssState] = useState(() => {
    const storedCss = storageValue(customCssStorageKey);
    const hadStoredParent = storageValue(parentThemeStorageKey) !== null;
    if (storedCss === null || (storedCss === "" && !hadStoredParent)) {
      return initialParent?.css ?? defaultCustomCss;
    }
    return storedCss;
  });
  const [themeDesign, setThemeDesignState] = useState(() =>
    storedDesign(designStorageKey, initialDesign),
  );
  const [notCustomized, setNotCustomizedState] = useState(() => {
    const stored = storageValue(notCustomizedStorageKey);
    if (stored !== null) return stored === "true";
    return Boolean(
      initialParent &&
      themeColor === "" &&
      themePalette === null &&
      themePrimaryColor === "" &&
      themeTint === "soft" &&
      themeBorderRadius === initialBorderRadius &&
      designsEqual(themeDesign, initialDesign) &&
      themeCustomCss === initialParent.css,
    );
  });
  const [systemPolarity, setSystemPolarity] = useState<ResolvedThemePolarity>(
    () => getSystemTheme(),
  );

  const parentTheme = findTheme(themes, parentThemeId);
  const resolvedPolarity =
    themePolarity === "system" ? systemPolarity : themePolarity;

  const setNotCustomized = useCallback(
    (next: boolean) => {
      saveStoredValue(notCustomizedStorageKey, String(next));
      setNotCustomizedState(next);
    },
    [notCustomizedStorageKey],
  );

  const setParentThemeId = useCallback(
    (id: string | null) => {
      const next = findTheme(themes, id)?.id ?? null;
      saveStoredValue(parentThemeStorageKey, next ?? "");
      setParentThemeIdState(next);
      setNotCustomized(false);
    },
    [parentThemeStorageKey, setNotCustomized, themes],
  );

  const setThemePolarity = useCallback(
    (next: typeof themePolarity) => {
      saveStoredValue(storageKey, next);
      setThemePolarityState(next);
    },
    [storageKey],
  );
  const setThemeColor = useCallback(
    (next: string) => {
      if (!isThemeColor(next)) return;
      saveStoredValue(colorStorageKey, next);
      setThemeColorState(next);
      setNotCustomized(false);
    },
    [colorStorageKey, setNotCustomized],
  );
  const setThemePalette = useCallback(
    (next: Base16Palette | null) => {
      saveStoredValue(paletteStorageKey, serializeBase16Palette(next));
      setThemePaletteState(next);
      setNotCustomized(false);
    },
    [paletteStorageKey, setNotCustomized],
  );
  const setThemePrimaryColor = useCallback(
    (next: string) => {
      if (!isThemeColor(next)) return;
      saveStoredValue(primaryColorStorageKey, next);
      setThemePrimaryColorState(next);
      setNotCustomized(false);
    },
    [primaryColorStorageKey, setNotCustomized],
  );
  const setThemeTint = useCallback(
    (next: ThemeTint) => {
      saveStoredValue(tintStorageKey, next);
      setThemeTintState(next);
      setNotCustomized(false);
    },
    [setNotCustomized, tintStorageKey],
  );
  const setThemeBorderRadius = useCallback(
    (next: number) => {
      const radius = parseBorderRadius(String(next));
      if (radius === null) return;
      saveStoredValue(borderRadiusStorageKey, String(radius));
      setThemeBorderRadiusState(radius);
      setNotCustomized(false);
    },
    [borderRadiusStorageKey, setNotCustomized],
  );
  const setThemeCustomCss = useCallback(
    (next: string) => {
      saveStoredValue(customCssStorageKey, next);
      setThemeCustomCssState(next);
      setNotCustomized(false);
    },
    [customCssStorageKey, setNotCustomized],
  );
  const setThemeDesign = useCallback(
    (next: ThemeDesign | ((current: ThemeDesign) => ThemeDesign)) => {
      setNotCustomized(false);
      setThemeDesignState((current) => {
        const value = typeof next === "function" ? next(current) : next;
        saveStoredValue(designStorageKey, JSON.stringify(value));
        return value;
      });
    },
    [designStorageKey, setNotCustomized],
  );

  const applyThemePreset = useCallback(
    (id: string) => {
      const preset = findTheme(themes, id);
      if (!preset) throw new Error(`Unknown theme preset: ${id}`);
      setParentThemeId(preset.id);
      setThemeColor("");
      setThemePalette(null);
      setThemePrimaryColor("");
      setThemeTint("soft");
      setThemeBorderRadius(presetBorderRadius(preset, defaultBorderRadius));
      setThemeDesign(presetDesign(preset, defaultDesign));
      setThemeCustomCss(preset.css);
      setNotCustomized(true);
    },
    [
      defaultDesign,
      defaultBorderRadius,
      setParentThemeId,
      setThemeBorderRadius,
      setThemeColor,
      setThemeCustomCss,
      setThemeDesign,
      setThemePalette,
      setThemePrimaryColor,
      setThemeTint,
      setNotCustomized,
      themes,
    ],
  );
  const resetThemePreset = useCallback(() => {
    if (parentTheme) applyThemePreset(parentTheme.id);
  }, [applyThemePreset, parentTheme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (storageValue(notCustomizedStorageKey) === null) {
      saveStoredValue(notCustomizedStorageKey, String(notCustomized));
    }
  }, [notCustomized, notCustomizedStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia(COLOR_SCHEME_QUERY);
    const handleChange = () => setSystemPolarity(getSystemTheme());
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!notCustomized || !parentTheme || themeCustomCss === parentTheme.css) {
      return;
    }
    saveStoredValue(customCssStorageKey, parentTheme.css);
    setThemeCustomCssState(parentTheme.css);
  }, [customCssStorageKey, notCustomized, parentTheme, themeCustomCss]);

  useIsomorphicLayoutEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const restoreTransitions = disableTransitionOnChange
      ? disableTransitionsTemporarily()
      : null;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedPolarity);
    if (parentThemeId) root.dataset.theme = parentThemeId;
    else delete root.dataset.theme;

    for (const name of THEME_VARIABLE_NAMES) root.style.removeProperty(name);
    const variables = themePalette
      ? getBase16ThemeVariables(themePalette)
      : themeColor
        ? getThemeVariables(themeColor, resolvedPolarity, themeTint)
        : null;
    if (variables) {
      for (const [name, value] of Object.entries(variables)) {
        root.style.setProperty(name, value);
      }
    }
    if (themePrimaryColor) {
      for (const [name, value] of Object.entries(
        getPrimaryThemeVariables(themePrimaryColor),
      )) {
        root.style.setProperty(name, value);
      }
    }
    root.style.setProperty("--radius", `${themeBorderRadius}rem`);
    root.style.setProperty("--ui-density", String(themeDesign.density));
    root.style.setProperty("--ui-border-width", `${themeDesign.borderWidth}px`);
    root.style.setProperty(
      "--ui-shadow-strength",
      String(themeDesign.shadowStrength),
    );
    root.style.setProperty("--ui-font-scale", String(themeDesign.fontScale));
    root.style.setProperty(
      "--ui-heading-weight",
      String(themeDesign.headingWeight),
    );
    root.style.setProperty("--ui-motion", String(themeDesign.motion));
    root.dataset.font = themeDesign.fontFamily;
    restoreTransitions?.();
  }, [
    disableTransitionOnChange,
    parentThemeId,
    resolvedPolarity,
    themeBorderRadius,
    themeColor,
    themeDesign,
    themePalette,
    themePrimaryColor,
    themeTint,
  ]);

  useIsomorphicLayoutEffect(() => {
    if (typeof document === "undefined") return;
    const existing = document.getElementById(CUSTOM_CSS_STYLE_ID);
    if (!themeCustomCss.trim()) {
      existing?.remove();
      return;
    }
    const style = existing ?? document.createElement("style");
    style.id = CUSTOM_CSS_STYLE_ID;
    style.textContent = themeCustomCss;
    if (!existing) document.head.appendChild(style);
  }, [themeCustomCss]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handlers = new Map<string, (value: string | null) => void>();
    const register = (
      key: string | null,
      handler: (value: string | null) => void,
    ) => {
      if (key) handlers.set(key, handler);
    };
    register(storageKey, (stored) =>
      setThemePolarityState(isTheme(stored) ? stored : defaultTheme),
    );
    register(colorStorageKey, (stored) =>
      setThemeColorState(isThemeColor(stored) ? stored : defaultColor),
    );
    register(paletteStorageKey, (stored) =>
      setThemePaletteState(parseStoredBase16Palette(stored)),
    );
    register(primaryColorStorageKey, (stored) =>
      setThemePrimaryColorState(
        isThemeColor(stored) ? stored : defaultPrimaryColor,
      ),
    );
    register(tintStorageKey, (stored) =>
      setThemeTintState(isTint(stored) ? stored : defaultTint),
    );
    register(borderRadiusStorageKey, (stored) =>
      setThemeBorderRadiusState(
        parseBorderRadius(stored) ??
          presetBorderRadius(parentTheme, defaultBorderRadius),
      ),
    );
    register(customCssStorageKey, (stored) =>
      setThemeCustomCssState(stored ?? defaultCustomCss),
    );
    register(parentThemeStorageKey, (stored) =>
      setParentThemeIdState(findTheme(themes, stored)?.id ?? null),
    );
    register(designStorageKey, (stored) =>
      setThemeDesignState(
        parseDesign(stored, presetDesign(parentTheme, defaultDesign)),
      ),
    );
    register(notCustomizedStorageKey, (stored) =>
      setNotCustomizedState(stored === "true"),
    );
    const handleStorageChange = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) return;
      if (event.key) handlers.get(event.key)?.(event.newValue);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [
    borderRadiusStorageKey,
    colorStorageKey,
    customCssStorageKey,
    defaultBorderRadius,
    defaultColor,
    defaultCustomCss,
    defaultDesign,
    defaultPrimaryColor,
    defaultTheme,
    defaultTint,
    designStorageKey,
    notCustomizedStorageKey,
    paletteStorageKey,
    parentThemeStorageKey,
    parentTheme,
    primaryColorStorageKey,
    storageKey,
    themes,
    tintStorageKey,
  ]);

  const isThemeCustomized = Boolean(parentTheme && !notCustomized);

  const value = useMemo<ThemeProviderState>(
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
      themes,
      parentThemeId,
      parentTheme,
      setParentThemeId,
      applyThemePreset,
      resetThemePreset,
      isThemeCustomized,
      notCustomized,
      themeDesign,
      setThemeDesign,
    }),
    [
      applyThemePreset,
      isThemeCustomized,
      notCustomized,
      parentTheme,
      parentThemeId,
      resetThemePreset,
      resolvedPolarity,
      setParentThemeId,
      setThemeBorderRadius,
      setThemeColor,
      setThemeCustomCss,
      setThemeDesign,
      setThemePalette,
      setThemePolarity,
      setThemePrimaryColor,
      setThemeTint,
      themeBorderRadius,
      themeColor,
      themeCustomCss,
      themeDesign,
      themePalette,
      themePolarity,
      themePrimaryColor,
      themeTint,
      themes,
    ],
  );

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeProviderContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
