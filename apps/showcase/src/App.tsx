import { useState } from "react";
import { Blocks, Home, Palette, Settings } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  LoadingScreen,
  OnboardingFlow,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ThemeCustomizer,
  ThemeOnboardingPage,
  type OnboardingStep,
} from "@methanium/ui";

import { MarkdownShowcase } from "./MarkdownShowcase";

const navigation = [
  { label: "Banana", icon: Home, variant: "default" },
  { label: "Orange", icon: Blocks, variant: "subtleDefault" },
  { label: "Apple", icon: Palette, variant: "outline" },
  { label: "Kiwi", icon: Settings, variant: "secondary" },
  { label: "Ghost", icon: Settings, variant: "ghost" },
] as const;

type Category = "conversations" | "communities";

function CategorySwitch() {
  const [category, setCategory] = useState<Category>("conversations");

  function toggleCategory() {
    setCategory((current) =>
      current === "conversations" ? "communities" : "conversations",
    );
  }

  return (
    <div
      role="tablist"
      className="border relative grid grid-cols-2 rounded-4xl bg-card p-1 select-none"
    >
      <div
        className="absolute top-1 bottom-1 rounded-4xl bg-input shadow-sm transition-all duration-300 ease-in-out"
        style={{
          left: category === "conversations" ? "0.25rem" : "50%",
          width: "calc(50% - 0.25rem)",
        }}
      />
      {(["conversations", "communities"] as const).map((value) => (
        <button
          key={value}
          role="tab"
          aria-selected={category === value}
          className={`relative z-10 w-full cursor-pointer rounded-4xl px-2.5 py-1.5 text-center text-sm font-medium capitalize transition-colors duration-300 ${
            category === value
              ? "text-foreground"
              : "text-ring/50 hover:text-ring"
          }`}
          onClick={toggleCategory}
        >
          {value}
        </button>
      ))}
    </div>
  );
}

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
      <Sidebar
        collapsible="none"
        className="h-auto! min-h-svh self-stretch border-r"
      >
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
                <SidebarMenuItem>
                  <CategorySwitch />
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={1}>Item 1</SelectItem>
                      <SelectItem value={2}>Item 2</SelectItem>
                      <SelectItem value={3}>Item 3</SelectItem>
                      <SelectItem value={4}>Item 4</SelectItem>
                      <SelectItem value={5}>Item 5</SelectItem>
                    </SelectContent>
                  </Select>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <ContextMenu>
                    <ContextMenuTrigger>Right Click Me</ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem>item 1</ContextMenuItem>
                      <ContextMenuItem variant="destructive">
                        item 2
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Tabs defaultValue="one">
                    <TabsList>
                      <TabsTrigger value="one">One</TabsTrigger>
                      <TabsTrigger value="two">Two</TabsTrigger>
                    </TabsList>
                    <TabsContent value="one">First tab</TabsContent>
                    <TabsContent value="two">Second tab</TabsContent>
                  </Tabs>
                </SidebarMenuItem>
                <SidebarMenuItem className="relative">
                  <div className="h-25 bg-[#FF0000]"></div>
                  <Card className="absolute h-30 top-10 left-0 w-full">
                    <CardContent>Cool card</CardContent>
                  </Card>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <a
            href="https://legal.methanium.net/methanium/privacy-policy"
            target="_blank"
            className="hover:underline"
          >
            Privacy Policy
          </a>
        </SidebarFooter>
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
            <Button variant="warning" onClick={() => setShowLoading(true)}>
              Toggle loading screen
            </Button>
          </div>
          <ThemeCustomizer />
          <MarkdownShowcase />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
