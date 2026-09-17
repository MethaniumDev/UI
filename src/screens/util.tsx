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
