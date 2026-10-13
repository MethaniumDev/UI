import {
  useRef,
  useSyncExternalStore,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { Excalidraw as ExcalidrawBase } from "@excalidraw/excalidraw";
import type {
  ExcalidrawImperativeAPI,
  ExcalidrawProps as ExcalidrawBaseProps,
} from "@excalidraw/excalidraw/types";
import "@excalidraw/excalidraw/index.css";
import "./excalidraw.css";

import { MathButton, findSelectedMathElement, type MathController } from "./math";

export type ExcalidrawProps = {
  initialData?: ExcalidrawBaseProps["initialData"];
  onChange?: ExcalidrawBaseProps["onChange"];
  theme?: ExcalidrawBaseProps["theme"];
  disableMath?: boolean;
  className?: string;
} & Omit<ExcalidrawBaseProps, "initialData" | "onChange" | "theme">;

function useRootTheme(): "light" | "dark" {
  return useSyncExternalStore(
    (onChange) => {
      const observer = new MutationObserver(onChange);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
      return () => observer.disconnect();
    },
    () => (document.documentElement.classList.contains("dark") ? "dark" : "light"),
    () => "light",
  );
}

export function Excalidraw({
  initialData,
  onChange,
  theme,
  disableMath = false,
  className,
  excalidrawAPI,
  renderTopRightUI,
  children,
  ...rest
}: ExcalidrawProps) {
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const mathRef = useRef<MathController | null>(null);
  const rootTheme = useRootTheme();

  // Capture phase: a formula double-click stops here so excalidraw's own
  // image handling (crop editor) does not kick in.
  const handleDoubleClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (disableMath || !(event.target instanceof HTMLCanvasElement)) return;
    const api = apiRef.current;
    if (!api) return;
    const selected = findSelectedMathElement(api);
    if (selected && typeof selected.customData?.math === "string") {
      event.stopPropagation();
      mathRef.current?.open(selected.customData.math);
    }
  };

  return (
    <div className={className} onDoubleClickCapture={handleDoubleClick}>
      <ExcalidrawBase
        {...rest}
        theme={theme ?? rootTheme}
        initialData={initialData}
        onChange={onChange}
        excalidrawAPI={(api) => {
          apiRef.current = api;
          excalidrawAPI?.(api);
        }}
        renderTopRightUI={
          disableMath
            ? renderTopRightUI
            : (isMobile, appState) => (
                <>
                  {renderTopRightUI?.(isMobile, appState)}
                  <MathButton apiRef={apiRef} controllerRef={mathRef} />
                </>
              )
        }
      >
        {children}
      </ExcalidrawBase>
    </div>
  );
}
