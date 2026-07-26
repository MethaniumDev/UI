import { useRef, useState } from "react";
import { RotateCcw, Undo2 } from "lucide-react";

import { Button } from "../../cmp/button";
import { Textarea } from "../../cmp/textarea";
import { useTheme } from "../Provider";

function hasBalancedBlocks(css: string) {
  return css.split("{").length === css.split("}").length;
}

export function CustomCssPicker() {
  const { themeCustomCss, setThemeCustomCss, parentTheme, resetThemePreset } =
    useTheme();
  const editStart = useRef(themeCustomCss);
  const [canUndo, setCanUndo] = useState(false);
  const valid = hasBalancedBlocks(themeCustomCss);

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {!valid && <p className="text-destructive">Invalid Syntax</p>}
      <Textarea
        value={themeCustomCss}
        onFocus={() => {
          editStart.current = themeCustomCss;
          setCanUndo(false);
        }}
        onChange={(event) => {
          setThemeCustomCss(event.currentTarget.value);
          setCanUndo(event.currentTarget.value !== editStart.current);
        }}
        placeholder={":root {\n  --primary: oklch(0.6 0.2 260);\n}"}
        spellCheck={false}
        className="min-h-80 resize-y font-mono text-xs leading-relaxed"
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canUndo}
          onClick={() => {
            setThemeCustomCss(editStart.current);
            setCanUndo(false);
          }}
        >
          <Undo2 data-icon="inline-start" /> Undo edits
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!parentTheme}
          onClick={resetThemePreset}
        >
          <RotateCcw data-icon="inline-start" /> Reset to parent
        </Button>
      </div>
    </div>
  );
}
