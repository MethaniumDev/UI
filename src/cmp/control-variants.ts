export const controlVariantClasses = {
  default:
    "bg-secondary! bg-none! text-secondary-foreground! shadow-none! hover:bg-secondary/80! focus-visible:bg-secondary/80! aria-expanded:bg-secondary/80!",
  outline:
    "bg-input/30! bg-none! text-foreground! shadow-none! hover:bg-input/50! focus-visible:bg-input/50! aria-expanded:bg-input/50!",
  secondary:
    "bg-muted! bg-none! text-foreground! shadow-none! hover:bg-muted/80! focus-visible:bg-muted/80! aria-expanded:bg-muted/80!",
  ghost:
    "bg-transparent! bg-none! shadow-none! hover:bg-muted! focus-visible:bg-muted! aria-expanded:bg-muted!",
  destructive:
    "bg-destructive! bg-none! text-black! shadow-none! hover:bg-destructive/80! focus-visible:bg-destructive/80!",
  warning:
    "bg-amber-500! bg-none! text-amber-950! shadow-none! hover:bg-amber-500/80! focus-visible:bg-amber-500/80!",
  link: "bg-transparent! bg-none! text-primary! shadow-none! underline-offset-4 hover:underline focus-visible:underline",
} as const;

export type ControlVariant = keyof typeof controlVariantClasses;
