import { useId, useState, type ReactNode } from "react";

import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Switch } from "./switch";

function LabeledSwitch({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex gap-2">
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
      <Label htmlFor={id}>{label}</Label>
    </div>
  );
}

function EditableList<T extends string | number>({
  label,
  items,
  parseItem,
  onItemsChange,
}: {
  label: ReactNode;
  items: readonly T[];
  parseItem: (value: string) => T | undefined;
  onItemsChange: (items: T[]) => void;
}) {
  const id = useId();
  const [inputValue, setInputValue] = useState("");

  const addItem = () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;

    const nextItem = parseItem(trimmedValue);
    if (nextItem === undefined) return;

    onItemsChange([...items, nextItem]);
    setInputValue("");
  };

  return (
    <div className="flex flex-col gap-2 pt-4">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex flex-col gap-2">
        <form
          className="flex gap-1"
          onSubmit={(event) => {
            event.preventDefault();
            addItem();
          }}
        >
          <Input
            id={id}
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
          />
          <Button type="submit">Add item</Button>
        </form>
        <div className="divide-y divide-border">
          {items.map((item, index) => (
            <div
              key={`${String(item)}-${index}`}
              className="flex min-h-10 items-center justify-between gap-2 px-1 py-1"
            >
              <span className="min-w-0 truncate">{String(item)}</span>
              <Button
                type="button"
                variant="ghost"
                className="text-destructive"
                onClick={() =>
                  onItemsChange(
                    items.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { EditableList, LabeledSwitch };
