import { useId } from "react";

import { Label } from "../../cmp/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../cmp/select";
import type { ThemePolarity } from "../types";
import { useTheme } from "../Provider";

export function PolarityPicker() {
  const id = useId();
  const { themePolarity, setThemePolarity } = useTheme();

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>Polarity</Label>
      <Select
        value={themePolarity}
        onValueChange={(value) => setThemePolarity(value as ThemePolarity)}
      >
        <SelectTrigger id={id} className="w-65">
          <SelectValue>
            {themePolarity === "system"
              ? "System"
              : themePolarity === "dark"
                ? "Dark"
                : "Light"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="system">System</SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
          <SelectItem value="light">Light</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
