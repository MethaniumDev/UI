import { cn } from "../lib/utils";
import Controls from "../windowControls";

export default function CreateScreen({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-background flex h-dvh w-screen flex-col items-center justify-center pt-[var(--ui-safe-area-top)] pr-[var(--ui-safe-area-right)] pb-[var(--ui-safe-area-bottom)] pl-[var(--ui-safe-area-left)]",
        className,
      )}
      data-tauri-drag-region
    >
      <>
        <Controls className="fixed top-[max(0.4375rem,var(--ui-safe-area-top))] right-[max(0.475rem,var(--ui-safe-area-right))] ring-foreground/15" />
        {children}
      </>
    </div>
  );
}

import { Button } from "../cmp/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../cmp/alert-dialog";
import { useIsMobile } from "../lib/utils";

export function ClearStorageButton({ className }: { className?: string }) {
  const isMobile = useIsMobile();
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant="destructive"
            className={cn(isMobile ? "w-full" : "", className)}
          >
            Clear storage
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to clear storage?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. It will clear all your settings and
            credentials.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={async () => {
              localStorage.clear();
              for (const db of await indexedDB.databases()) {
                indexedDB.deleteDatabase(db.name!);
              }
              location.reload();
            }}
          >
            Continue
          </AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function StorageDestoryer() {
  const isMobile = useIsMobile();
  return (
    <div
      className={cn(
        "fixed bottom-0 p-5 pr-[max(1.25rem,var(--ui-safe-area-right))] pb-[max(1.25rem,var(--ui-safe-area-bottom))] pl-[max(1.25rem,var(--ui-safe-area-left))]",
        isMobile ? "w-full" : "right-0",
      )}
    >
      <ClearStorageButton />
    </div>
  );
}
