import {
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

export type CreateExcalidrawButtonOptions = {
  icon?: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
};

/**
 * A button styled to match excalidraw's island buttons. Without `children` it
 * is a plain click button; with `children` it toggles a popover panel that is
 * closed by outside clicks and Escape.
 *
 * Place the result via the `renderTopRightUI` prop or as `Excalidraw`
 * children, closing over the excalidraw API yourself.
 */
export function createExcalidrawButton(
  options: CreateExcalidrawButtonOptions,
): ReactElement {
  return <ExcalidrawButton {...options} />;
}

function ExcalidrawButton({
  icon,
  label,
  active = false,
  onClick,
  open: controlledOpen,
  onOpenChange,
  children,
}: CreateExcalidrawButtonOptions) {
  const [innerOpen, setInnerOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const open = controlledOpen ?? innerOpen;
  const setOpen = onOpenChange ?? setInnerOpen;

  useEffect(() => {
    if (!open || !children) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, children, setOpen]);

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <button
        type="button"
        className="nonanium-excalidraw-button"
        data-active={active || open ? "true" : undefined}
        aria-label={label}
        title={label}
        onClick={children ? () => setOpen(!open) : onClick}
      >
        {icon ?? label}
      </button>
      {children && open ? (
        <div className="nonanium-excalidraw-popover">{children}</div>
      ) : null}
    </div>
  );
}
