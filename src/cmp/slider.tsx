import { useId, type ComponentProps, type ReactNode } from "react";
import { Slider as SliderPrimitive } from "@base-ui/react/slider";

import { cn } from "../lib/utils";
import { Label } from "./label";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderPrimitive.Root.Props) {
  const _values = Array.isArray(value)
    ? value
    : Array.isArray(defaultValue)
      ? defaultValue
      : [min, max];

  return (
    <SliderPrimitive.Root
      className={cn("data-horizontal:w-full data-vertical:h-full", className)}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative grow overflow-hidden rounded-full bg-muted select-none data-horizontal:h-1 data-horizontal:w-full data-vertical:h-full data-vertical:w-1"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="bg-primary select-none data-horizontal:h-full data-vertical:w-full"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className="relative block size-3 shrink-0 rounded-full border border-ring bg-white ring-ring/50 transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-3 active:ring-3 disabled:pointer-events-none disabled:opacity-50"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

function LabeledSlider({
  label,
  value,
  onValueChange,
  formatValue = String,
  ...props
}: Omit<
  ComponentProps<typeof Slider>,
  "defaultValue" | "value" | "onValueChange"
> & {
  label: ReactNode;
  value: number;
  onValueChange: (value: number) => void;
  formatValue?: (value: number) => ReactNode;
}) {
  const id = useId();

  return (
    <div className="grid gap-2 text-sm">
      <div className="flex justify-between gap-4">
        <Label htmlFor={id}>{label}</Label>
        <output htmlFor={id} className="text-xs text-muted-foreground">
          <code>{formatValue(value)}</code>
        </output>
      </div>
      <Slider
        {...props}
        id={id}
        value={[value]}
        onValueChange={(next) =>
          onValueChange(Array.isArray(next) ? (next[0] ?? value) : next)
        }
      />
    </div>
  );
}

export { LabeledSlider, Slider };
