import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Check, Copy } from "lucide-react";
import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";

import { Button } from "../cmp/button";
import { cn } from "../lib/utils";
import {
  highlightCode,
  highlightedLineClassNames,
  isSupportedLanguage,
  shikiLineClassNames,
  shikiPreClassName,
} from "./shiki";

type CodeBlockProps = {
  code: string;
  filename?: string;
  highlightedLines: ReadonlySet<number>;
  language?: string;
  showLineNumbers?: boolean;
};

function CodeBlock({
  code,
  filename,
  highlightedLines,
  language,
  showLineNumbers = true,
}: CodeBlockProps) {
  const [highlighted, setHighlighted] = useState<ReactNode>(null);
  const [copied, setCopied] = useState(false);
  const supported = isSupportedLanguage(language);
  const highlightedLineKey = [...highlightedLines]
    .sort((left, right) => left - right)
    .join(",");

  useLayoutEffect(() => {
    let active = true;
    setHighlighted(null);
    if (!language || !supported) return () => void (active = false);

    const lines = new Set(
      highlightedLineKey.split(",").filter(Boolean).map(Number),
    );
    void highlightCode(code, language, lines).then((tree) => {
      if (!active || !tree) return;
      const rendered = toJsxRuntime(tree, { Fragment, jsx, jsxs });
      setHighlighted(rendered);
    });
    return () => void (active = false);
  }, [code, highlightedLineKey, language, supported]);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2_000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <figure
      data-slot="code-block"
      data-line-numbers={showLineNumbers || undefined}
      data-language={language || undefined}
      className="group/code-block overflow-hidden rounded-lg border-[length:var(--ui-border-width)] border-border bg-[var(--markdown-code-background)] group-data-[variant=compact]/markdown:my-[0.45rem]"
    >
      <figcaption
        data-slot="code-block-header"
        className="flex items-center gap-2 ps-[0.6rem] px-0.5 font-mono text-xs text-muted-foreground"
      >
        <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
          {filename ?? language ?? "Plain text"}
        </span>
        {!supported && language ? (
          <span
            data-slot="code-block-language-note"
            className="ms-auto font-sans"
          >
            Plain text
          </span>
        ) : null}
        <Button
          variant="ghost"
          size="icon-xs"
          className={cn(
            "ms-auto h-[22.2px]!",
            !supported && language && "ms-0",
          )}
          onClick={copyCode}
        >
          {copied ? (
            <Check className="size-3" aria-hidden="true" />
          ) : (
            <Copy className="size-3" aria-hidden="true" />
          )}
        </Button>
        <span className="sr-only" aria-live="polite">
          {copied ? "Code copied to clipboard" : ""}
        </span>
      </figcaption>
      <div
        data-slot="code-block-content"
        className="max-w-full overflow-x-auto pb-2"
      >
        {highlighted ?? (
          <pre
            className={cn(shikiPreClassName, !supported && "is-plain-text")}
            tabIndex={0}
          >
            <code>
              {code.split("\n").map((line, index, lines) => (
                <Fragment key={index}>
                  <span
                    className={cn(
                      shikiLineClassNames,
                      highlightedLines.has(index + 1) &&
                        highlightedLineClassNames,
                    )}
                    data-line={index + 1}
                  >
                    {line}
                  </span>
                  {index < lines.length - 1 ? "\n" : null}
                </Fragment>
              ))}
            </code>
          </pre>
        )}
      </div>
    </figure>
  );
}

export { CodeBlock, type CodeBlockProps };
