import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";

import CreateScreen from "../screens/util";
import { Button } from "./button";

interface OnboardingStep {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  logo?: ReactNode;
  content: ReactNode;
  defaultCanContinue?: boolean;
}

interface OnboardingStepControls {
  canContinue: boolean;
  onContinue?: () => boolean | void | Promise<boolean | void>;
}

const ConfigureStepContext = createContext<
  ((controls: OnboardingStepControls) => void) | undefined
>(undefined);

function useOnboardingStep(controls: OnboardingStepControls) {
  const configure = useContext(ConfigureStepContext);
  const { canContinue, onContinue } = controls;

  if (!configure) {
    throw new Error("useOnboardingStep must be used inside OnboardingFlow");
  }

  useLayoutEffect(() => {
    configure({ canContinue, onContinue });
  }, [canContinue, configure, onContinue]);
}

function defaultControls(step: OnboardingStep): OnboardingStepControls {
  return { canContinue: step.defaultCanContinue ?? true };
}

function OnboardingFlow({
  steps,
  onFinish,
}: {
  steps: OnboardingStep[];
  onFinish: () => void | Promise<void>;
}) {
  if (steps.length === 0) {
    throw new Error("OnboardingFlow requires at least one step");
  }
  const [stepIndex, setStepIndex] = useState(0);
  const [controls, setControls] = useState<OnboardingStepControls>(() =>
    defaultControls(steps[0]),
  );
  const [pending, setPending] = useState(false);
  const activeStep = steps[stepIndex];

  const configure = useCallback((next: OnboardingStepControls) => {
    setControls(next);
  }, []);

  const showStep = useCallback(
    (nextIndex: number) => {
      setControls(defaultControls(steps[nextIndex]));
      setStepIndex(nextIndex);
    },
    [steps],
  );

  const advance = useCallback(async () => {
    if (!controls.canContinue || pending) return;

    setPending(true);
    try {
      const result = await controls.onContinue?.();
      if (result === false) return;

      if (stepIndex === steps.length - 1) {
        await onFinish();
      } else {
        showStep(stepIndex + 1);
      }
    } finally {
      setPending(false);
    }
  }, [controls, onFinish, pending, showStep, stepIndex, steps.length]);

  return (
    <CreateScreen className="h-full w-full items-stretch justify-stretch">
      <div className="flex h-full min-h-0 w-full flex-col">
        <main
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
          data-onboarding-step={activeStep.id}
        >
          <header className="mx-auto flex w-full max-w-6xl items-start gap-4 px-6 pt-12 pb-7 md:px-10 md:pt-16">
            {activeStep.logo}
            <div className="min-w-0 flex-1">
              <h1
                data-onboarding-title
                className="font-heading text-3xl font-bold md:text-4xl"
              >
                {activeStep.title}
              </h1>
              {activeStep.description && (
                <div className="mt-2 text-lg text-muted-foreground">
                  {activeStep.description}
                </div>
              )}
            </div>
          </header>
          <ConfigureStepContext.Provider value={configure}>
            <div className="mx-auto w-full max-w-6xl px-6 pb-12 md:px-10">
              {activeStep.content}
            </div>
          </ConfigureStepContext.Provider>
        </main>

        <footer className="shrink-0 px-6 pt-4 pb-6 md:px-10">
          <div className="flex justify-center md:justify-end">
            <Button
              size="lg"
              className="w-full md:w-auto"
              disabled={!controls.canContinue || pending}
              onClick={() => void advance()}
            >
              Continue
            </Button>
          </div>

          <nav
            className="mt-4 hidden items-center justify-center gap-2 md:flex"
            aria-label="Onboarding steps"
          >
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Previous onboarding step"
              disabled={stepIndex === 0 || pending}
              onClick={() => showStep(stepIndex - 1)}
            >
              <ChevronLeft />
            </Button>
            <span className="min-w-12 text-center text-sm" aria-live="polite">
              {stepIndex + 1}/{steps.length}
            </span>
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Next onboarding step"
              disabled={!controls.canContinue || pending}
              onClick={() => void advance()}
            >
              <ChevronRight />
            </Button>
          </nav>
        </footer>
      </div>
    </CreateScreen>
  );
}

export {
  OnboardingFlow,
  useOnboardingStep,
  type OnboardingStep,
  type OnboardingStepControls,
};
