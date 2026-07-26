import { useState } from "react";
import { Blocks, Home, Palette, Settings } from "lucide-react";
import {
  Button,
  LoadingScreen,
  OnboardingFlow,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  ThemeCustomizer,
  ThemeOnboardingPage,
  type OnboardingStep,
} from "@methanium/ui";

const navigation = [
  { label: "Banana", icon: Home, variant: "default" },
  { label: "Orange", icon: Blocks, variant: "subtleDefault" },
  { label: "Apple", icon: Palette, variant: "outline" },
  { label: "Kiwi", icon: Settings, variant: "secondary" },
] as const;

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
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

  if (showLoading)
    return (
      <div className="relative">
        <LoadingScreen
          noProgress
          title="Loading screen"
          description="Blalblblalbalbl"
        />
        <Button
          className="fixed top-4 left-4 z-50"
          variant="outline"
          onClick={() => setShowLoading(false)}
        >
          Hide loading screen
        </Button>
      </div>
    );

  return (
    <SidebarProvider>
      <Sidebar collapsible="none" className="h-auto! min-h-svh self-stretch">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="gap-5">
                {navigation.map(({ label, icon: Icon, variant }) => (
                  <SidebarMenuItem key={label}>
                    <Button variant={variant} className="w-full justify-start">
                      <Icon />
                      <span>{label}</span>
                    </Button>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-7 p-5 md:p-10">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="subtleDefault"
              onClick={() => setShowOnboarding(true)}
            >
              Open onboarding
            </Button>
            <Button variant="outline" onClick={() => setShowLoading(true)}>
              Toggle loading screen
            </Button>
          </div>
          <ThemeCustomizer />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
