import { ColorPicker } from "./ColorPicker";
import { useTheme } from "../ThemeProvider";

export function PrimaryPicker() {
  const { themePrimaryColor, setThemePrimaryColor } = useTheme();

  return (
    <ColorPicker
      label="Primary color"
      value={themePrimaryColor}
      onChange={setThemePrimaryColor}
      allowEmpty
    />
  );
}
