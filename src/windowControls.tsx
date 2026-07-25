import { Maximize, Minus, X } from "lucide-react";
import { Button, buttonVariants } from "./cmp/button";

import { cn } from "./lib/utils";

export default function Controls({
  className,
  notPresentClassName,
}: {
  className?: string;
  notPresentClassName?: string;
}) {
  // @ts-expect-error variable only available in electron
  const actuallyShow = window.tensaminShowWindowControls ?? false;
  if (!actuallyShow || false) return <div className={notPresentClassName} />;

  // @ts-expect-error functions only available in electron
  const minimize = window.tensaminDesktop.window.minimize();
  // @ts-expect-error functions only available in electron
  const maximize = window.tensaminDesktop.window.maximize();
  // @ts-expect-error functions only available in electron
  const close = window.tensaminDesktop.window.close();

  return (
    <div
      className={cn(
        buttonVariants({ variant: "outline" })
          .replace("px-2.5", "px-0.5")
          .replace("gap-1.5", "gap-0.5"),
        "flex flex-row h-9",
        className,
      )}
    >
      <>
        <Button
          variant="ghost"
          className="w-9 h-9 aspect-square rounded-lg"
          onClick={() => minimize()}
        >
          <Minus />
        </Button>
        <Button
          variant="ghost"
          className="w-9 h-9 aspect-square rounded-lg"
          onClick={() => maximize()}
        >
          <Maximize />
        </Button>
        <Button
          variant="ghost"
          className="w-9 h-9 aspect-square rounded-lg"
          onClick={() => close()}
        >
          <X />
        </Button>
      </>
    </div>
  );
}
