import { Trash } from "lucide-react";
import { Button } from "../../cmp/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../../cmp/dialog";
import { HuePicker } from "../../cmp/hue-picker";
import { Input } from "../../cmp/input";
import { COLOR_PICKER_FALLBACK, hexToHsl, hslToHex } from "../utils";

/**
 * Color swatch button that opens the shared hue picker dialog. Used by every
 * color picker so they all behave the same.
 */
export function ColorSwatch({
  label,
  color,
  onColorChange,
  disabled = false,
}: {
  label: string;
  color: string;
  onColorChange: (color: string) => void;
  disabled?: boolean;
}) {
  const selected = color || COLOR_PICKER_FALLBACK;
  const hsl = hexToHsl(selected);

  return (
    <Dialog>
      <DialogTrigger
        disabled={disabled}
        render={
          <button
            aria-label={`Edit ${label.toLowerCase()}`}
            className="size-8 shrink-0 rounded-full border border-foreground/20 outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: selected }}
            type="button"
          />
        }
      />
      <DialogContent className="aspect-square w-[calc(100%-2rem)] max-w-80! p-4">
        <DialogTitle className="sr-only">
          Edit {label.toLowerCase()}
        </DialogTitle>
        <HuePicker
          aria-label={`${label} hue`}
          className="size-full"
          color={selected}
          value={hsl.h}
          onValueChange={(hue) => onColorChange(hslToHex({ ...hsl, h: hue }))}
        />
      </DialogContent>
    </Dialog>
  );
}

export function ColorPicker({
  label,
  value,
  onChange,
  allowEmpty = false,
  disabled = false,
}: {
  label: React.ReactNode;
  value: string;
  onChange: (color: string) => void;
  allowEmpty?: boolean;
  disabled?: boolean;
}) {
  const isEmpty = value === "";
  const accessibleLabel = typeof label === "string" ? label : "Color";

  return (
    <div className="flex w-full max-w-65 items-center gap-2">
      <ColorSwatch
        label={accessibleLabel}
        color={value}
        onColorChange={onChange}
        disabled={disabled}
      />
      <Input
        aria-label={accessibleLabel}
        placeholder="No color selected"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
      {allowEmpty && (
        <Button
          aria-label="Clear color"
          className="h-8 w-8"
          variant="destructive"
          disabled={isEmpty || disabled}
          onClick={() => onChange("")}
        >
          <Trash />
        </Button>
      )}
    </div>
  );
}
