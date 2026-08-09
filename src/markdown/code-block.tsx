import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Check, Copy } from "lucide-react";
import { startTransition, useEffect, useState, type ReactNode } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";

import { Button } from "../cmp/button";
import { cn } from "../lib/utils";
import { highlightCode, isSupportedLanguage, shikiPreClassName } from "./shiki";

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
  showLineNumbers = false,
}: CodeBlockProps) {
  const [highlighted, setHighlighted] = useState<ReactNode>(null);
  const [copied, setCopied] = useState(false);
  const supported = isSupportedLanguage(language);
  const highlightedLineKey = [...highlightedLines]
    .sort((left, right) => left - right)
    .join(",");

  useEffect(() => {
    let active = true;
    setHighlighted(null);
    if (!language || !supported) return () => void (active = false);

    const lines = new Set(
      highlightedLineKey.split(",").filter(Boolean).map(Number),
    );
    void highlightCode(code, language, lines).then((tree) => {
      if (!active || !tree) return;
      const rendered = toJsxRuntime(tree, { Fragment, jsx, jsxs });
      startTransition(() => setHighlighted(rendered));
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
      className="group/code-block my-4 overflow-hidden rounded-lg border-[length:var(--ui-border-width)] border-border bg-[var(--markdown-code-background)] group-data-[variant=compact]/markdown:my-[0.45rem]"
    >
      <figcaption
        data-slot="code-block-header"
        className="flex min-h-9 items-center gap-2 border-b-[length:var(--ui-border-width)] border-border px-2 py-[0.3rem] ps-[0.8rem] font-mono text-xs text-muted-foreground group-data-[variant=compact]/markdown:hidden"
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
          type="button"
          variant="ghost"
          size="icon-xs"
          data-slot="code-block-copy"
          className={cn("ms-auto", !supported && language && "ms-0")}
          aria-label={copied ? "Code copied" : "Copy code"}
          onClick={copyCode}
        >
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        </Button>
        <span className="sr-only" aria-live="polite">
          {copied ? "Code copied to clipboard" : ""}
        </span>
      </figcaption>
      <div
        data-slot="code-block-content"
        className="max-w-full overflow-x-auto"
      >
        {highlighted ?? (
          <pre
            className={cn(shikiPreClassName, !supported && "is-plain-text")}
            tabIndex={0}
          >
            <code>{code}</code>
          </pre>
        )}
      </div>
    </figure>
  );
}

export { CodeBlock, type CodeBlockProps };
