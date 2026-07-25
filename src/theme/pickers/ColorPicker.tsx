import { Trash } from "lucide-react";
import { Button, Input } from "../../index";
import { COLOR_PICKER_FALLBACK } from "../utils";

export function ColorPicker({
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

  return (
    <div className="flex items-center gap-2 w-65">
      <input
        className="w-9 h-9 rounded-md aspect-square"
        type="color"
        value={value || fallback}
        onChange={(event) => onChange(event.target.value)}
      />
      <Input
        className="No color selected"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {allowEmpty && (
        <Button
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
