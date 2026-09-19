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

export function ColorPicker({
  label,
  value,
  onChange,
  fallback = COLOR_PICKER_FALLBACK,
  allowEmpty = false,
}: {
  label: React.ReactNode;
  value: string;
  onChange: (color: string) => void;
  fallback?: string;
  allowEmpty?: boolean;
}) {
  const isEmpty = value === "";
  const selected = value || fallback;
  const hsl = hexToHsl(selected);
  const accessibleLabel = typeof label === "string" ? label : "Color";

  return (
    <div className="flex w-full max-w-65 items-center gap-2">
      <Dialog>
        <DialogTrigger
          render={
            <button
              aria-label={`Edit ${accessibleLabel.toLowerCase()}`}
              className="size-8 shrink-0 rounded-full border border-foreground/20 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ background: selected }}
              type="button"
            />
          }
        />
        <DialogContent className="aspect-square w-[calc(100%-2rem)] max-w-80! p-4">
          <DialogTitle className="sr-only">
            Edit {accessibleLabel.toLowerCase()}
          </DialogTitle>
          <HuePicker
            aria-label={`${accessibleLabel} hue`}
            className="size-full"
            color={selected}
            value={hsl.h}
            onValueChange={(hue) => onChange(hslToHex({ ...hsl, h: hue }))}
          />
        </DialogContent>
      </Dialog>
      <Input
        aria-label={accessibleLabel}
        placeholder="No color selected"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {allowEmpty && (
        <Button
          aria-label="Clear color"
          className="h-8 w-8"
          variant="destructive"
          disabled={isEmpty}
          onClick={() => onChange("")}
        >
          <Trash />
        </Button>
      )}
    </div>
  );
}
