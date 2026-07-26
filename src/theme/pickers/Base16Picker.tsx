import * as React from "react";
import { Trash } from "lucide-react";

import { Button } from "../../cmp/button";
import { Textarea } from "../../cmp/textarea";
import { useTheme } from "../Provider";
import { formatPaletteJson, parseBase16Palette } from "../utils";

export function Base16Picker() {
  const { themePalette, setThemePalette } = useTheme();
  const [jsonValue, setJsonValue] = React.useState(() =>
    formatPaletteJson(themePalette),
  );
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    setJsonValue(formatPaletteJson(themePalette));
  }, [themePalette]);

  const applyJson = () => {
    try {
      const palette = parseBase16Palette(JSON.parse(jsonValue));

      if (!palette) {
        setError(
          "Palette JSON must include base00 through base0F as #rrggbb values.",
        );
        return;
      }

      setError("");
      setThemePalette(palette);
    } catch {
      setError("Palette JSON is not valid JSON.");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        className="h-80 resize-none font-mono text-xs leading-relaxed"
        value={jsonValue}
        onChange={(event) => setJsonValue(event.target.value)}
        spellCheck={false}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="button" onClick={applyJson}>
          Apply
        </Button>
        <Button
          variant="destructive"
          type="button"
          aria-label="Clear palette"
          title="Clear palette"
          disabled={themePalette === null}
          onClick={() => {
            setError("");
            setThemePalette(null);
          }}
        >
          <Trash />
        </Button>
      </div>
    </div>
  );
}
