import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../cmp/alert-dialog";
import { Button } from "../cmp/button";
import { cn } from "../lib/utils";
import { useTheme } from "./Provider";

export type ThemeSelectorProps = {
  value?: string | null;
  onValueChange?: (id: string) => void;
  className?: string;
};

export function ThemeSelector({
  value,
  onValueChange,
  className,
}: ThemeSelectorProps) {
  const { themes, parentThemeId, applyThemePreset, isThemeCustomized } =
    useTheme();
  const selected = value === undefined ? parentThemeId : value;
  const [pendingThemeId, setPendingThemeId] = useState<string | null>(null);

  const apply = (id: string) => {
    applyThemePreset(id);
    onValueChange?.(id);
  };
  const choose = (id: string) => {
    if (id === selected) return;
    if (isThemeCustomized && parentThemeId && parentThemeId !== id) {
      setPendingThemeId(id);
      return;
    }
    apply(id);
  };

  return (
    <>
      <div
        className={cn(
          "grid w-full grid-cols-[repeat(auto-fit,minmax(5rem,1fr))] gap-3 sm:flex sm:flex-wrap",
          className,
        )}
      >
        {themes.map((theme) => (
          <div key={theme.id} className="flex flex-col items-center gap-1.5">
            <Button
              variant={selected === theme.id ? "default" : "outline"}
              onClick={() => choose(theme.id)}
              className="h-20! w-20 overflow-hidden rounded-md p-1.5!"
            >
              <img src={theme.logo} className="rounded-md aspect-square" />
            </Button>
            <p className="text-sm font-medium">{theme.title}</p>
          </div>
        ))}
      </div>

      <AlertDialog
        open={pendingThemeId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingThemeId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace your custom theme?</AlertDialogTitle>
            <AlertDialogDescription>
              Choosing another base theme replaces your current visual settings
              and custom CSS. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingThemeId) apply(pendingThemeId);
                setPendingThemeId(null);
              }}
            >
              Replace theme
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
