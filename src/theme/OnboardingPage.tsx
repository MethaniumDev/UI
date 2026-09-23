import { useOnboardingStep } from "../cmp/onboarding-flow";
import { ThemeCustomizer } from "./pickers/StylePicker";

export function ThemeOnboardingPage() {
  useOnboardingStep({ canContinue: true });
  return <ThemeCustomizer />;
}
