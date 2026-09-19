import type { CSSProperties, PointerEvent } from "react";

import { cn } from "../lib/utils";

function normalizeHue(value: number) {
  return ((value % 360) + 360) % 360;
}

export function HuePicker({
  value,
  onValueChange,
  color = `hsl(${value} 80% 50%)`,
  className,
  style,
  ...props
}: Omit<React.ComponentProps<"div">, "onChange"> & {
  value: number;
  onValueChange(value: number): void;
  color?: string;
}) {
  const hue = normalizeHue(value);
  const angle = (hue * Math.PI) / 180;

  function updateHue(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    onValueChange(normalizeHue((Math.atan2(y, x) * 180) / Math.PI));
  }

  return (
    <div
      aria-label="Hue"
      aria-valuemax={359}
      aria-valuemin={0}
      aria-valuenow={Math.round(hue)}
      aria-valuetext={`${Math.round(hue)} degrees`}
      className={cn(
        "relative aspect-square w-full touch-none rounded-full outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring)",
        className,
      )}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowDown")
          onValueChange(normalizeHue(hue - 2));
        else if (event.key === "ArrowRight" || event.key === "ArrowUp")
          onValueChange(normalizeHue(hue + 2));
        else if (event.key === "Home") onValueChange(0);
        else if (event.key === "End") onValueChange(359);
        else return;
        event.preventDefault();
      }}
      onPointerDown={(event) => {
        updateHue(event);
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId))
          updateHue(event);
      }}
      role="slider"
      style={
        {
          background:
            "radial-gradient(circle,color-mix(in srgb,var(--foreground) 20%,transparent) 1px,transparent 1.25px),conic-gradient(from 90deg,hsl(0 85% 52%),hsl(60 85% 52%),hsl(120 85% 46%),hsl(180 85% 46%),hsl(240 85% 56%),hsl(300 85% 54%),hsl(360 85% 52%))",
          backgroundSize: "8px 8px,auto",
          boxShadow: "inset 0 5px 10px rgb(0 0 0/.22)",
          ...style,
        } as CSSProperties
      }
      tabIndex={0}
      {...props}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-background transition-[left,top,background-color] motion-reduce:transition-none"
        style={{
          background: color,
          boxShadow: "0 0 0 2px var(--ring),0 4px 8px -1px rgb(0 0 0/.28)",
          left: `${50 + Math.cos(angle) * 41}%`,
          top: `${50 + Math.sin(angle) * 41}%`,
        }}
      />
    </div>
  );
}
