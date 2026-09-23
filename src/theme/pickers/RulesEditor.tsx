import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Plus, Trash2 } from "lucide-react";

import { Button } from "../../cmp/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../../cmp/dropdown-menu";
import { Input } from "../../cmp/input";
import { Label } from "../../cmp/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "../../cmp/select";
import { Textarea } from "../../cmp/textarea";
import { useTheme } from "../Provider";
import { RULE_PRESETS, copyRulePreset, createRuleId } from "../rule-presets";
import type { ThemeModeScope, ThemeRule } from "../types";

const MODE_OPTIONS: { value: ThemeModeScope; label: string }[] = [
  { value: "both", label: "Both" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

function modeLabel(mode: ThemeModeScope) {
  return MODE_OPTIONS.find((option) => option.value === mode)?.label ?? mode;
}

function RuleField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-w-0 gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function RuleRow({
  rule,
  index,
  count,
}: {
  rule: ThemeRule;
  index: number;
  count: number;
}) {
  const { updateSelectedStyle } = useTheme();
  const [open, setOpen] = useState(false);

  const update = (patch: Partial<ThemeRule>) =>
    updateSelectedStyle((style) => ({
      rules: style.rules.map((current) =>
        current.id === rule.id ? { ...current, ...patch } : current,
      ),
    }));

  const move = (direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= count) return;
    updateSelectedStyle((style) => {
      const rules = [...style.rules];
      [rules[index], rules[target]] = [rules[target], rules[index]];
      return { rules };
    });
  };

  const remove = () =>
    updateSelectedStyle((style) => ({
      rules: style.rules.filter((current) => current.id !== rule.id),
    }));

  const duplicate = () =>
    updateSelectedStyle((style) => {
      const clone = { ...structuredClone(rule), id: createRuleId() };
      const rules = [...style.rules];
      rules.splice(index + 1, 0, clone);
      return { rules };
    });

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="group flex items-center gap-1 rounded-lg border bg-muted p-1">
        <Button
          className="hover:bg-muted-foreground/10!"
          variant="ghost"
          size="icon-xs"
          aria-expanded={open}
          aria-label={open ? "Collapse rule" : "Expand rule"}
          onClick={() => setOpen((value) => !value)}
        >
          <ChevronDown className={open ? "rotate-180" : undefined} />
        </Button>
        <button
          type="button"
          className="min-w-0 flex-1 cursor-pointer truncate text-left text-sm select-none"
          onClick={() => setOpen((value) => !value)}
        >
          {rule.label || "Untitled rule"}
        </button>
        <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
          {rule.group}
        </span>
        <span className="shrink-0 rounded-sm bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
          {modeLabel(rule.mode)}
        </span>
        <div className="flex shrink-0 items-center">
          <Button
            className="hover:bg-muted-foreground/10!"
            variant="ghost"
            size="icon-xs"
            aria-label="Move rule up"
            disabled={index === 0}
            onClick={() => move(-1)}
          >
            <ChevronUp />
          </Button>
          <Button
            className="hover:bg-muted-foreground/10!"
            variant="ghost"
            size="icon-xs"
            aria-label="Move rule down"
            disabled={index === count - 1}
            onClick={() => move(1)}
          >
            <ChevronDown />
          </Button>
          <Button
            className="hover:bg-muted-foreground/10!"
            variant="ghost"
            size="icon-xs"
            aria-label="Duplicate rule"
            onClick={duplicate}
          >
            <Copy />
          </Button>
          <Button
            className="hover:bg-muted-foreground/10!"
            variant="ghost"
            size="icon-xs"
            aria-label="Remove rule"
            onClick={remove}
          >
            <Trash2 />
          </Button>
        </div>
      </div>
      {open && (
        <div className="flex min-w-0 flex-col gap-3 rounded-lg border bg-muted/30 p-3">
          <div className="flex flex-wrap items-end gap-3">
            <RuleField label="Label">
              <Input
                value={rule.label}
                placeholder="Label"
                className="w-55"
                onChange={(event) => update({ label: event.target.value })}
              />
            </RuleField>
            <RuleField label="Polarity">
              <Select
                value={rule.mode}
                onValueChange={(value) =>
                  update({ mode: value as ThemeModeScope })
                }
              >
                <SelectTrigger className="w-25" aria-label="Rule polarity">
                  {modeLabel(rule.mode)}
                </SelectTrigger>
                <SelectContent>
                  {MODE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </RuleField>
            <RuleField label="Group">
              <Input
                value={rule.group}
                placeholder="Group"
                className="w-35"
                onChange={(event) => update({ group: event.target.value })}
              />
            </RuleField>
            <RuleField label="@layer">
              <Input
                value={rule.layer ?? ""}
                spellCheck={false}
                placeholder="none"
                className="w-35 font-mono text-xs"
                onChange={(event) =>
                  update({ layer: event.target.value.trim() || undefined })
                }
              />
            </RuleField>
          </div>
          <RuleField label="Selector (relative to the theme root, & targets the root)">
            <Input
              value={rule.selector}
              spellCheck={false}
              placeholder={`[data-slot="button"]:hover`}
              className="font-mono text-xs"
              onChange={(event) => update({ selector: event.target.value })}
            />
          </RuleField>
          <RuleField label="Declarations">
            <Textarea
              value={rule.declarations}
              spellCheck={false}
              placeholder="color: var(--primary);"
              className="min-h-16 resize-y font-mono text-xs leading-relaxed"
              onChange={(event) => update({ declarations: event.target.value })}
            />
          </RuleField>
        </div>
      )}
    </div>
  );
}

export function RulesEditor() {
  const { selectedTheme, updateSelectedStyle } = useTheme();
  const rules = selectedTheme.rules;

  const groups: { group: string; presets: ThemeRule[] }[] = [];
  for (const preset of RULE_PRESETS) {
    const existing = groups.find((entry) => entry.group === preset.group);
    if (existing) existing.presets.push(preset);
    else groups.push({ group: preset.group, presets: [preset] });
  }

  const appendRule = (rule: ThemeRule) =>
    updateSelectedStyle((style) => ({ rules: [...style.rules, rule] }));

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Rules apply in order.
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm">
                <Plus data-icon="inline-start" />
                Add rule
                <ChevronDown data-icon="inline-end" />
              </Button>
            }
          />
          <DropdownMenuContent
            align="end"
            className="max-h-80 w-fit min-w-45 max-w-80 overflow-y-auto"
          >
            <DropdownMenuItem
              onClick={() =>
                appendRule({
                  id: createRuleId(),
                  label: "New rule",
                  group: "Custom",
                  mode: "both",
                  selector: "",
                  declarations: "",
                })
              }
            >
              Custom rule
            </DropdownMenuItem>
            {groups.map(({ group, presets }) => (
              <DropdownMenuGroup key={group}>
                <DropdownMenuLabel>{group}</DropdownMenuLabel>
                {presets.map((preset) => (
                  <DropdownMenuItem
                    key={preset.id}
                    onClick={() => {
                      const copy = copyRulePreset(preset.id);
                      if (copy) appendRule(copy);
                    }}
                  >
                    {preset.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {rules.map((rule, index) => (
        <RuleRow key={rule.id} rule={rule} index={index} count={rules.length} />
      ))}
      {rules.length === 0 && (
        <p className="text-sm text-muted-foreground">No rules yet.</p>
      )}
    </div>
  );
}
