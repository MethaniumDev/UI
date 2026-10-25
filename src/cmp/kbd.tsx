import { cn } from "../lib/utils";

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "pointer-events-none inline-flex h-6 w-fit min-w-6 shrink-0 items-center justify-center gap-1 rounded-md border border-foreground/15 border-b-3 bg-muted px-1.5 pb-px font-sans text-xs font-medium text-muted-foreground shadow-[inset_0_1px_0_color-mix(in_srgb,var(--foreground)_8%,transparent)] select-none in-data-[slot=tooltip-content]:border-background/25 in-data-[slot=tooltip-content]:bg-background/20 in-data-[slot=tooltip-content]:text-background dark:in-data-[slot=tooltip-content]:bg-background/10 [&_svg:not([class*='size-'])]:size-3",
        className,
      )}
      {...props}
    />
  );
}

function KbdGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  );
}

export { Kbd, KbdGroup };
