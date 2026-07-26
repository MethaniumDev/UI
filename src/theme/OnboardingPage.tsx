import { useState } from "react";

import { useOnboardingStep } from "../cmp/onboarding-flow";
import { ThemeCustomizer } from "./pickers/StylePicker";

export function ThemeOnboardingPage({
  value,
  onValueChange,
}: {
  value?: string | null;
  onValueChange?: (id: string) => void;
}) {
  const [localThemeId, setLocalThemeId] = useState<string | null>(null);
  const chosenThemeId = value === undefined ? localThemeId : value;
  useOnboardingStep({ canContinue: chosenThemeId !== null });

  const choose = (id: string) => {
    setLocalThemeId(id);
    onValueChange?.(id);
  };

  return <ThemeCustomizer value={chosenThemeId} onValueChange={choose} />;
}
