# Methanium UI

```sh
pnpm install https://git.methanium.net/methanium/ui/releases/download/latest/methanium-ui.tgz
```

Import the stylesheet once, then add the provider at the application root:

```tsx
import "@methanium/ui/index.css";
import { ThemeProvider } from "@methanium/ui";

<ThemeProvider>{children}</ThemeProvider>;
```

## App Default

Vite applications can choose their initial parent theme at build time:

```ts
import { methaniumUi } from "@methanium/ui/vite";

export default defineConfig({
  plugins: [methaniumUi({ defaultThemeId: "tensamin" })],
});
```

The built-in parent themes are `tensamin`, `methanium`, and `secret`. Without
the plugin or a provider override, the neutral base theme is used.
Public Sans is bundled as the default typeface; users can switch to their
platform's system font in the customizer.

## Custom Themes

Pass a typed manifest to `ThemeProvider` to add themes. Presets are ordinary
CSS and remain fully editable after selection.

```ts
import { BUILT_IN_THEMES, defineThemes } from "@methanium/ui";

export const themes = defineThemes([
  ...BUILT_IN_THEMES,
  {
    id: "my-theme",
    title: "My Theme",
    logo: "/themes/my-logo.svg",
    css: `:root[data-theme="my-theme"] { --primary: #ff4f91; }`,
  },
]);
```

Use `<ThemeCustomizer />` for all theme editing. `<ThemeSelector />` is its
focused parent-theme selection control.

## Onboarding

Every `OnboardingStep` requires a `title`; the flow owns title rendering and
focus. `<ThemeOnboardingPage />` applies choices immediately and prevents
continuing until the user explicitly selects a theme.
