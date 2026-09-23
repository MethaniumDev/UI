import { useEffect, useState, type ReactNode } from "react";
import { ThemeProvider, type Theme } from "@methanium/ui";

const THEMES_KEY = "showcase_custom_themes";
const SELECTED_KEY = "showcase_selected_theme";

function isStoredTheme(value: unknown): value is Theme {
  if (!value || typeof value !== "object") return false;
  const theme = value as Partial<Theme>;
  return (
    typeof theme.id === "string" &&
    typeof theme.title === "string" &&
    typeof theme.logo === "string" &&
    typeof theme.tokens === "object" &&
    theme.tokens !== null &&
    typeof theme.tokens.light === "object" &&
    typeof theme.tokens.dark === "object" &&
    typeof theme.design === "object" &&
    theme.design !== null &&
    Array.isArray(theme.rules) &&
    typeof theme.customCss === "string"
  );
}

function loadStoredThemes(): Theme[] {
  try {
    const stored = localStorage.getItem(THEMES_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed.filter((theme) => isStoredTheme(theme))
      : [];
  } catch {
    return [];
  }
}

function loadStoredSelectedId(): string | null {
  return localStorage.getItem(SELECTED_KEY);
}

export function ThemeStoreProvider({ children }: { children: ReactNode }) {
  const [customThemes, setCustomThemes] = useState<Theme[]>(loadStoredThemes);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(
    loadStoredSelectedId,
  );

  useEffect(() => {
    localStorage.setItem(THEMES_KEY, JSON.stringify(customThemes));
  }, [customThemes]);

  useEffect(() => {
    if (selectedThemeId === null) localStorage.removeItem(SELECTED_KEY);
    else localStorage.setItem(SELECTED_KEY, selectedThemeId);
  }, [selectedThemeId]);

  return (
    <ThemeProvider
      customThemes={customThemes}
      selectedThemeId={selectedThemeId}
      onCustomThemesChange={setCustomThemes}
      onSelectedThemeIdChange={setSelectedThemeId}
    >
      {children}
    </ThemeProvider>
  );
}
