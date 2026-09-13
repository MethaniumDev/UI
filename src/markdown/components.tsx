import { useEffect, useState, type ComponentProps } from "react";
import type { ExtraProps } from "react-markdown";

import { cn } from "../lib/utils";
import Emoji from "./emoji";

type MarkdownElementProps<Tag extends keyof React.JSX.IntrinsicElements> =
  ComponentProps<Tag> & ExtraProps;

const headingClassName =
  "group/markdown-heading relative mt-[1.75em] mb-[0.65em] scroll-mt-20 font-heading font-semibold leading-[1.2] text-balance text-foreground group-data-[variant=compact]/markdown:mt-[0.2rem] group-data-[variant=compact]/markdown:mb-[0.35rem] group-data-[variant=compact]/markdown:font-bold group-data-[variant=compact]/markdown:tracking-normal";

function MarkdownH1({
  node: _,
  className,
  ...props
}: MarkdownElementProps<"h1">) {
  return (
    <h1
      className={cn(
        headingClassName,
        "text-[2rem] tracking-[-0.035em] group-data-[variant=compact]/markdown:text-[1.65rem]",
        className,
      )}
      {...props}
    />
  );
}

function MarkdownH2({
  node: _,
  className,
  ...props
}: MarkdownElementProps<"h2">) {
  if (className?.includes("sr-only")) {
    return <h2 className={className} {...props} />;
  }

  return (
    <h2
      className={cn(
        headingClassName,
        "border-b-[length:var(--ui-border-width)] border-border pb-[0.35em] text-2xl tracking-[-0.025em] group-data-[variant=compact]/markdown:border-b-0 group-data-[variant=compact]/markdown:pb-0 group-data-[variant=compact]/markdown:text-[1.45rem]",
        className,
      )}
      {...props}
    />
  );
}

function MarkdownH3({
  node: _,
  className,
  ...props
}: MarkdownElementProps<"h3">) {
  return (
    <h3
      className={cn(
        headingClassName,
        "text-xl group-data-[variant=compact]/markdown:text-xl",
        className,
      )}
      {...props}
    />
  );
}

function MarkdownH4({
  node: _,
  className,
  ...props
}: MarkdownElementProps<"h4">) {
  return (
    <h4
      className={cn(
        headingClassName,
        "text-base group-data-[variant=compact]/markdown:text-[1.1rem]",
        className,
      )}
      {...props}
    />
  );
}

function MarkdownH5({
  node: _,
  className,
  ...props
}: MarkdownElementProps<"h5">) {
  return (
    <h5 className={cn(headingClassName, "text-base", className)} {...props} />
  );
}

function MarkdownH6({
  node: _,
  className,
  ...props
}: MarkdownElementProps<"h6">) {
  return (
    <h6
      className={cn(
        headingClassName,
        "text-base group-data-[variant=compact]/markdown:text-[0.95rem] group-data-[variant=compact]/markdown:opacity-90",
        className,
      )}
      {...props}
    />
  );
}

function MarkdownParagraph({
  node: _,
  className,
  ...props
}: MarkdownElementProps<"p">) {
  return (
    <p
      className={cn(
        "my-4 group-data-[variant=compact]/markdown:my-[0.45rem]",
        className,
      )}
      {...props}
    />
  );
}

function MarkdownLink({
  node: _,
  className,
  href,
  ...props
}: MarkdownElementProps<"a">) {
  const external = href ? /^(?:https?:)?\/\//i.test(href) : false;
  const headingAnchor = className?.includes("markdown-heading-anchor");
  const footnoteBackref = "data-footnote-backref" in props;

  return (
    <a
      {...props}
      className={cn(
        headingAnchor
          ? "ms-[0.4em] font-normal text-muted-foreground no-underline opacity-0 group-hover/markdown-heading:opacity-100 group-focus-within/markdown-heading:opacity-100"
          : "font-medium text-primary-foreground-alt underline decoration-primary-foreground-alt/45 underline-offset-[0.2em] hover:decoration-current",
        footnoteBackref && "ms-1",
        className,
      )}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    />
  );
}

function MarkdownBlockquote({
  node: _,
  className,
  ...props
}: MarkdownElementProps<"blockquote">) {
  return (
    <blockquote
      className={cn(
        "my-4 border-s-4 border-primary-foreground-alt px-4 py-[0.15rem] text-muted-foreground group-data-[variant=compact]/markdown:my-[0.45rem] group-data-[variant=compact]/markdown:border-s-0 group-data-[variant=compact]/markdown:ps-3 [&>:first-child]:mt-0 [&>:last-child]:mb-0",
        className,
      )}
      {...props}
    />
  );
}

function MarkdownUnorderedList({
  node: _,
  className,
  ...props
}: MarkdownElementProps<"ul">) {
  return (
    <ul
      className={cn(
        "my-4 list-disc ps-6 group-data-[variant=compact]/markdown:my-[0.3rem] group-data-[variant=compact]/markdown:ms-[1.2rem] group-data-[variant=compact]/markdown:ps-0 [&.contains-task-list]:list-none [&.contains-task-list]:ps-0",
        className,
      )}
      {...props}
    />
  );
}

function MarkdownOrderedList({
  node: _,
  className,
  ...props
}: MarkdownElementProps<"ol">) {
  return (
    <ol
      className={cn(
        "my-4 list-decimal ps-6 group-data-[variant=compact]/markdown:my-[0.3rem] group-data-[variant=compact]/markdown:ms-[1.2rem] group-data-[variant=compact]/markdown:ps-0",
        className,
      )}
      {...props}
    />
  );
}

function MarkdownListItem({
  node: _,
  className,
  ...props
}: MarkdownElementProps<"li">) {
  return (
    <li
      className={cn(
        "ps-1 group-data-[variant=compact]/markdown:my-[0.2rem] [&+li]:mt-[0.3rem] [&.task-list-item]:flex [&.task-list-item]:items-baseline [&.task-list-item]:gap-[0.55rem]",
        className,
      )}
      {...props}
    />
  );
}

function MarkdownInput({
  node: _,
  className,
  ...props
}: MarkdownElementProps<"input">) {
  return <input className={cn("accent-primary", className)} {...props} />;
}

function MarkdownImage({
  node,
  className,
  alt,
  ...props
}: MarkdownElementProps<"img">) {
  const emojiShortcode = node?.properties.dataEmoji;
  if (typeof emojiShortcode === "string") {
    return (
      <Emoji
        className="inline-block size-[1.15em] object-contain align-[-0.18em]"
        shortcode={emojiShortcode}
      />
    );
  }
  if (!props.src) return alt ? <span>{alt}</span> : null;

  return (
    <img
      {...props}
      className={cn(
        "my-5 h-auto max-w-full rounded-lg group-data-[variant=compact]/markdown:my-2",
        className,
      )}
      alt={alt ?? ""}
      loading="lazy"
      decoding="async"
    />
  );
}

function MarkdownHorizontalRule({
  node: _,
  className,
  ...props
}: MarkdownElementProps<"hr">) {
  return (
    <hr
      className={cn(
        "my-8 border-0 border-t-[length:var(--ui-border-width)] border-border group-data-[variant=compact]/markdown:my-[0.55rem]",
        className,
      )}
      {...props}
    />
  );
}

function MarkdownInlineCode({
  node: _,
  className,
  children,
  ...props
}: MarkdownElementProps<"code">) {
  const [copied, setCopied] = useState(false);
  const value = String(children ?? "");

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 1_200);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <code
      className={cn(
        "cursor-pointer rounded-sm border-[length:var(--ui-border-width)] border-border bg-muted px-[0.35em] py-[0.15em] font-mono text-[0.88em] outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      role="button"
      tabIndex={0}
      data-copied={copied || undefined}
      aria-label={copied ? `Copied ${value}` : `Copy ${value}`}
      onClick={() => void copy()}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        void copy();
      }}
      {...props}
    >
      {children}
    </code>
  );
}

function MarkdownTable({
  node: _,
  className,
  children,
  ...props
}: MarkdownElementProps<"table">) {
  return (
    <div
      data-slot="markdown-table-container"
      className="my-5 max-w-full overflow-x-auto rounded-lg border-[length:var(--ui-border-width)] border-border group-data-[variant=compact]/markdown:my-[0.45rem]"
    >
      <table
        className={cn("m-0 w-full border-collapse tabular-nums", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

function MarkdownTableBody({
  node: _,
  className,
  ...props
}: MarkdownElementProps<"tbody">) {
  return (
    <tbody
      className={cn("[&>tr:last-child>td]:border-b-0", className)}
      {...props}
    />
  );
}

function MarkdownTableHead({
  node: _,
  className,
  ...props
}: MarkdownElementProps<"th">) {
  return (
    <th
      className={cn(
        "border-b-[length:var(--ui-border-width)] border-border bg-muted px-[0.8rem] py-[0.6rem] text-start font-semibold whitespace-nowrap",
        className,
      )}
      {...props}
    />
  );
}

function MarkdownTableCell({
  node: _,
  className,
  ...props
}: MarkdownElementProps<"td">) {
  return (
    <td
      className={cn(
        "border-b-[length:var(--ui-border-width)] border-border px-[0.8rem] py-[0.6rem] text-start whitespace-nowrap",
        className,
      )}
      {...props}
    />
  );
}

function MarkdownSection({
  node: _,
  className,
  ...props
}: MarkdownElementProps<"section">) {
  return (
    <section
      className={cn(
        "[&.footnotes]:mt-8 [&.footnotes]:border-t-[length:var(--ui-border-width)] [&.footnotes]:border-border [&.footnotes]:pt-4 [&.footnotes]:text-sm [&.footnotes]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function MarkdownSpan({
  node: _,
  className,
  ...props
}: MarkdownElementProps<"span">) {
  return (
    <span
      className={cn(
        "[&.katex-display]:max-w-full [&.katex-display]:overflow-x-auto [&.katex-display]:overflow-y-hidden [&.katex-display]:py-2",
        className,
      )}
      {...props}
    />
  );
}

export {
  MarkdownBlockquote,
  MarkdownH1,
  MarkdownH2,
  MarkdownH3,
  MarkdownH4,
  MarkdownH5,
  MarkdownH6,
  MarkdownHorizontalRule,
  MarkdownImage,
  MarkdownInlineCode,
  MarkdownInput,
  MarkdownLink,
  MarkdownListItem,
  MarkdownOrderedList,
  MarkdownParagraph,
  MarkdownSection,
  MarkdownSpan,
  MarkdownTable,
  MarkdownTableBody,
  MarkdownTableCell,
  MarkdownTableHead,
  MarkdownUnorderedList,
};
