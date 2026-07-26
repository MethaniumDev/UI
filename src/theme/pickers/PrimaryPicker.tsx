import { Label } from "../../cmp/label";
import { ColorPicker } from "./ColorPicker";
import { useTheme } from "../Provider";

export function PrimaryPicker() {
  const { themePrimaryColor, setThemePrimaryColor } = useTheme();

  return (
    <div className="flex flex-col gap-2">
      <Label>Custom Primary Color</Label>
      <ColorPicker
        label="Primary color"
        value={themePrimaryColor}
        onChange={setThemePrimaryColor}
        allowEmpty
      />
    </div>
  );
}
