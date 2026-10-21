import { GlobeOff } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "../cmp/button";
import { cn } from "../lib/utils";
import Link from "../link";
import CreateScreen from "./util";

/** Shared error layout with optional recovery actions and a service status link. */
export default function ErrorScreen({
  error,
  description,
  icon = <GlobeOff size={80} />,
  onRetry,
  retryLabel = "Retry",
  actions,
  statusLink = {
    label: "status.nonanium.net",
    link: "https://status.nonanium.net",
  },
  fullScreen = true,
  className,
}: {
  error: string;
  description?: ReactNode;
  icon?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  actions?: ReactNode;
  statusLink?: false | { label: string; link: string };
  fullScreen?: boolean;
  className?: string;
}) {
  const content = (
    <div className="my-auto flex w-full min-w-0 shrink-0 flex-col items-center gap-10 px-5 py-8 text-center">
      <div aria-hidden="true" className="shrink-0">
        {icon}
      </div>
      <div className="flex w-full max-w-lg flex-col gap-3 wrap-break-word">
        <h1 className="text-xl font-semibold text-foreground">{error}</h1>
        {description && (
          <p className="text-base text-muted-foreground">{description}</p>
        )}
      </div>
      {(onRetry || actions) && (
        <div className="flex w-full max-w-xs flex-col gap-2 sm:flex-row sm:justify-center sm:[&>*]:flex-1">
          {onRetry && <Button onClick={onRetry}>{retryLabel}</Button>}
          {actions}
        </div>
      )}
      {statusLink && <Link {...statusLink} />}
    </div>
  );

  return fullScreen ? (
    <CreateScreen className={cn("justify-start overflow-y-auto", className)}>
      {content}
    </CreateScreen>
  ) : (
    <div
      className={cn(
        "flex min-h-0 w-full flex-1 items-center justify-center",
        className,
      )}
    >
      {content}
    </div>
  );
}
