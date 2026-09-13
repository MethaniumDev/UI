import { useId, useState, type ComponentProps, type ReactNode } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";

import { Button } from "../../cmp/button";
import { Label } from "../../cmp/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../cmp/select";
import { LabeledSlider } from "../../cmp/slider";
import { ThemeSelector } from "../BaseThemeSelector";
import { useTheme } from "../Provider";
import type { ThemeDesign, ThemeFontFamily } from "../types";
import { MAX_BORDER_RADIUS, MIN_BORDER_RADIUS } from "../utils";
import { Base16Picker } from "./Base16Picker";
import { CustomCssPicker } from "./CustomCssPicker";
import { PolarityPicker } from "./PolarityPicker";
import { PrimaryPicker } from "./PrimaryPicker";
import { TintPicker } from "./TintPicker";

const FONT_OPTIONS: { value: ThemeFontFamily; label: string }[] = [
  { value: "public-sans", label: "Public Sans" },
  { value: "inter", label: "Inter" },
  { value: "source-serif-4", label: "Source Serif 4" },
  { value: "jetbrains-mono", label: "JetBrains Mono" },
  { value: "system", label: "System" },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-heading font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function DesignSlider({
  field,
  ...props
}: Omit<ComponentProps<typeof LabeledSlider>, "value" | "onValueChange"> & {
  field: keyof Pick<
    ThemeDesign,
    | "density"
    | "borderWidth"
    | "shadowStrength"
    | "fontScale"
    | "headingWeight"
    | "motion"
  >;
}) {
  const { themeDesign, setThemeDesign } = useTheme();
  return (
    <LabeledSlider
      {...props}
      value={themeDesign[field]}
      onValueChange={(value) =>
        setThemeDesign((current) => ({ ...current, [field]: value }))
      }
    />
  );
}

export function ThemeCustomizer({
  value,
  onValueChange,
}: {
  value?: string | null;
  onValueChange?: (id: string) => void;
}) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const fontId = useId();
  const {
    themeDesign,
    setThemeDesign,
    themeBorderRadius,
    setThemeBorderRadius,
    parentTheme,
    isThemeCustomized,
    resetThemePreset,
  } = useTheme();
  return (
    <div className="w-full min-w-0 space-y-7">
      <div className="flex flex-col gap-5">
        <ThemeSelector value={value} onValueChange={onValueChange} />
        <div className="grid gap-7 lg:grid-cols-2">
          <Section title="Color scheme">
            <PolarityPicker />
            <TintPicker />
            <PrimaryPicker />
          </Section>
          <div className="space-y-7">
            <Section title="Shape and spacing">
              <div className="grid gap-6 xl:grid-cols-2">
                <DesignSlider
                  label="Density"
                  field="density"
                  min={0.8}
                  max={1.3}
                  step={0.025}
                  formatValue={(v) => `${Math.round(v * 100)}%`}
                />
                <DesignSlider
                  label="Border width"
                  field="borderWidth"
                  min={0}
                  max={3}
                  step={0.25}
                  formatValue={(v) => `${v}px`}
                />
                <LabeledSlider
                  label="Border radius"
                  value={themeBorderRadius}
                  min={MIN_BORDER_RADIUS}
                  max={MAX_BORDER_RADIUS}
                  step={0.025}
                  formatValue={(value) => `${value.toFixed(3)}rem`}
                  onValueChange={setThemeBorderRadius}
                />
              </div>
            </Section>
            <Section title="Depth and motion">
              <div className="grid gap-6 xl:grid-cols-2">
                <DesignSlider
                  label="Shadow strength"
                  field="shadowStrength"
                  min={0}
                  max={1.5}
                  step={0.05}
                  formatValue={(v) => `${Math.round(v * 100)}%`}
                />
                <DesignSlider
                  label="Motion"
                  field="motion"
                  min={0}
                  max={1.75}
                  step={0.05}
                  formatValue={(v) =>
                    v === 0 ? "Reduced" : `${Math.round(v * 100)}%`
                  }
                />
              </div>
            </Section>
          </div>
        </div>
        <Section title="Typography">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="grid gap-2 text-sm">
              <Label htmlFor={fontId}>Font</Label>
              <Select
                value={themeDesign.fontFamily}
                onValueChange={(value) =>
                  setThemeDesign((current) => ({
                    ...current,
                    fontFamily: value as ThemeFontFamily,
                  }))
                }
              >
                <SelectTrigger id={fontId} className="w-full">
                  <SelectValue>
                    {(value: ThemeFontFamily) =>
                      FONT_OPTIONS.find((font) => font.value === value)?.label
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DesignSlider
              label="Font scale"
              field="fontScale"
              min={0.875}
              max={1.2}
              step={0.025}
              formatValue={(v) => `${Math.round(v * 100)}%`}
            />
            <DesignSlider
              label="Heading boldness"
              field="headingWeight"
              min={400}
              max={800}
              step={50}
              formatValue={(v) => `${Math.round((v - 400) / 4)}%`}
            />
          </div>
        </Section>
      </div>
      <div>
        <div className="flex gap-2 w-full">
          <Button
            className="flex-1/2 md:flex-none"
            variant="outline"
            aria-expanded={advancedOpen}
            onClick={() => setAdvancedOpen((open) => !open)}
          >
            Advanced Options
            <ChevronDown
              data-icon="inline-end"
              className={advancedOpen ? "rotate-180" : undefined}
            />
          </Button>
          <Button
            className="flex-1/2 md:flex-none"
            variant="outline"
            disabled={!parentTheme || !isThemeCustomized}
            onClick={resetThemePreset}
          >
            <RotateCcw data-icon="inline-start" />
            Reset to {parentTheme?.title ?? "parent"}
          </Button>
        </div>
        {advancedOpen && (
          <div className="mt-6 space-y-7">
            <Section title="Base16 colors">
              <Base16Picker />
            </Section>
            <Section title="Custom CSS">
              <CustomCssPicker />
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}

export const StylePicker = ThemeCustomizer;
