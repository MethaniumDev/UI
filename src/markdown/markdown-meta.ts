import type { Properties } from "hast";
import type { Root } from "mdast";
import { visit } from "unist-util-visit";

export type CodeMeta = {
  filename?: string;
  highlightedLines: Set<number>;
  showLineNumbers: boolean;
};

const FILENAME_PATTERN = /(?:^|\s)(?:title|filename)=(?:"([^"]*)"|'([^']*)')/;
const HIGHLIGHT_PATTERN = /(?:^|\s)\{([\d,\s-]+)\}(?=\s|$)/;

export function parseCodeMeta(meta?: string): CodeMeta {
  const filenameMatch = meta?.match(FILENAME_PATTERN);
  const highlightMatch = meta?.match(HIGHLIGHT_PATTERN);
  const highlightedLines = new Set<number>();

  for (const part of highlightMatch?.[1]?.split(",") ?? []) {
    const [startValue, endValue] = part.trim().split("-", 2);
    const start = Number(startValue);
    const end = endValue === undefined ? start : Number(endValue);
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1)
      continue;
    for (let line = start; line <= end && line <= 10_000; line += 1) {
      highlightedLines.add(line);
    }
  }

  return {
    filename: filenameMatch?.[1] ?? filenameMatch?.[2],
    highlightedLines,
    showLineNumbers: /(?:^|\s)showLineNumbers(?=\s|$)/.test(meta ?? ""),
  };
}

export function remarkCodeMeta() {
  return (tree: Root) => {
    visit(tree, "code", (node) => {
      if (!node.meta) return;
      const data = (node.data ??= {}) as typeof node.data & {
        hProperties?: Properties;
      };
      data.hProperties = {
        ...data.hProperties,
        dataMeta: node.meta,
      };
    });
  };
}
