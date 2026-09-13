import type { ReactNode } from "react";

import { cn } from "../lib/utils";

function SpecialSwitch<Value extends string>({
  className,
  value,
  onValueChange,
  options,
}: {
  className?: string;
  value: Value;
  onValueChange: (value: Value) => void;
  options: readonly [
    { value: Value; label: ReactNode },
    { value: Value; label: ReactNode },
  ];
}) {
  const selectedIndex = options.findIndex((option) => option.value === value);

  return (
    <div
      data-slot="special-switch"
      role="tablist"
      className={cn(
        "relative grid grid-cols-2 rounded-4xl border-0! bg-card bg-none! p-1 select-none",
        className,
      )}
    >
      <div
        data-slot="special-switch-indicator"
        className="absolute top-1 bottom-1 rounded-4xl bg-input shadow-sm transition-all"
        style={{
          left: selectedIndex === 1 ? "50%" : "0.25rem",
          width: "calc(50% - 0.25rem)",
        }}
      />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          className="relative z-10 w-full cursor-pointer rounded-4xl px-2.5 py-1.5 text-center text-sm font-medium transition-colors aria-selected:text-foreground not-aria-selected:text-foreground/50 not-aria-selected:hover:text-foreground"
          onClick={() => onValueChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export { SpecialSwitch };
