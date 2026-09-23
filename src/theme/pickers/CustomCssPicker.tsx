import { useRef, useState } from "react";
import { Undo2 } from "lucide-react";

import { Button } from "../../cmp/button";
import { Textarea } from "../../cmp/textarea";
import { useTheme } from "../Provider";

function hasBalancedBlocks(css: string) {
  return css.split("{").length === css.split("}").length;
}

export function CustomCssPicker({ disabled }: { disabled?: boolean }) {
  const { selectedTheme, updateSelectedStyle } = useTheme();
  const customCss = selectedTheme.customCss;
  const editStart = useRef(customCss);
  const [canUndo, setCanUndo] = useState(false);
  const valid = hasBalancedBlocks(customCss);

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {!valid && <p className="text-destructive">Invalid Syntax</p>}
      <Textarea
        value={customCss}
        disabled={disabled}
        onFocus={() => {
          editStart.current = customCss;
          setCanUndo(false);
        }}
        onChange={(event) => {
          updateSelectedStyle({ customCss: event.currentTarget.value });
          setCanUndo(event.currentTarget.value !== editStart.current);
        }}
        placeholder={":root {\n  --primary: oklch(0.6 0.2 260);\n}"}
        spellCheck={false}
        className="min-h-80 resize-y font-mono text-xs leading-relaxed"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        disabled={!canUndo || disabled}
        onClick={() => {
          updateSelectedStyle({ customCss: editStart.current });
          setCanUndo(false);
        }}
      >
        <Undo2 data-icon="inline-start" /> Undo edits
      </Button>
    </div>
  );
}
