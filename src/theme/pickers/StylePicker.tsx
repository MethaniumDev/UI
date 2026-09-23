import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "../../cmp/button";
import { Input } from "../../cmp/input";
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
import type { ThemeFontFamily, ThemeMonoFontFamily } from "../types";
import { CustomCssPicker } from "./CustomCssPicker";
import { IconPicker } from "./IconPicker";
import { PolarityPicker } from "./PolarityPicker";
import { RulesEditor } from "./RulesEditor";
import { TokenEditor } from "./TokenEditor";

const FONT_OPTIONS: { value: ThemeFontFamily; label: string }[] = [
  { value: "system", label: "System" },
  { value: "public-sans", label: "Public Sans" },
  { value: "inter", label: "Inter" },
  { value: "roboto", label: "Roboto" },
  { value: "open-sans", label: "Open Sans" },
  { value: "noto-sans", label: "Noto Sans" },
  { value: "source-serif-4", label: "Source Serif 4" },
  { value: "atkinson-hyperlegible-next", label: "Atkinson Hyperlegible Next" },
  { value: "opendyslexic", label: "OpenDyslexic" },
];

const MONO_FONT_OPTIONS: { value: ThemeMonoFontFamily; label: string }[] = [
  { value: "system", label: "System monospace" },
  { value: "jetbrains-mono", label: "JetBrains Mono" },
  { value: "fira-code", label: "Fira Code" },
  { value: "source-code-pro", label: "Source Code Pro" },
  { value: "roboto-mono", label: "Roboto Mono" },
  { value: "geist-mono", label: "Geist Mono" },
  { value: "noto-sans-mono", label: "Noto Sans Mono" },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex min-w-0 flex-col gap-4">
      <h2 className="font-heading font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function FontSelect({
  id,
  label,
  value,
  disabled,
  options,
  onSelect,
}: {
  id: string;
  label: string;
  value: string;
  disabled?: boolean;
  options: { value: string; label: string }[];
  onSelect: (value: string) => void;
}) {
  return (
    <div className="grid gap-2 text-sm">
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={value}
        onValueChange={(next) => {
          if (next !== null) onSelect(next);
        }}
        disabled={disabled}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue>
            {options.find((option) => option.value === value)?.label}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function ThemeCustomizer() {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const fontId = useId();
  const monoFontId = useId();
  const titleId = useId();
  const {
    selectedTheme,
    isBuiltinTheme,
    resolvedPolarity,
    updateSelectedStyle,
  } = useTheme();
  const isBuiltin = isBuiltinTheme(selectedTheme.id);

  return (
    <div className="w-full min-w-0 space-y-7">
      <div className="flex flex-col gap-5">
        <ThemeSelector />
        <PolarityPicker />
        {!isBuiltin && (
          <>
            <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-start">
              <IconPicker
                logo={selectedTheme.logo}
                onLogoChange={(logo) => updateSelectedStyle({ logo })}
              />
              <div className="grid gap-2 text-sm">
                <Label htmlFor={titleId}>Name</Label>
                <Input
                  id={titleId}
                  value={selectedTheme.title}
                  onChange={(event) =>
                    updateSelectedStyle({ title: event.target.value })
                  }
                />
              </div>
            </div>
            <Section title="Colors">
              <TokenEditor mode={resolvedPolarity} />
            </Section>
            <Section title="Typography">
              <div className="grid gap-6 md:grid-cols-2">
                <FontSelect
                  id={fontId}
                  label="Font"
                  value={selectedTheme.design.fontFamily}
                  disabled={isBuiltin}
                  options={FONT_OPTIONS}
                  onSelect={(value) =>
                    updateSelectedStyle((theme) => ({
                      design: {
                        ...theme.design,
                        fontFamily: value as ThemeFontFamily,
                      },
                    }))
                  }
                />
                <FontSelect
                  id={monoFontId}
                  label="Monospace font"
                  value={selectedTheme.design.monoFontFamily}
                  disabled={isBuiltin}
                  options={MONO_FONT_OPTIONS}
                  onSelect={(value) =>
                    updateSelectedStyle((theme) => ({
                      design: {
                        ...theme.design,
                        monoFontFamily: value as ThemeMonoFontFamily,
                      },
                    }))
                  }
                />
                <LabeledSlider
                  label="Font scale"
                  value={selectedTheme.design.fontScale}
                  disabled={isBuiltin}
                  min={0.875}
                  max={1.2}
                  step={0.025}
                  formatValue={(v) => `${Math.round(v * 100)}%`}
                  onValueChange={(value) =>
                    updateSelectedStyle((theme) => ({
                      design: { ...theme.design, fontScale: value },
                    }))
                  }
                />
              </div>
            </Section>
            <Section title="Component styles">
              <RulesEditor />
            </Section>
            <div>
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
              {advancedOpen && (
                <div className="mt-6">
                  <Section title="Custom CSS">
                    <CustomCssPicker disabled={isBuiltin} />
                  </Section>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export const StylePicker = ThemeCustomizer;
