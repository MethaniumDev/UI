import { syntaxTree } from "@codemirror/language";
import {
  EditorSelection,
  StateEffect,
  StateField,
  type EditorState,
  type Range,
} from "@codemirror/state";
import {
  Decoration,
  EditorView,
  WidgetType,
  type DecorationSet,
} from "@codemirror/view";
import { createRoot, type Root } from "react-dom/client";

import { parseCodeMeta } from "../engine/code-meta";
import { CodeBlock } from "../render/code-block";
import { destroyWidgetRoot, overlapsRange, registerWidgetRoot } from "./shared";

export type FencedCodeRange = {
  closingMark?: { from: number; to: number };
  code?: { from: number; to: number };
  info?: { from: number; to: number };
  openingMark: { from: number; to: number };
  revealFrom: number;
  revealTo: number;
};

export function fencedCodeRanges(state: EditorState): FencedCodeRange[] {
  const ranges: FencedCodeRange[] = [];
  syntaxTree(state).iterate({
    enter(node) {
      if (node.name !== "FencedCode") return;
      const marks = node.node.getChildren("CodeMark");
      const openingMark = marks[0];
      if (!openingMark) return false;
      const info = node.node.getChild("CodeInfo");
      const code = node.node.getChild("CodeText");
      ranges.push({
        closingMark: marks[1]
          ? { from: marks[1].from, to: marks[1].to }
          : undefined,
        code: code ? { from: code.from, to: code.to } : undefined,
        info: info ? { from: info.from, to: info.to } : undefined,
        openingMark: { from: openingMark.from, to: openingMark.to },
        revealFrom: state.doc.lineAt(node.from).from,
        revealTo: state.doc.lineAt(node.to).to,
      });
      return false;
    },
  });
  return ranges;
}

export function selectionTouchesFencedCode(state: EditorState) {
  const blocks = fencedCodeRanges(state);
  return state.selection.ranges.some((selection) =>
    blocks.some(
      (block) =>
        selection.from <= block.revealTo && selection.to >= block.revealFrom,
    ),
  );
}

export function enterAdjacentFencedCode(
  view: EditorView,
  direction: "down" | "up",
) {
  const selection = view.state.selection.main;
  if (!selection.empty || view.state.selection.ranges.length !== 1)
    return false;
  const currentLine = view.state.doc.lineAt(selection.head).number;
  const block = fencedCodeRanges(view.state).find((candidate) => {
    const firstLine = view.state.doc.lineAt(candidate.revealFrom).number;
    const lastLine = view.state.doc.lineAt(candidate.revealTo).number;
    return direction === "down"
      ? firstLine === currentLine + 1
      : lastLine === currentLine - 1;
  });
  if (!block) return false;

  const cursor =
    direction === "down"
      ? block.openingMark.from
      : (block.closingMark?.from ?? block.code?.to ?? block.openingMark.to);
  view.dispatch({
    selection: EditorSelection.cursor(cursor),
    scrollIntoView: true,
  });
  return true;
}

class CodeBlockWidget extends WidgetType {
  readonly code: string;
  readonly codeFrom: number;
  readonly cursor: number;
  readonly filename?: string;
  readonly highlightedLines: ReadonlySet<number>;
  readonly highlightedLineKey: string;
  readonly language?: string;
  readonly showLineNumbers: boolean;

  constructor(state: EditorState, block: FencedCodeRange) {
    super();
    const info = block.info
      ? state.sliceDoc(block.info.from, block.info.to).trim()
      : "";
    const meta = parseCodeMeta(info);
    this.code = block.code
      ? state.sliceDoc(block.code.from, block.code.to)
      : "";
    this.codeFrom = block.code?.from ?? block.openingMark.to;
    this.cursor = block.code?.from ?? block.openingMark.to;
    this.filename = meta.filename;
    this.highlightedLines = meta.highlightedLines;
    this.highlightedLineKey = [...meta.highlightedLines]
      .sort((left, right) => left - right)
      .join(",");
    this.language = info.split(/\s+/, 1)[0] || undefined;
    this.showLineNumbers = meta.showLineNumbers;
  }

  eq(other: CodeBlockWidget) {
    return (
      this.code === other.code &&
      this.codeFrom === other.codeFrom &&
      this.cursor === other.cursor &&
      this.filename === other.filename &&
      this.highlightedLineKey === other.highlightedLineKey &&
      this.language === other.language &&
      this.showLineNumbers === other.showLineNumbers
    );
  }

  toDOM(view: EditorView) {
    const container = document.createElement("div");
    container.className = "group/markdown tm-md-rendered-code-block";
    container.dataset.variant = "compact";
    const root = createRoot(container);
    root.render(
      <CodeBlock
        code={this.code}
        filename={this.filename}
        highlightedLines={this.highlightedLines}
        language={this.language}
        showLineNumbers={this.showLineNumbers}
      />,
    );
    container.addEventListener("mousedown", (event) => {
      if (
        event.target instanceof Element &&
        event.target.closest('[data-slot="code-block-copy"]')
      ) {
        return;
      }
      event.preventDefault();
      const codeOffset = codeOffsetAtPoint(container, event);
      view.dispatch({
        selection: EditorSelection.cursor(
          codeOffset === undefined
            ? this.cursor
            : this.codeFrom + Math.min(codeOffset, this.code.length),
        ),
        scrollIntoView: true,
      });
      view.focus();
    });
    registerWidgetRoot(container, root);
    return container;
  }

  destroy(dom: HTMLElement) {
    destroyWidgetRoot(dom);
  }

  ignoreEvent() {
    return true;
  }
}

function codeOffsetAtPoint(container: HTMLElement, event: MouseEvent) {
  const code = container.querySelector("code");
  if (!code) return undefined;
  const position = document.caretPositionFromPoint?.(
    event.clientX,
    event.clientY,
  );
  let node = position?.offsetNode;
  let offset = position?.offset;
  if (!node || offset === undefined) {
    const range = (
      document as Document & {
        caretRangeFromPoint?: (
          x: number,
          y: number,
        ) => ReturnType<Document["createRange"]> | null;
      }
    ).caretRangeFromPoint?.(event.clientX, event.clientY);
    node = range?.startContainer;
    offset = range?.startOffset;
  }
  if (!node || offset === undefined || !code.contains(node)) return undefined;

  const prefix = document.createRange();
  prefix.selectNodeContents(code);
  prefix.setEnd(node, offset);
  return prefix.toString().length;
}

function buildCodeBlockDecorations(state: EditorState, focused: boolean) {
  const builder: Range<Decoration>[] = [];
  const selections = state.selection.ranges.map((range) => ({
    from: range.from,
    to: range.to,
  }));
  for (const block of fencedCodeRanges(state)) {
    if (
      focused &&
      selections.some((selection) =>
        overlapsRange(selection, block.revealFrom, block.revealTo),
      )
    ) {
      continue;
    }
    builder.push(
      Decoration.replace({
        block: true,
        widget: new CodeBlockWidget(state, block),
      }).range(block.revealFrom, block.revealTo),
    );
  }
  return Decoration.set(builder, true);
}

export const codeBlockFocusEffect = StateEffect.define<boolean>();
type CodeBlockDecorationState = {
  decorations: DecorationSet;
  focused: boolean;
};

export const codeBlockDecorations = StateField.define<CodeBlockDecorationState>(
  {
    create: (state) => ({
      decorations: buildCodeBlockDecorations(state, false),
      focused: false,
    }),
    update: (value, transaction) => {
      const focusEffect = transaction.effects.find((effect) =>
        effect.is(codeBlockFocusEffect),
      );
      const focused = focusEffect?.value ?? value.focused;
      return {
        decorations: buildCodeBlockDecorations(transaction.state, focused),
        focused,
      };
    },
    provide: (field) =>
      EditorView.decorations.from(field, (value) => value.decorations),
  },
);
