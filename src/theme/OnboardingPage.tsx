import { useState } from "react";

import { useOnboardingStep } from "../cmp/onboarding-flow";
import { configuredDefaultThemeId, useTheme } from "./Provider";
import { findTheme } from "./presets";
import { ThemeCustomizer } from "./pickers/StylePicker";

export function ThemeOnboardingPage({
  value,
  onValueChange,
}: {
  value?: string | null;
  onValueChange?: (id: string) => void;
}) {
  const { themes } = useTheme();
  const [localThemeId, setLocalThemeId] = useState<string | null>(
    () => findTheme(themes, configuredDefaultThemeId())?.id ?? null,
  );
  const chosenThemeId = value ?? localThemeId;
  useOnboardingStep({ canContinue: chosenThemeId !== null });

  const choose = (id: string) => {
    setLocalThemeId(id);
    onValueChange?.(id);
  };

  return <ThemeCustomizer value={chosenThemeId} onValueChange={choose} />;
}
