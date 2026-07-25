import { Button } from "../../cmp/button";
import { Textarea } from "../../cmp/textarea";
import { useTheme } from "../ThemeProvider";

const CUSTOM_CSS_PLACEHOLDER = `* {
  color: black;
}`;

export function CustomCssPicker() {
  const { themeCustomCss, setThemeCustomCss } = useTheme();

  return (
    <div className="flex w-90 flex-col gap-2">
      <Textarea
        value={themeCustomCss}
        onChange={(event) => setThemeCustomCss(event.currentTarget.value)}
        placeholder={CUSTOM_CSS_PLACEHOLDER}
        spellCheck={false}
        className="h-80 resize-none font-mono text-xs leading-relaxed"
      />
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setThemeCustomCss("")}
          disabled={themeCustomCss === ""}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
