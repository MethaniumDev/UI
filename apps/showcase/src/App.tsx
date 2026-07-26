import { useState } from "react";
import {
  Button,
  OnboardingFlow,
  ThemeCustomizer,
  ThemeOnboardingPage,
  type OnboardingStep,
} from "@methanium/ui";

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingThemeId, setOnboardingThemeId] = useState<string | null>(
    null,
  );
  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Usually the legal stuff",
      description: "but this is a showcase, so continue",
      content: <></>,
    },
    {
      id: "theme",
      title: "Customisation",
      description: "Let's just hope you don't get into decision paralysis",
      content: (
        <ThemeOnboardingPage
          value={onboardingThemeId}
          onValueChange={setOnboardingThemeId}
        />
      ),
      defaultCanContinue: false,
    },
  ];

  if (showOnboarding)
    return (
      <div className="h-dvh">
        <OnboardingFlow
          steps={steps}
          onFinish={() => setShowOnboarding(false)}
        />
      </div>
    );

  return (
    <main className="mx-auto flex max-w-[1500px] flex-col gap-7 p-5 md:p-10">
      <div>
        <Button variant="outline" onClick={() => setShowOnboarding(true)}>
          Open onboarding
        </Button>
      </div>
      <ThemeCustomizer />
    </main>
  );
}
