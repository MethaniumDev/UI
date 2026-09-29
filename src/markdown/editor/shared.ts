import { syntaxTree } from "@codemirror/language";
import type { EditorState } from "@codemirror/state";
import type { Root } from "react-dom/client";

const widgetRoots = new WeakMap<HTMLElement, Root>();

export function registerWidgetRoot(dom: HTMLElement, root: Root) {
  widgetRoots.set(dom, root);
}

export function destroyWidgetRoot(dom: HTMLElement) {
  const root = widgetRoots.get(dom);
  if (!root) return;
  widgetRoots.delete(dom);
  setTimeout(() => root.unmount(), 0);
}

export function codeRanges(state: EditorState) {
  const ranges: Array<{ from: number; to: number }> = [];
  syntaxTree(state).iterate({
    enter(node) {
      if (
        node.name === "InlineCode" ||
        node.name === "FencedCode" ||
        node.name === "CodeBlock"
      ) {
        ranges.push({ from: node.from, to: node.to });
        return false;
      }
    },
  });
  return ranges;
}

export function overlapsRange(
  selection: { from: number; to: number },
  from: number,
  to: number,
) {
  const selectionFrom = Math.min(selection.from, selection.to);
  const selectionTo = Math.max(selection.from, selection.to);
  return selectionFrom === selectionTo
    ? selectionFrom >= from && selectionFrom <= to
    : selectionFrom < to && selectionTo > from;
}
