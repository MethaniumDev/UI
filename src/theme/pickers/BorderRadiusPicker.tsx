import { useId } from "react";
import { Trash } from "lucide-react";

import { Button } from "../../cmp/button";
import { Label } from "../../cmp/label";
import { Slider } from "../../cmp/slider";
import { useTheme } from "../Provider";
import {
  DEFAULT_BORDER_RADIUS,
  MAX_BORDER_RADIUS,
  MIN_BORDER_RADIUS,
} from "../utils";

export function BorderRadiusPicker() {
  const id = useId();
  const { themeBorderRadius, setThemeBorderRadius } = useTheme();
  const updateBorderRadius = (value: number | readonly number[]) => {
    setThemeBorderRadius(Array.isArray(value) ? (value[0] ?? 0) : value);
  };

  return (
    <div className="flex w-65 flex-col gap-2">
      <div className="flex justify-between gap-4">
        <Label htmlFor={id}>Border radius</Label>
        <output
          htmlFor={id}
          className="font-mono text-xs text-muted-foreground"
        >
          {themeBorderRadius.toFixed(3)}rem
        </output>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex flex-1 flex-col justify-start gap-1">
          <Slider
            id={id}
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
