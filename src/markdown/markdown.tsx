import type { Element, ElementContent } from "hast";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import type { ComponentProps } from "react";

import { cn } from "../lib/utils";
import { CodeBlock } from "./code-block";
import {
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
} from "./components";
import { EmojiProvider, useEmojiRegistry } from "./emoji-context";
import type { EmojiRegistry } from "./emoji-data";
import { parseCodeMeta, remarkCodeMeta } from "./markdown-meta";
import { remarkEmoji } from "./remark-emoji";

export type MarkdownTheme = "light" | "dark";
export type MarkdownVariant = "article" | "compact";
export type MarkdownComponents = Components;
export type MarkdownProps = Omit<ComponentProps<"div">, "children"> & {
  content: string;
  components?: Partial<MarkdownComponents>;
  registry?: EmojiRegistry;
  theme?: MarkdownTheme;
  variant?: MarkdownVariant;
};

const rehypePlugins: NonNullable<
  ComponentProps<typeof ReactMarkdown>["rehypePlugins"]
> = [
  [rehypeKatex, { output: "htmlAndMathml", strict: "warn", trust: false }],
  rehypeSlug,
  [
    rehypeAutolinkHeadings,
    {
      behavior: "append",
      properties: {
        className: ["markdown-heading-anchor"],
        ariaLabel: "Link to this heading",
      },
      content: { type: "text", value: "#" },
    },
  ],
];

function textContent(node: ElementContent): string {
  if (node.type === "text") return node.value;
  if (node.type !== "element") return "";
  return node.children.map(textContent).join("");
}

function classNames(node: Element) {
  const value = node.properties.className;
  if (Array.isArray(value)) return value.map(String);
  return value ? [String(value)] : [];
}

const defaultComponents: Components = {
  a: MarkdownLink,
  blockquote: MarkdownBlockquote,
  code: MarkdownInlineCode,
  h1: MarkdownH1,
  h2: MarkdownH2,
  h3: MarkdownH3,
  h4: MarkdownH4,
  h5: MarkdownH5,
  h6: MarkdownH6,
  hr: MarkdownHorizontalRule,
  img: MarkdownImage,
  input: MarkdownInput,
  li: MarkdownListItem,
  ol: MarkdownOrderedList,
  p: MarkdownParagraph,
  section: MarkdownSection,
  span: MarkdownSpan,
  table: MarkdownTable,
  tbody: MarkdownTableBody,
  td: MarkdownTableCell,
  th: MarkdownTableHead,
  ul: MarkdownUnorderedList,
  pre({ node, children, ...props }) {
    const codeNode = node?.children.find(
      (child): child is Element =>
        child.type === "element" && child.tagName === "code",
    );
    if (!codeNode) return <pre {...props}>{children}</pre>;

    const languageClass = classNames(codeNode).find((name) =>
      name.startsWith("language-"),
    );
    const language = languageClass?.slice("language-".length);
    const rawCode = codeNode.children.map(textContent).join("");
    const code = rawCode.endsWith("\n") ? rawCode.slice(0, -1) : rawCode;
    const meta = parseCodeMeta(String(codeNode.properties.dataMeta ?? ""));

    return (
      <CodeBlock
        code={code}
        language={language}
        filename={meta.filename}
        highlightedLines={meta.highlightedLines}
        showLineNumbers={meta.showLineNumbers}
      />
    );
  },
};

function Markdown({
  content,
  className,
  components,
  registry: registryOverride,
  theme,
  variant = "article",
  ...props
}: MarkdownProps) {
  const registry = useEmojiRegistry(registryOverride);
  const remarkPlugins: NonNullable<
    ComponentProps<typeof ReactMarkdown>["remarkPlugins"]
  > = [
    remarkGfm,
    remarkMath,
    remarkBreaks,
    remarkCodeMeta,
    [remarkEmoji, { registry }],
  ];

  return (
    <EmojiProvider registry={registry}>
      <div
        {...props}
        data-slot="markdown"
        data-code-theme={theme}
        data-variant={variant}
        className={cn(
          "group/markdown text-[0.9375rem]/[1.75] text-foreground [&>:first-child]:mt-0 [&>:last-child]:mb-0",
          variant === "compact" && "text-base/[1.65]",
          className,
        )}
      >
        <ReactMarkdown
          skipHtml
          remarkPlugins={remarkPlugins}
          rehypePlugins={rehypePlugins}
          components={{ ...defaultComponents, ...components }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </EmojiProvider>
  );
}

export { Markdown };
