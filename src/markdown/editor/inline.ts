import type { EditorState, Range, SelectionRange } from "@codemirror/state";
import {
  Decoration,
  ViewPlugin,
  type DecorationSet,
  type EditorView,
  type ViewUpdate,
} from "@codemirror/view";

import { cn } from "../../lib/utils";
import { fencedCodeRanges } from "./code-block";
import { overlapsRange } from "./shared";

type InlineDecorationRange = { from: number; to: number; className: string };
type InlineTokenRange = {
  activeClassName?: string;
  from: number;
  revealFrom: number;
  revealTo: number;
  to: number;
};

const INLINE_TOKEN_REGEX =
  /!\[([^\]]*)\]\(([^)\s]+(?:\s+"[^"]*")?)\)|\[([^\]]+)\]\(([^)\s]+(?:\s+"[^"]*")?)\)|`([^`\n]+)`|~~([^~\n]+)~~|\*\*([^*\n]+)\*\*|__([^_\n]+)__|\*([^*\n]+)\*|(?<![a-zA-Z0-9:])_([^_\n]+)_(?![a-zA-Z0-9:])/g;

function collectInlineRanges(
  input: string,
  offset = 0,
): {
  styleRanges: InlineDecorationRange[];
  tokenRanges: InlineTokenRange[];
} {
  const styleRanges: InlineDecorationRange[] = [];
  const tokenRanges: InlineTokenRange[] = [];
  let match = INLINE_TOKEN_REGEX.exec(input);

  while (match) {
    const raw = match[0];
    const start = offset + match.index;
    const end = start + raw.length;
    const token = (
      from: number,
      to: number,
      activeClassName?: string,
    ): InlineTokenRange => ({
      activeClassName,
      from,
      revealFrom: start,
      revealTo: end,
      to,
    });

    if (match[1] !== undefined && match[2] !== undefined) {
      const imageEnd = start + 2 + match[1].length;
      tokenRanges.push(token(start, start + 2), token(imageEnd, end));
    } else if (match[3] !== undefined && match[4] !== undefined) {
      const labelStart = start + 1;
      const labelEnd = labelStart + match[3].length;
      tokenRanges.push(token(start, start + 1), token(labelEnd, end));
      styleRanges.push({
        from: labelStart,
        to: labelEnd,
        className: "tm-md-link",
      });
    } else if (match[5] !== undefined) {
      if (!match[5].trim()) {
        match = INLINE_TOKEN_REGEX.exec(input);
        continue;
      }
      tokenRanges.push(
        token(start, start + 1, "tm-md-code-active"),
        token(end - 1, end, "tm-md-code-active"),
      );
      styleRanges.push({
        from: start + 1,
        to: end - 1,
        className: "tm-md-code",
      });
    } else if (match[6] !== undefined) {
      if (!match[6].trim()) {
        match = INLINE_TOKEN_REGEX.exec(input);
        continue;
      }
      tokenRanges.push(token(start, start + 2), token(end - 2, end));
      styleRanges.push({
        from: start + 2,
        to: end - 2,
        className: "tm-md-del",
      });
    } else if (match[7] !== undefined || match[8] !== undefined) {
      if (!(match[7] ?? match[8] ?? "").trim()) {
        match = INLINE_TOKEN_REGEX.exec(input);
        continue;
      }
      tokenRanges.push(token(start, start + 2), token(end - 2, end));
      styleRanges.push({
        from: start + 2,
        to: end - 2,
        className: "tm-md-strong",
      });
    } else if (match[9] !== undefined || match[10] !== undefined) {
      if (!(match[9] ?? match[10] ?? "").trim()) {
        match = INLINE_TOKEN_REGEX.exec(input);
        continue;
      }
      tokenRanges.push(token(start, start + 1), token(end - 1, end));
      styleRanges.push({
        from: start + 1,
        to: end - 1,
        className: "tm-md-em",
      });
    }

    match = INLINE_TOKEN_REGEX.exec(input);
  }

  INLINE_TOKEN_REGEX.lastIndex = 0;
  return { styleRanges, tokenRanges };
}

const hiddenTokenDecoration = Decoration.replace({ inclusive: false });
export const markerDecoration = Decoration.mark({ class: "tm-md-marker" });
const headingMarkerDecorations = Array.from({ length: 6 }, (_, index) =>
  Decoration.mark({
    class: `tm-md-marker tm-md-heading tm-md-h${index + 1}`,
  }),
);
const strongDecoration = Decoration.mark({ class: "tm-md-strong" });
const emDecoration = Decoration.mark({ class: "tm-md-em" });
const delDecoration = Decoration.mark({ class: "tm-md-del" });
const codeDecoration = Decoration.mark({ class: "tm-md-code" });
const linkDecoration = Decoration.mark({ class: "tm-md-link" });

export const markdownDecorations = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = buildMarkdownDecorations(view.state, view.hasFocus);
    }
    update(update: ViewUpdate) {
      if (
        update.docChanged ||
        update.selectionSet ||
        update.viewportChanged ||
        update.focusChanged
      ) {
        this.decorations = buildMarkdownDecorations(
          update.state,
          update.view.hasFocus,
        );
      }
    }
  },
  { decorations: (instance) => instance.decorations },
);

export function buildMarkdownDecorations(
  state: EditorState,
  revealSelection = true,
): DecorationSet {
  const builder: Range<Decoration>[] = [];
  const selections = revealSelection
    ? state.selection.ranges.map((range: SelectionRange) => ({
        from: range.from,
        to: range.to,
      }))
    : [];
  const codeSelections = state.selection.ranges.map((range) => ({
    from: range.from,
    to: range.to,
  }));
  const codeLines = new Map<
    number,
    { end: boolean; number?: number; start: boolean }
  >();
  const fencedLines = new Set<number>();

  for (const block of fencedCodeRanges(state)) {
    const active = codeSelections.some((selection) =>
      overlapsRange(selection, block.revealFrom, block.revealTo),
    );
    const firstLine = state.doc.lineAt(block.revealFrom).number;
    const lastLine = state.doc.lineAt(block.revealTo).number;
    const firstCodeLine = block.code
      ? state.doc.lineAt(block.code.from).number
      : undefined;
    const lastCodeLine = block.code
      ? state.doc.lineAt(Math.max(block.code.from, block.code.to - 1)).number
      : undefined;
    for (let line = firstLine; line <= lastLine; line += 1) {
      fencedLines.add(line);
      if (active) {
        codeLines.set(line, {
          end: line === lastLine,
          number:
            firstCodeLine !== undefined &&
            lastCodeLine !== undefined &&
            line >= firstCodeLine &&
            line <= lastCodeLine
              ? line - firstCodeLine + 1
              : undefined,
          start: line === firstLine,
        });
      }
    }
  }

  for (let lineNumber = 1; lineNumber <= state.doc.lines; lineNumber += 1) {
    const line = state.doc.line(lineNumber);
    const text = line.text;
    const lineFrom = line.from;
    const trimmed = text.trim();
    const lineToken = (from: number, to: number): InlineTokenRange => ({
      from,
      revealFrom: lineFrom,
      revealTo: line.to,
      to,
    });
    const codeLine = codeLines.get(lineNumber);
    if (codeLine) {
      builder.push(
        Decoration.line({
          attributes: {
            "data-code-line":
              codeLine.number === undefined ? "" : String(codeLine.number),
          },
          class: cn(
            "tm-md-code-line",
            codeLine.start && "tm-md-code-line-start",
            codeLine.end && "tm-md-code-line-end",
          ),
        }).range(lineFrom),
      );
      if (codeLine.start || codeLine.end) {
        builder.push(markerDecoration.range(lineFrom, line.to));
      }
      continue;
    }
    if (fencedLines.has(lineNumber)) continue;

    const heading = text.match(/^(#{1,6})\s+/);
    if (heading) {
      const markerLength = heading[0].length;
      addHiddenToken(
        builder,
        selections,
        lineToken(lineFrom, lineFrom + markerLength),
        headingMarkerDecorations[heading[1].length - 1],
      );
      const contentFrom = lineFrom + markerLength;
      if (contentFrom < line.to) {
        builder.push(
          Decoration.mark({
            class: `tm-md-heading tm-md-h${String(heading[1].length)}`,
          }).range(contentFrom, line.to),
        );
      }
    }

    const quote = text.match(/^>\s?/);
    if (quote) {
      addHiddenToken(
        builder,
        selections,
        lineToken(lineFrom, lineFrom + quote[0].length),
      );
    }
    const unordered = text.match(/^(\s*)([-+*])\s+(?:\[( |x|X)\]\s+)?/);
    if (unordered) {
      const markerStart = lineFrom + unordered[1].length;
      addHiddenToken(
        builder,
        selections,
        lineToken(markerStart, markerStart + unordered[2].length + 1),
      );
      const checkbox = unordered[0].match(/\[( |x|X)\]\s+$/);
      if (checkbox) {
        const checkboxStart = lineFrom + unordered[0].lastIndexOf("[");
        addHiddenToken(
          builder,
          selections,
          lineToken(checkboxStart, checkboxStart + checkbox[0].length),
        );
      }
    }
    const ordered = text.match(/^(\s*)(\d+\.)\s+/);
    if (ordered) {
      const markerStart = lineFrom + ordered[1].length;
      addHiddenToken(
        builder,
        selections,
        lineToken(markerStart, markerStart + ordered[2].length + 1),
      );
    }
    if (/^(?:\*\s*){3,}$|^(?:-\s*){3,}$|^(?:_\s*){3,}$/.test(trimmed)) {
      if (lineFrom < line.to) {
        builder.push(
          Decoration.mark({ class: "tm-md-marker tm-md-hr" }).range(
            lineFrom,
            line.to,
          ),
        );
      }
      continue;
    }
    if (/^\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?$/.test(text)) {
      if (lineFrom < line.to) {
        builder.push(
          Decoration.mark({ class: "tm-md-marker" }).range(lineFrom, line.to),
        );
      }
      continue;
    }

    const { styleRanges, tokenRanges } = collectInlineRanges(text, lineFrom);
    for (const range of styleRanges) {
      if (range.from >= range.to) continue;
      const decoration =
        range.className === "tm-md-strong"
          ? strongDecoration
          : range.className === "tm-md-em"
            ? emDecoration
            : range.className === "tm-md-del"
              ? delDecoration
              : range.className === "tm-md-code"
                ? codeDecoration
                : linkDecoration;
      builder.push(decoration.range(range.from, range.to));
    }
    const activeRanges = new Set<string>();
    for (const token of tokenRanges) {
      const hidden = addHiddenToken(builder, selections, token);
      if (hidden || !token.activeClassName) continue;
      const key = `${token.activeClassName}:${token.revealFrom}:${token.revealTo}`;
      if (activeRanges.has(key)) continue;
      activeRanges.add(key);
      builder.push(
        Decoration.mark({ class: token.activeClassName }).range(
          token.revealFrom,
          token.revealTo,
        ),
      );
    }
  }
  return Decoration.set(builder, true);
}

function addHiddenToken(
  builder: Range<Decoration>[],
  selections: ReadonlyArray<{ from: number; to: number }>,
  token: InlineTokenRange,
  revealedDecoration = markerDecoration,
) {
  if (token.from >= token.to) return false;
  const overlapsSelection = selections.some((selection) =>
    overlapsRange(selection, token.revealFrom, token.revealTo),
  );
  if (overlapsSelection) {
    builder.push(revealedDecoration.range(token.from, token.to));
    return false;
  }
  builder.push(hiddenTokenDecoration.range(token.from, token.to));
  return true;
}
