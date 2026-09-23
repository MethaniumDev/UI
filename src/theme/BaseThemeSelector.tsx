import { useState } from "react";
import { Copy, Trash2 } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../cmp/select";
import { cn } from "../lib/utils";
import { useTheme } from "./Provider";
import type { Theme } from "./types";

export type ThemeSelectorProps = {
  className?: string;
};

function ThemeIcon({ theme }: { theme: Theme }) {
  return (
    <img
      src={theme.logo}
      alt=""
      className="size-5 shrink-0 rounded-sm bg-muted/40 object-contain"
    />
  );
}

function ThemeItem({ theme }: { theme: Theme }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <ThemeIcon theme={theme} />
      <span className="truncate">{theme.title}</span>
    </span>
  );
}

export function ThemeSelector({ className }: ThemeSelectorProps) {
  const {
    builtinThemes,
    customThemes,
    selectedTheme,
    selectedThemeId,
    selectTheme,
    duplicateTheme,
    deleteTheme,
    isBuiltinTheme,
  } = useTheme();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const pendingTheme = customThemes.find(
    (theme) => theme.id === pendingDeleteId,
  );

  return (
    <>
      <div
        className={cn("flex w-full flex-wrap items-center gap-2", className)}
      >
        <Select
          value={selectedThemeId}
          onValueChange={(value) => selectTheme(String(value))}
        >
          <SelectTrigger className="min-w-45 flex-1">
            <SelectValue>
              <ThemeItem theme={selectedTheme} />
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Presets</SelectLabel>
              {builtinThemes.map((theme) => (
                <SelectItem key={theme.id} value={theme.id}>
                  <ThemeItem theme={theme} />
                </SelectItem>
              ))}
            </SelectGroup>
            {customThemes.length > 0 && (
              <SelectGroup>
                <SelectLabel>Custom themes</SelectLabel>
                {customThemes.map((theme) => (
                  <SelectItem key={theme.id} value={theme.id}>
                    <ThemeItem theme={theme} />
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => duplicateTheme(selectedThemeId)}
        >
          <Copy data-icon="inline-start" />
          Duplicate
        </Button>
        <Button
          variant="destructive"
          disabled={isBuiltinTheme(selectedThemeId)}
          onClick={() => setPendingDeleteId(selectedThemeId)}
        >
          <Trash2 data-icon="inline-start" />
          Delete
        </Button>
      </div>

      <AlertDialog
        open={pendingTheme !== undefined}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pendingTheme?.title}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the theme with all its settings. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep theme</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (pendingDeleteId) deleteTheme(pendingDeleteId);
                setPendingDeleteId(null);
              }}
            >
              Delete theme
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
