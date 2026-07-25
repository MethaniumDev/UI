import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../cmp/select";
import type { ThemePolarity } from "../types";
import { useTheme } from "../ThemeProvider";

export function PolarityPicker() {
  const { themePolarity, setThemePolarity } = useTheme();

  return (
    <label className="flex flex-col gap-2 text-sm font-medium">
      Color scheme
      <Select
        value={themePolarity}
        onValueChange={(value) => setThemePolarity(value as ThemePolarity)}
      >
        <SelectTrigger className="w-65">
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
    </label>
  );
}
