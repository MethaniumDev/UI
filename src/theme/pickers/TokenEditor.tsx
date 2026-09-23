import { useId, useState } from "react";
import { Plus, X } from "lucide-react";

import { Button } from "../../cmp/button";
import { Input } from "../../cmp/input";
import { Label } from "../../cmp/label";
import { useTheme } from "../Provider";
import type { ResolvedThemePolarity, ThemeTokens } from "../types";
import { isHexColor } from "../utils";

import { ColorSwatch } from "./ColorPicker";

const TOKEN_GROUPS: { label: string; names: string[] }[] = [
  {
    label: "Core",
    names: [
      "--background",
      "--foreground",
      "--card",
      "--card-foreground",
      "--popover",
      "--popover-foreground",
      "--primary",
      "--primary-foreground",
      "--primary-foreground-alt",
      "--secondary",
      "--secondary-foreground",
      "--muted",
      "--muted-foreground",
      "--accent",
      "--accent-foreground",
      "--destructive",
      "--destructive-foreground",
      "--border",
      "--input",
      "--ring",
    ],
  },
  {
    label: "Charts",
    names: ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5"],
  },
  {
    label: "Sidebar",
    names: [
      "--sidebar",
      "--sidebar-foreground",
      "--sidebar-primary",
      "--sidebar-primary-foreground",
      "--sidebar-accent",
      "--sidebar-accent-foreground",
      "--sidebar-border",
      "--sidebar-ring",
    ],
  },
  {
    label: "Markdown",
    names: ["--markdown-code-background"],
  },
];

const KNOWN_TOKEN_NAMES = new Set(TOKEN_GROUPS.flatMap((group) => group.names));

function formatTokenName(name: string) {
  return name
    .replace(/^--/, "")
    .split("-")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}

/** #rrggbb plus an optional alpha channel, e.g. #cf8fe633. */
function isHexColorWithAlpha(value: string) {
  return /^#[0-9a-f]{8}$/i.test(value);
}

function TokenField({
  name,
  value,
  onValueChange,
  onRemove,
}: {
  name: string;
  value: string;
  onValueChange: (value: string) => void;
  onRemove?: () => void;
}) {
  const id = useId();
  const label = formatTokenName(name);
  return (
    <div className="grid gap-1.5 text-sm">
      <Label className="text-xs text-muted-foreground" htmlFor={id}>
        {label}
      </Label>
      <div className="flex items-center gap-1.5">
        {(value === "" || isHexColor(value) || isHexColorWithAlpha(value)) && (
          <ColorSwatch
            label={label}
            color={value}
            onColorChange={onValueChange}
          />
        )}
        <Input
          id={id}
          value={value}
          placeholder="Unset"
          spellCheck={false}
          className="font-mono text-xs"
          onChange={(event) => onValueChange(event.target.value)}
        />
        {onRemove && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Remove ${label}`}
            onClick={onRemove}
          >
            <X />
          </Button>
        )}
      </div>
    </div>
  );
}

export function TokenEditor({ mode }: { mode: ResolvedThemePolarity }) {
  const { selectedTheme, updateSelectedStyle } = useTheme();
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const tokens = selectedTheme.tokens[mode];
  const extraNames = Object.keys(tokens).filter(
    (name) => !KNOWN_TOKEN_NAMES.has(name),
  );

  const setToken = (name: string, value: string) => {
    updateSelectedStyle((style) => ({
      tokens: {
        ...style.tokens,
        [mode]: { ...style.tokens[mode], [name]: value },
      } satisfies Record<ResolvedThemePolarity, ThemeTokens>,
    }));
  };

  const addToken = () => {
    const name = newName.trim();
    if (!/^--[A-Za-z0-9-]+$/.test(name)) {
      setError("Variable names must look like --my-variable.");
      return;
    }
    if (name in tokens) {
      setError(`${name} already exists.`);
      return;
    }
    setError("");
    setNewName("");
    setToken(name, "");
  };

  return (
    <div className="flex min-w-0 flex-col gap-6">
      {TOKEN_GROUPS.map((group) => (
        <div
          key={group.label}
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          <p className="text-xs font-medium text-muted-foreground sm:col-span-2 xl:col-span-3">
            {group.label}
          </p>
          {group.names.map((name) => (
            <TokenField
              key={name}
              name={name}
              value={tokens[name] ?? ""}
              onValueChange={(value) => setToken(name, value)}
            />
          ))}
        </div>
      ))}
      {extraNames.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <p className="text-xs font-medium text-muted-foreground sm:col-span-2 xl:col-span-3">
            Custom variables
          </p>
          {extraNames.map((name) => (
            <TokenField
              key={name}
              name={name}
              value={tokens[name] ?? ""}
              onValueChange={(value) => setToken(name, value)}
              onRemove={() =>
                updateSelectedStyle((style) => {
                  const next = { ...style.tokens[mode] };
                  delete next[name];
                  return {
                    tokens: { ...style.tokens, [mode]: next },
                  };
                })
              }
            />
          ))}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Input
            value={newName}
            placeholder="--my-variable"
            spellCheck={false}
            aria-label="New variable name"
            className="max-w-45 font-mono text-xs"
            onChange={(event) => setNewName(event.target.value)}
          />
          <Button variant="outline" onClick={addToken}>
            <Plus data-icon="inline-start" />
            Add variable
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
