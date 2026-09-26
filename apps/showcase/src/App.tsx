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
  PixelBlast,
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
  SpecialSwitch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ThemeCustomizer,
  ThemeOnboardingPage,
  type OnboardingStep,
} from "@methanium/ui";

import { MarkdownShowcase } from "./MarkdownShowcase";
import { SettingsShowcase } from "./SettingsShowcase";

const navigation = [
  { label: "Banana", icon: Home, variant: "default" },
  { label: "Orange", icon: Blocks, variant: "default" },
  { label: "Apple", icon: Palette, variant: "outline" },
  { label: "Kiwi", icon: Settings, variant: "secondary" },
  { label: "Ghost", icon: Settings, variant: "ghost" },
] as const;

type Category = "conversations" | "communities";

function CategorySwitch() {
  const [category, setCategory] = useState<Category>("conversations");

  return (
    <SpecialSwitch
      value={category}
      onValueChange={setCategory}
      options={[
        { value: "conversations", label: "Conversations" },
        { value: "communities", label: "Communities" },
      ]}
    />
  );
}

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
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
      content: <ThemeOnboardingPage />,
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
            <Button onClick={() => setShowOnboarding(true)}>
              Open onboarding
            </Button>
            <Button variant="warning" onClick={() => setShowLoading(true)}>
              Toggle loading screen
            </Button>
          </div>
          <ThemeCustomizer />
          <h2 className="text-xl font-semibold">PixelBlast</h2>
          <div className="relative h-64 overflow-hidden rounded-lg border bg-background">
            <PixelBlast />
          </div>
          <SettingsShowcase />
          <MarkdownShowcase />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
