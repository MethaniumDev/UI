import * as React from "react";

const properties = [
  "--ui-safe-area-top",
  "--ui-safe-area-right",
  "--ui-safe-area-bottom",
  "--ui-safe-area-left",
] as const;

function getSnapshot() {
  const styles = getComputedStyle(document.documentElement);
  return properties
    .map((property) => styles.getPropertyValue(property))
    .join(",");
}

function subscribe(onChange: () => void) {
  window.addEventListener("resize", onChange);
  window.addEventListener("orientationchange", onChange);
  window.visualViewport?.addEventListener("resize", onChange);

  return () => {
    window.removeEventListener("resize", onChange);
    window.removeEventListener("orientationchange", onChange);
    window.visualViewport?.removeEventListener("resize", onChange);
  };
}

export function useSafeAreaCollisionPadding() {
  const snapshot = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => "0,0,0,0",
  );
  const [top, right, bottom, left] = snapshot
    .split(",")
    .map((value) => Math.max(5, Number.parseFloat(value) || 0));

  return { top, right, bottom, left };
}
