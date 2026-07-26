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
        role="group"
        aria-label="Parent theme"
        className={cn("flex flex-wrap gap-3", className)}
      >
        {themes.map((theme) => (
          <div
            key={theme.id}
            className="flex w-16 flex-col items-center gap-1.5"
          >
            <Button
              type="button"
              variant="outline"
              aria-label={theme.title}
              aria-pressed={selected === theme.id}
              onClick={() => choose(theme.id)}
              className={cn(
                "size-14 overflow-hidden rounded-md p-1.5",
                selected === theme.id &&
                  "border-primary ring-2 ring-primary/20 shadow-lg",
              )}
            >
              <img
                src={theme.logo}
                alt=""
                className="size-full object-contain"
              />
            </Button>
            <span className="font-heading text-xs font-semibold">
              {theme.title}
              {selected === theme.id && isThemeCustomized && (
                <span className="ml-1 font-normal text-muted-foreground">
                  Edited
                </span>
              )}
            </span>
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
              Choosing another parent theme replaces your current visual
              settings and custom CSS. This cannot be undone after leaving this
              page.
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
