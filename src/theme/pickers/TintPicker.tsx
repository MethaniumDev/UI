import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../cmp/select";
import { Label } from "../../cmp/label";
import { useTheme } from "../Provider";
import type { ThemeTint } from "../types";
import { THEME_TINT_OPTIONS } from "../utils";

import { ColorPicker } from "./ColorPicker";

export function TintPicker() {
  const {
    themeTint,
    setThemeTint,
    themeColor,
    setThemeColor,
    setThemePalette,
  } = useTheme();

  const setSingleColor = (color: string) => {
    setThemePalette(null);
    setThemeColor(color);
  };

  return (
    <div className="flex flex-col gap-2">
      <Label>Tint</Label>
      <ColorPicker
        label="Theme color"
        value={themeColor}
        onChange={(color) => {
          if (color === "") {
            setThemePalette(null);
            setThemeColor("");
            return;
          }

          setSingleColor(color);
        }}
        allowEmpty
      />
      <Select
        value={themeTint}
        onValueChange={(value) => setThemeTint(value as ThemeTint)}
      >
        <SelectTrigger className="w-65">
          <SelectValue>
            {THEME_TINT_OPTIONS.find((option) => option.value === themeTint)
              ?.label ?? "Soft"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {THEME_TINT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
