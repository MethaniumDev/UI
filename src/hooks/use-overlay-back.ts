import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { flushSync } from "react-dom";
import type { BaseUIChangeEventDetails } from "@base-ui/react/types";

type Overlay = {
  parent: Overlay | null;
  close: () => void;
  order: number;
};

export const OverlayContext = createContext<Overlay | null>(null);
const overlays = new Set<Overlay>();
let nextOrder = 0;

// Native hosts dispatch a cancelable `nonanium:back` event. A blocked close
// consumes back too, so navigation cannot bypass a non-dismissible overlay.
function handleBack(event: Event) {
  let top: Overlay | undefined;
  for (const overlay of overlays) {
    if (!top || overlay.order > top.order) top = overlay;
  }
  if (!top) return;

  let descendant: Overlay | undefined;
  do {
    descendant = undefined;
    for (const overlay of overlays) {
      let parent = overlay.parent;
      while (parent && parent !== top) parent = parent.parent;
      if (parent && (!descendant || overlay.order > descendant.order)) {
        descendant = overlay;
      }
    }
    if (descendant) top = descendant;
  } while (descendant);

  event.preventDefault();
  const active = top;
  flushSync(() => active.close());
  if (event instanceof CustomEvent && event.detail) {
    event.detail.result = overlays.has(active) ? "blocked" : "dismissed";
  }
}

export function useOverlayBack(open: boolean, close: () => void) {
  const parent = useContext(OverlayContext);
  const [overlay] = useState<Overlay>(() => ({ parent, close, order: 0 }));
  useLayoutEffect(() => {
    overlay.close = close;
    overlay.parent = parent;
  });
  useLayoutEffect(() => {
    if (!open) return;
    overlay.order = ++nextOrder;
    overlays.add(overlay);
    if (overlays.size === 1)
      window.addEventListener("nonanium:back", handleBack);
    return () => {
      overlays.delete(overlay);
      if (overlays.size === 0)
        window.removeEventListener("nonanium:back", handleBack);
    };
  }, [open, overlay]);
  return overlay;
}

export function useOverlayRoot<
  Details extends { isCanceled: boolean },
  Actions extends { close: () => void },
>(props: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, details: Details) => void;
  actionsRef?: RefObject<Actions | null>;
}) {
  const [open, setOpen] = useState(props.defaultOpen ?? false);
  const ownActions = useRef<Actions>(null);
  const actionsRef = props.actionsRef ?? ownActions;
  const overlay = useOverlayBack(props.open ?? open, () =>
    actionsRef.current?.close(),
  );
  return {
    overlay,
    actionsRef,
    onOpenChange(next: boolean, details: Details) {
      props.onOpenChange?.(next, details);
      if (!details.isCanceled) setOpen(next);
    },
  };
}

// Select and Combobox expose controlled open state, but no imperative close action.
export function useListboxBack(props: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (
    open: boolean,
    details: BaseUIChangeEventDetails<"none">,
  ) => void;
}) {
  const [internalOpen, setOpen] = useState(props.defaultOpen ?? false);
  const open = props.open ?? internalOpen;
  const overlay = useOverlayBack(open, () => {
    const event = new Event("nonanium:back", { cancelable: true });
    let propagationAllowed = false;
    const details: BaseUIChangeEventDetails<"none"> = {
      reason: "none",
      event,
      trigger: undefined,
      cancel: () => event.preventDefault(),
      allowPropagation: () => {
        propagationAllowed = true;
      },
      get isCanceled() {
        return event.defaultPrevented;
      },
      get isPropagationAllowed() {
        return propagationAllowed;
      },
    };
    props.onOpenChange?.(false, details);
    if (!details.isCanceled) setOpen(false);
  });
  return { overlay, open, setOpen };
}
