import { StateEffect, type EditorState } from "@codemirror/state";
import {
  Decoration,
  ViewPlugin,
  type DecorationSet,
  type EditorView,
  type ViewUpdate,
} from "@codemirror/view";

import { highlightCodeTokens } from "../engine/shiki";
import { fencedCodeRanges } from "./code-block";

const codeHighlightEffect = StateEffect.define<{
  decorations: DecorationSet;
  document: string;
}>();

async function buildCodeHighlightDecorations(state: EditorState) {
  const highlighted = await Promise.all(
    fencedCodeRanges(state).map(async (block) => {
      if (!block.code || !block.info) return [];
      const language = state
        .sliceDoc(block.info.from, block.info.to)
        .trim()
        .split(/\s+/, 1)[0];
      if (!language) return [];
      const tokens = await highlightCodeTokens(
        state.sliceDoc(block.code.from, block.code.to),
        language,
      );
      if (!tokens) return [];

      return tokens.flatMap((token) => {
        if (!token.content || token.content.includes("\n")) return [];
        const from = block.code!.from + token.offset;
        const to = from + token.content.length;
        if (from >= to || to > block.code!.to) return [];
        const styles = token.color ? [`color:${token.color}`] : [];
        if (token.fontStyle && token.fontStyle > 0) {
          if (token.fontStyle & 1) styles.push("font-style:italic");
          if (token.fontStyle & 2) styles.push("font-weight:bold");
          if (token.fontStyle & 4) styles.push("text-decoration:underline");
        }
        if (styles.length === 0) return [];
        return Decoration.mark({
          attributes: { style: styles.join(";") },
        }).range(from, to);
      });
    }),
  );
  return Decoration.set(highlighted.flat(), true);
}

class CodeHighlightPlugin {
  decorations = Decoration.none;
  private request = 0;
  private timeout: ReturnType<typeof setTimeout> | undefined;

  constructor(view: EditorView) {
    this.schedule(view, 0);
  }

  update(update: ViewUpdate) {
    for (const transaction of update.transactions) {
      for (const effect of transaction.effects) {
        if (
          effect.is(codeHighlightEffect) &&
          effect.value.document === update.state.doc.toString()
        ) {
          this.decorations = effect.value.decorations;
        }
      }
    }
    if (!update.docChanged) return;
    this.decorations = this.decorations.map(update.changes);
    this.schedule(update.view, 30);
  }

  destroy() {
    this.request += 1;
    if (this.timeout !== undefined) clearTimeout(this.timeout);
  }

  private schedule(view: EditorView, delay: number) {
    this.request += 1;
    const request = this.request;
    if (this.timeout !== undefined) clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.timeout = undefined;
      const state = view.state;
      const document = state.doc.toString();
      void buildCodeHighlightDecorations(state).then((decorations) => {
        setTimeout(() => {
          if (
            request !== this.request ||
            view.state.doc.toString() !== document
          )
            return;
          view.dispatch({
            effects: codeHighlightEffect.of({ decorations, document }),
          });
        }, 0);
      });
    }, delay);
  }
}

export const codeHighlightDecorations = ViewPlugin.fromClass(
  CodeHighlightPlugin,
  { decorations: (instance) => instance.decorations },
);
