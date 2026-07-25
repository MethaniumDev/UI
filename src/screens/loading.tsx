import { useRef, useState, useEffect } from "react";
import CreateScreen, { StorageDestoryer } from "./util";

const DELAY = 250;

type ScreenProps = {
  title?: string;
  description?: string;
  fullscreen?: boolean;
} & (
  | { noProgress: true; progress?: never }
  | { noProgress?: false; progress: number }
);

/**
 * Executes Screen.
 * @param props Parameter props.
 * @returns unknown.
 */
export default function Screen(props: ScreenProps) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const displayProgressRef = useRef(0);

  useEffect(() => {
    displayProgressRef.current = displayProgress;
  }, [displayProgress]);

  useEffect(() => {
    if (props.noProgress) {
      return;
    }

    const target = props.progress;
    const start = displayProgressRef.current;
    const delta = target - start;

    if (delta === 0) {
      return;
    }

    const duration = DELAY;
    const startTime = performance.now();
    let frameId = 0;

    /**
     * Executes animate.
     * @param now Parameter now.
     * @returns unknown.
     */
    function animate(now: number) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayProgress(start + delta * eased);

      if (t < 1) {
        frameId = requestAnimationFrame(animate);
      }
    }

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [props.noProgress, props.progress]);

  return (
    <CreateScreen>
      <h2 className="text-base font-semibold text-foreground">
        {props.title ?? "Loading"}
      </h2>
      {props.description ? (
        <p className="text-sm text-muted-foreground mt-1 mb-5">
          {props.description}
        </p>
      ) : (
        <div className="mb-5" />
      )}
      <div
        className="w-64 h-1.5 bg-secondary rounded-full overflow-hidden relative"
        role={props.noProgress ? "status" : "progressbar"}
        aria-label="Loading"
        aria-valuemin={props.noProgress ? undefined : 0}
        aria-valuemax={props.noProgress ? undefined : 100}
        aria-valuenow={props.noProgress ? undefined : displayProgress}
      >
        {props.noProgress ? (
          <div className="loading-line-wobble h-full bg-primary rounded-full" />
        ) : (
          <div
            className="h-full bg-primary absolute left-0 top-0"
            style={{
              width: `${displayProgress}%`,
            }}
          />
        )}
      </div>
      <StorageDestoryer />
    </CreateScreen>
  );
}
