import { Slider, Button } from "../../index";
import { useTheme } from "../ThemeProvider";
import { Trash } from "lucide-react";
import {
  DEFAULT_BORDER_RADIUS,
  MAX_BORDER_RADIUS,
  MIN_BORDER_RADIUS,
} from "../utils";

export function BorderRadiusPicker() {
  const { themeBorderRadius, setThemeBorderRadius } = useTheme();
  const updateBorderRadius = (value: number | readonly number[]) => {
    setThemeBorderRadius(Array.isArray(value) ? (value[0] ?? 0) : value);
  };

  return (
    <div className="flex w-65 flex-col gap-2">
      <div className="flex gap-2 items-center">
        <div className="flex flex-col justify-start flex-1 gap-1">
          <span className="font-mono text-xs text-muted-foreground">
            {themeBorderRadius.toFixed(3)}
          </span>
          <Slider
            className="w-full"
            min={MIN_BORDER_RADIUS}
            max={MAX_BORDER_RADIUS}
            step={0.025}
            value={[themeBorderRadius]}
            onValueChange={updateBorderRadius}
          />
        </div>
        <Button
          className="h-8 w-8"
          variant="destructive"
          disabled={themeBorderRadius === DEFAULT_BORDER_RADIUS}
          onClick={() => updateBorderRadius(DEFAULT_BORDER_RADIUS)}
        >
          <Trash />
        </Button>
      </div>
    </div>
  );
}
