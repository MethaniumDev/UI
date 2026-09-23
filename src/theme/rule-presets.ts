import type { ThemeModeScope, ThemeRule } from "./types";

function rule(
  id: string,
  label: string,
  group: string,
  mode: ThemeModeScope,
  selector: string,
  declarations: string,
  layer?: string,
): ThemeRule {
  return {
    id,
    label,
    group,
    mode,
    selector,
    declarations: declarations.trim(),
    ...(layer ? { layer } : {}),
  };
}

export function createRuleId() {
  return `rule-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Reusable style rules that themes are composed from. The built-in presets
 * reference these, and users can add copies of them to custom themes.
 */
export const RULE_PRESETS: readonly ThemeRule[] = Object.freeze([
  // Corners
  rule(
    "corners-sharp",
    "Sharp corners",
    "Corners",
    "both",
    "&",
    `--radius: 0rem;`,
  ),
  rule(
    "corners-small",
    "Small corners",
    "Corners",
    "both",
    "&",
    `--radius: 0.25rem;`,
  ),
  rule(
    "corners-medium",
    "Medium corners",
    "Corners",
    "both",
    "&",
    `--radius: 0.5rem;`,
  ),
  rule(
    "corners-round",
    "Round corners",
    "Corners",
    "both",
    "&",
    `--radius: 0.75rem;`,
  ),
  rule(
    "squared-controls",
    "Control radius & border style",
    "Controls",
    "both",
    `:where([data-slot="card"], [data-slot="button"], [data-slot="input"], [data-slot="textarea"], [data-slot="native-select"], [data-slot="select-trigger"], [data-slot="input-group"], [data-slot="dialog-content"], [data-slot="alert-dialog-content"], [data-slot="popover-content"])`,
    `border-radius: var(--radius);
border-style: solid;`,
  ),

  // Motion
  rule(
    "no-animations",
    "No animations or transitions",
    "Motion",
    "both",
    "*:not(.loading-line-wobble), *::before, *::after",
    `transition: none !important;
animation: none !important;
scroll-behavior: auto !important;`,
  ),

  // Layout
  rule(
    "page-background",
    "Page background",
    "Layout",
    "both",
    "body",
    `background-color: var(--background);`,
  ),
  rule(
    "separator-gradient",
    "Separator gradient",
    "Layout",
    "both",
    `[data-slot="separator"]`,
    `background: linear-gradient(90deg, transparent, color-mix(in oklch, var(--primary) 42%, var(--border)), transparent);`,
  ),
  rule(
    "compact-spacing",
    "Compact spacing",
    "Layout",
    "both",
    "&",
    `--ui-spacing: 0.875;\n--ui-density: 0.875;`,
  ),
  rule(
    "roomy-spacing",
    "Roomy spacing",
    "Layout",
    "both",
    "&",
    `--ui-spacing: 1.125;\n--ui-density: 1.125;`,
  ),
  rule(
    "thick-borders",
    "Thick borders",
    "Layout",
    "both",
    "&",
    `--ui-border-width: 2px;`,
  ),

  // Buttons
  rule(
    "chonky-buttons",
    "Chonky buttons",
    "Buttons",
    "both",
    `[data-slot="button"]`,
    `min-height: 0;
font-weight: 500;
border-radius: var(--radius);
padding-inline: calc(1.35rem * var(--ui-density));
transition-duration: 100ms;`,
  ),
  rule(
    "button-press-offset",
    "Button press offset",
    "Buttons",
    "both",
    `[data-slot="button"]:active`,
    `translate: none;`,
  ),
  rule(
    "button-height-xs",
    "Extra small button height",
    "Buttons",
    "both",
    `[data-slot="button"][data-size="xs"]`,
    `height: calc(2rem * var(--ui-density));`,
  ),
  rule(
    "button-height-lg",
    "Large button height",
    "Buttons",
    "both",
    `[data-slot="button"][data-size="lg"]`,
    `height: calc(2.5rem * var(--ui-density));`,
  ),
  rule(
    "button-padding-small",
    "Small button horizontal padding",
    "Buttons",
    "both",
    `[data-slot="button"][data-size="sm"]:not([data-size^="icon"]),
[data-slot="button"][data-size="xs"]:not([data-size^="icon"])`,
    `padding-inline: calc(1.25rem * var(--ui-density));`,
  ),
  rule(
    "ghost-hover-muted",
    "Muted ghost hover",
    "Buttons",
    "both",
    `[data-slot="button"]:is([data-variant="ghost"], [data-variant="secondary"]):hover`,
    `background-color: color-mix(in srgb, var(--foreground) 11%, var(--background)) !important;`,
    "theme",
  ),
  rule(
    "ghost-hover-filled",
    "Ghost hover (filled)",
    "Buttons",
    "both",
    `[data-slot="button"][data-variant="ghost"]:hover`,
    `background-color: var(--secondary);`,
  ),
  rule(
    "primary-button-bordered",
    "Bordered primary button",
    "Buttons",
    "both",
    `[data-slot="button"][data-variant="default"]`,
    `background-color: var(--primary);
color: var(--primary-foreground);
border: var(--ui-border-width) solid var(--primary);`,
  ),
  rule(
    "primary-button-hover",
    "Primary button hover",
    "Buttons",
    "both",
    `[data-slot="button"][data-variant="default"]:hover`,
    `background-color: var(--primary-foreground-alt);
border: var(--ui-border-width) solid var(--primary);`,
  ),
  rule(
    "secondary-button-bordered",
    "Bordered secondary button",
    "Buttons",
    "both",
    `[data-slot="button"][data-variant="secondary"]`,
    `background-color: var(--secondary);
border-color: color-mix(in srgb, white 16%, transparent);
color: var(--secondary-foreground);`,
  ),
  rule(
    "secondary-button-hover",
    "Secondary button hover",
    "Buttons",
    "both",
    `[data-slot="button"][data-variant="secondary"]:hover`,
    `background-color: var(--secondary);
border-color: color-mix(in srgb, var(--ring) 60%, transparent);`,
  ),
  rule(
    "link-button-hover",
    "Link button hover",
    "Buttons",
    "both",
    `[data-slot="button"][data-variant="link"]:hover`,
    `background-color: transparent;
border-color: color-mix(in srgb, var(--ring) 60%, transparent);`,
  ),
  rule(
    "destructive-bordered",
    "Bordered destructive variant",
    "Buttons",
    "both",
    `[data-slot][data-variant="destructive"]`,
    `border: var(--ui-border-width) solid var(--destructive);`,
  ),
  rule(
    "outline-link-fill",
    "Outline & link fill",
    "Buttons",
    "both",
    `:where(
  [data-slot="button"][data-variant="outline"],
  [data-slot="button"][data-variant="link"],
  [data-slot="badge"][data-variant="outline"],
  [data-slot="toggle"][data-variant="outline"]
)`,
    `background-color: var(--secondary);
border-color: transparent;
color: var(--secondary-foreground);`,
  ),
  rule(
    "link-button-overlay",
    "Link button overlay",
    "Buttons",
    "both",
    `[data-slot="button"][data-variant="link"]`,
    `background-image: none;`,
  ),
  rule(
    "link-button-hover-flat",
    "Link button hover (flat)",
    "Buttons",
    "both",
    `[data-slot="button"][data-variant="link"]:hover`,
    `background-color: var(--secondary);
background-image: none;`,
  ),
  rule(
    "ghost-button-overlay",
    "Ghost button overlay",
    "Buttons",
    "both",
    `[data-slot="button"][data-variant="ghost"]`,
    `background-image: none;`,
  ),
  rule(
    "ghost-button-hover-overlay",
    "Ghost button hover overlay",
    "Buttons",
    "both",
    `[data-slot="button"][data-variant="ghost"]:hover`,
    `background-image: linear-gradient(to top, rgb(255 255 255 / 12%), rgb(255 255 255 / 2%));`,
  ),
  rule(
    "gold-primary-button",
    "Gold primary button",
    "Buttons",
    "both",
    `[data-slot="button"][data-variant="default"]`,
    `background-color: var(--primary);
background-image:
  linear-gradient(to top, rgb(255 255 255 / 12%), rgb(255 255 255 / 2%)),
  linear-gradient(115deg, var(--secret-gold-dark) 0%, var(--secret-gold) 30%, var(--secret-gold-light) 47%, var(--secret-gold) 62%, var(--secret-gold-dark) 100%);
border-color: var(--secret-border);
color: var(--primary-foreground);
text-shadow: 0 1px rgb(255 255 255 / 35%);
box-shadow:
  inset 0 1px rgb(255 255 255 / 45%),
  0 0.45rem 1.2rem rgb(36 18 12 / 28%);`,
  ),
  rule(
    "outline-hover-light",
    "Outline hover (light)",
    "Buttons",
    "light",
    `:where(
  [data-slot="button"],
  [data-slot="badge"],
  [data-slot="toggle"]
)[data-variant="outline"]:is(
  :hover,
  :focus-visible,
  [aria-expanded="true"],
  [data-popup-open],
  [data-open]
)`,
    `background-color: color-mix(in srgb, var(--secondary) 82%, #622a53 18%);
border-color: transparent;
color: var(--secondary-foreground);`,
  ),
  rule(
    "outline-hover-dark",
    "Outline hover (dark)",
    "Buttons",
    "dark",
    `:where(
  [data-slot="button"],
  [data-slot="badge"],
  [data-slot="toggle"]
)[data-variant="outline"]:is(
  :hover,
  :focus-visible,
  [aria-expanded="true"],
  [data-popup-open],
  [data-open]
)`,
    `background-color: color-mix(in srgb, var(--secondary) 82%, #24120c 18%);
border-color: transparent;
color: var(--secondary-foreground);`,
  ),

  // Controls
  rule(
    "control-height-small",
    "Small control height",
    "Controls",
    "both",
    `:where([data-slot="button"], [data-slot="select-trigger"])[data-size="sm"]`,
    `height: calc(2.125rem * var(--ui-density));`,
  ),
  rule(
    "control-height-default",
    "Default control height",
    "Controls",
    "both",
    `:where([data-slot="button"], [data-slot="select-trigger"])[data-size="default"],
:where([data-slot="input"], [data-slot="native-select"], [data-slot="input-group"])`,
    `height: calc(2.25rem * var(--ui-density));`,
  ),
  rule(
    "glossy-controls",
    "Glossy overlay",
    "Controls",
    "both",
    `:where(
  [data-slot="button"],
  [data-slot="toggle"],
  [data-slot="input"],
  [data-slot="textarea"],
  [data-slot="native-select"],
  [data-slot="select-trigger"],
  [data-slot="input-group"],
  [data-slot="checkbox"],
  [data-slot="radio-group-item"],
  [data-slot="switch"]
)`,
    `background-image: linear-gradient(to top, rgb(255 255 255 / 12%), rgb(255 255 255 / 2%));
background-repeat: no-repeat;`,
  ),

  // Inputs
  rule(
    "input-padding",
    "Input horizontal padding",
    "Inputs",
    "both",
    `:where([data-slot="input"], [data-slot="native-select"], [data-slot="select-trigger"])`,
    `padding-inline: calc(1rem * var(--ui-density));`,
  ),
  rule(
    "textarea-padding",
    "Textarea padding",
    "Inputs",
    "both",
    `[data-slot="textarea"]`,
    `padding: calc(0.785rem * var(--ui-density)) calc(1rem * var(--ui-density));`,
  ),
  rule(
    "input-fill",
    "Input & outline fill",
    "Inputs",
    "both",
    `:where([data-slot="input"], [data-slot="textarea"], [data-slot="native-select"], [data-slot="select-trigger"], [data-slot="input-group"], [data-slot="button"][data-variant="outline"])`,
    `background-color: color-mix(in srgb, var(--input) 55%, var(--background));
border-color: var(--input);
color: var(--foreground);
transition: background-color 100ms ease, border-color 100ms ease;`,
  ),
  rule(
    "input-hover",
    "Input & outline hover",
    "Inputs",
    "both",
    `:where([data-slot="input"], [data-slot="textarea"], [data-slot="native-select"], [data-slot="select-trigger"], [data-slot="input-group"], [data-slot="button"][data-variant="outline"]):not(:disabled):not([data-disabled]):not(:has(:disabled)):hover`,
    `background-color: color-mix(in srgb, var(--input) 55%, var(--background));
border-color: color-mix(in srgb, var(--input) 75%, var(--foreground) 25%);`,
  ),
  rule(
    "input-focus-primary",
    "Input focus border",
    "Inputs",
    "both",
    `[data-slot="input"]:not(:disabled):focus,
[data-slot="input"]:not(:disabled):focus:hover`,
    `border-color: var(--primary);`,
  ),
  rule(
    "secret-control-fill",
    "Colored control fill",
    "Inputs",
    "both",
    `:where(
  [data-slot="input"],
  [data-slot="textarea"],
  [data-slot="native-select"],
  [data-slot="select-trigger"],
  [data-slot="input-group"]
)`,
    `background-color: var(--secret-control);
border-color: transparent;`,
  ),
  rule(
    "secret-control-text-light",
    "Colored control text (light)",
    "Inputs",
    "light",
    `:where(
  [data-slot="input"],
  [data-slot="textarea"],
  [data-slot="native-select"],
  [data-slot="select-trigger"],
  [data-slot="input-group"]
)`,
    `color: #2f1b13;`,
  ),
  rule(
    "secret-control-text-dark",
    "Colored control text (dark)",
    "Inputs",
    "dark",
    `:where(
  [data-slot="input"],
  [data-slot="textarea"],
  [data-slot="native-select"],
  [data-slot="select-trigger"],
  [data-slot="input-group"]
)`,
    `color: #ffe8b4;`,
  ),
  rule(
    "secret-placeholder-light",
    "Placeholder color (light)",
    "Inputs",
    "light",
    `:where(
  [data-slot="input"],
  [data-slot="textarea"]
)::placeholder`,
    `color: #5f4558;
opacity: 1;`,
  ),
  rule(
    "secret-placeholder-dark",
    "Placeholder color (dark)",
    "Inputs",
    "dark",
    `:where(
  [data-slot="input"],
  [data-slot="textarea"]
)::placeholder`,
    `color: #d9b99c;
opacity: 1;`,
  ),
  rule(
    "secret-control-hover-light",
    "Colored control hover (light)",
    "Inputs",
    "light",
    `:where(
  [data-slot="input"],
  [data-slot="textarea"],
  [data-slot="native-select"],
  [data-slot="select-trigger"],
  [data-slot="input-group"]
):hover`,
    `background-color: color-mix(in srgb, var(--secret-control) 88%, #622a53 12%);
border-color: transparent;`,
  ),
  rule(
    "secret-control-hover-dark",
    "Colored control hover (dark)",
    "Inputs",
    "dark",
    `:where(
  [data-slot="input"],
  [data-slot="textarea"],
  [data-slot="native-select"],
  [data-slot="select-trigger"],
  [data-slot="input-group"]
):hover`,
    `background-color: color-mix(in srgb, var(--secret-control) 84%, #24120c 16%);
border-color: transparent;`,
  ),
  rule(
    "secret-control-focus-light",
    "Colored control focus (light)",
    "Inputs",
    "light",
    `:where(
  [data-slot="input"],
  [data-slot="textarea"],
  [data-slot="native-select"],
  [data-slot="select-trigger"],
  [data-slot="input-group"]
):is(:focus-visible, :focus-within)`,
    `background-color: color-mix(in srgb, var(--secret-control) 88%, #622a53 12%);
border-color: transparent;`,
  ),
  rule(
    "secret-control-focus-dark",
    "Colored control focus (dark)",
    "Inputs",
    "dark",
    `:where(
  [data-slot="input"],
  [data-slot="textarea"],
  [data-slot="native-select"],
  [data-slot="select-trigger"],
  [data-slot="input-group"]
):is(:focus-visible, :focus-within)`,
    `background-color: color-mix(in srgb, var(--secret-control) 84%, #24120c 16%);
border-color: transparent;`,
  ),
  rule(
    "secret-trigger-open-light",
    "Open select trigger (light)",
    "Inputs",
    "light",
    `[data-slot="select-trigger"]:is(
  [data-popup-open],
  [data-open],
  [aria-expanded="true"]
)`,
    `background-color: color-mix(in srgb, var(--secret-control) 88%, #622a53 12%);
border-color: transparent;`,
  ),
  rule(
    "secret-trigger-open-dark",
    "Open select trigger (dark)",
    "Inputs",
    "dark",
    `[data-slot="select-trigger"]:is(
  [data-popup-open],
  [data-open],
  [aria-expanded="true"]
)`,
    `background-color: color-mix(in srgb, var(--secret-control) 84%, #24120c 16%);
border-color: transparent;`,
  ),

  // Menus
  rule(
    "popup-colors",
    "Popup colors",
    "Menus",
    "both",
    `:where([data-slot="select-content"], [data-slot="dropdown-menu-content"], [data-slot="dropdown-menu-sub-content"], [data-slot="context-menu-content"], [data-slot="context-menu-sub-content"], [data-slot="menubar-content"], [data-slot="menubar-sub-content"], [data-slot="combobox-content"], [data-slot="popover-content"], [data-slot="hover-card-content"])`,
    `background-color: var(--popover);
border-color: var(--border);
color: var(--popover-foreground);`,
  ),
  rule(
    "menu-item-highlight",
    "Highlighted item colors",
    "Menus",
    "both",
    `:where([data-slot="select-item"], [data-slot="dropdown-menu-item"], [data-slot="dropdown-menu-checkbox-item"], [data-slot="dropdown-menu-radio-item"], [data-slot="dropdown-menu-sub-trigger"], [data-slot="context-menu-item"], [data-slot="context-menu-checkbox-item"], [data-slot="context-menu-radio-item"], [data-slot="context-menu-sub-trigger"], [data-slot="menubar-item"], [data-slot="menubar-checkbox-item"], [data-slot="menubar-radio-item"], [data-slot="menubar-sub-trigger"]):focus,
[data-slot="combobox-item"][data-highlighted],
[data-slot="command-item"][data-selected]`,
    `background-color: var(--accent);
color: var(--accent-foreground);`,
  ),
  rule(
    "select-popup-border",
    "Select popup border",
    "Menus",
    "both",
    `[data-slot="select-content"]`,
    `background-color: var(--popover);
border-color: var(--secret-border);
color: var(--popover-foreground);`,
  ),
  rule(
    "secret-item-highlight-light",
    "Warm highlighted item (light)",
    "Menus",
    "light",
    `:where(
  [data-slot="select-item"],
  [data-slot="context-menu-item"],
  [data-slot="context-menu-sub-trigger"]
):is(
  :hover,
  :focus,
  [data-highlighted],
  [data-selected],
  [data-open]
)`,
    `background-color: color-mix(in srgb, var(--popover) 82%, #622a53 18%);
color: #2f1b13;`,
  ),
  rule(
    "secret-item-highlight-dark",
    "Warm highlighted item (dark)",
    "Menus",
    "dark",
    `:where(
  [data-slot="select-item"],
  [data-slot="context-menu-item"],
  [data-slot="context-menu-sub-trigger"]
):is(
  :hover,
  :focus,
  [data-highlighted],
  [data-selected],
  [data-open]
)`,
    `background-color: color-mix(in srgb, var(--popover) 72%, #0a0a0a 28%);
color: #ffe8b4;`,
  ),

  // Cards
  rule(
    "card-section-padding",
    "Card section padding",
    "Cards",
    "both",
    `:where([data-slot="card-header"], [data-slot="card-content"], [data-slot="card-footer"])`,
    `padding-inline: calc(1rem * var(--ui-density));`,
  ),
  rule(
    "card-frame",
    "Card frame",
    "Cards",
    "both",
    `[data-slot="card"]`,
    `padding-block: calc(1rem * var(--ui-density));
border: var(--ui-border-width) solid var(--input);
background-color: color-mix(in srgb, var(--input) 55%, var(--background));`,
  ),
  rule(
    "card-background",
    "Card background",
    "Cards",
    "both",
    `[data-slot="card"]`,
    `background: var(--card);`,
  ),
  rule(
    "card-shadow",
    "Card & dialog shadow",
    "Cards",
    "both",
    `:where(
  [data-slot="card"],
  [data-slot="dialog-content"],
  [data-slot="alert-dialog-content"]
)`,
    `border-color: var(--secret-border);
box-shadow:
  inset 0 1px color-mix(in oklch, white 8%, transparent),
  0 1rem 3rem rgb(97 37 82 / 12%);`,
  ),

  // Tabs
  rule(
    "switch-radius",
    "Two-option switch corner radius",
    "Tabs",
    "both",
    `[role="tablist"].grid.grid-cols-2.bg-card.rounded-4xl,
[role="tablist"].grid.grid-cols-2.bg-card.rounded-4xl > .rounded-4xl`,
    `border-radius: var(--radius) !important;`,
  ),
  rule(
    "switch-tab-color",
    "Unselected tab color",
    "Tabs",
    "both",
    `[role="tablist"].grid.grid-cols-2.bg-card.rounded-4xl > [role="tab"][aria-selected="false"]`,
    `color: color-mix(in srgb, var(--muted-foreground) 75%, black);`,
  ),

  // Icons
  rule(
    "icon-primary",
    "Primary-colored icons",
    "Icons",
    "both",
    `:where(
  [data-slot="card-title"],
  [data-slot="item-media"][data-variant="icon"],
  [data-slot="badge"][data-variant="outline"]
) svg`,
    `color: var(--primary);`,
  ),
  rule(
    "icon-primary-light",
    "Primary-colored icons (light)",
    "Icons",
    "light",
    `:where(
  [data-slot="card-title"],
  [data-slot="item-media"][data-variant="icon"],
  [data-slot="badge"][data-variant="outline"]
) svg`,
    `color: var(--secret-gold-dark);`,
  ),
]);

export function findRulePreset(id: string) {
  return RULE_PRESETS.find((preset) => preset.id === id) ?? null;
}

/** Returns a fresh, editable copy of a rule preset for a theme. */
export function copyRulePreset(id: string): ThemeRule | null {
  const preset = findRulePreset(id);
  return preset ? { ...preset, id: createRuleId() } : null;
}
