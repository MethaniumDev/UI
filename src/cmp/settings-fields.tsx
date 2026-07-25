import { useId, useState, type ReactNode } from "react";

import { Button } from "./button";
import { Checkbox } from "./checkbox";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./context-menu";
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
    <div className="flex gap-1">
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
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  const addItem = () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;

    const nextItem = parseItem(trimmedValue);
    if (nextItem === undefined) return;

    onItemsChange([...items, nextItem]);
    setInputValue("");
  };

  const deleteItems = (indexes: Set<number>) => {
    onItemsChange(items.filter((_, index) => !indexes.has(index)));
    setSelectedItems(new Set());
  };

  return (
    <div className="flex flex-col gap-2 pt-4">
      <Label>{label}</Label>
      <div className="flex flex-col gap-0 overflow-hidden rounded-xl border-2 p-1">
        <div className="flex gap-1">
          <Input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") addItem();
            }}
          />
          <Button onClick={addItem}>Add item</Button>
        </div>
        <div className="flex flex-col gap-0">
          {items.map((item, index) => {
            const labelId = `${id}-${index}`;
            const selected = selectedItems.has(index);
            const deletingSelectedItems = selectedItems.size > 1;

            return (
              <ContextMenu key={`${String(item)}-${index}`}>
                <ContextMenuTrigger
                  render={
                    <div className="grid grid-cols-[auto_auto_1fr] items-center gap-2 border-b px-1 py-2 last:border-b-0">
                      <Checkbox
                        id={labelId}
                        checked={selected}
                        onCheckedChange={(checked) =>
                          setSelectedItems((previous) => {
                            const nextSelected = new Set(previous);
                            if (checked) nextSelected.add(index);
                            else nextSelected.delete(index);
                            return nextSelected;
                          })
                        }
                      />
                      <Label htmlFor={labelId}>{String(item)}</Label>
                      <div />
                    </div>
                  }
                />
                <ContextMenuContent>
                  <ContextMenuItem
                    variant="destructive"
                    onClick={() =>
                      deleteItems(
                        deletingSelectedItems
                          ? selectedItems
                          : new Set([index]),
                      )
                    }
                  >
                    {deletingSelectedItems ? "Delete Selected" : "Delete"}
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { EditableList, LabeledSwitch };
