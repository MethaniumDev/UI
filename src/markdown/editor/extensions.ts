import { acceptCompletion, completionStatus } from "@codemirror/autocomplete";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import { markdown } from "@codemirror/lang-markdown";
import {
  Annotation,
  Compartment,
  Prec,
  type Extension,
} from "@codemirror/state";
import {
  EditorView,
  keymap,
  placeholder,
  type KeyBinding,
} from "@codemirror/view";

import type { EmojiRegistry } from "../emoji/registry";
import {
  codeBlockDecorations,
  codeBlockFocusEffect,
  enterAdjacentFencedCode,
  selectionTouchesFencedCode,
} from "./code-block";
import { codeHighlightDecorations } from "./highlight";
import { markdownDecorations } from "./inline";
import { createEmojiExtensions, deleteEmoji } from "./emoji";
import {
  mathInputHandler,
  richDecorations,
  type CropImage,
  type EditDrawing,
  type ResolveMedia,
} from "./rich-media";
import { tableDecorations } from "./tables";

// Marks transactions that sync an external value into the editor so the change
// listener can ignore them.
export const externalValueSync = Annotation.define<boolean>();

export function createEditorExtensions(
  onChange: (value: string) => void,
  getPlaceholder: () => string | undefined,
  getInvertEnterBehavior: () => boolean,
  getOnSubmit: () => (() => void) | undefined,
  emojiCompartment: Compartment,
  emojiFrequencies: Readonly<Record<string, number>> | undefined,
  onEmojiSelect: (shortcode: string) => void,
  registry: EmojiRegistry,
  getRegistry: () => EmojiRegistry,
  resolveMedia?: ResolveMedia,
  editDrawing?: EditDrawing,
  cropImage?: CropImage,
): Extension[] {
  const editorKeymap = [
    ...defaultKeymap,
    ...historyKeymap,
    indentWithTab,
  ] as unknown as readonly KeyBinding[];
  const customEnterKeymap = keymap.of([
    {
      key: "Shift-Enter",
      run: (view) => {
        if (completionStatus(view.state) === "active")
          return acceptCompletion(view);
        if (selectionTouchesFencedCode(view.state)) return false;
        if (!getInvertEnterBehavior() || !getOnSubmit()) return false;
        getOnSubmit()?.();
        return true;
      },
    },
    {
      key: "Enter",
      run: (view) => {
        if (completionStatus(view.state) === "active")
          return acceptCompletion(view);
        if (selectionTouchesFencedCode(view.state)) return false;
        if (getInvertEnterBehavior() || !getOnSubmit()) return false;
        getOnSubmit()?.();
        return true;
      },
    },
  ]);
  const completionTabKeymap = keymap.of([
    {
      key: "Tab",
      run: (view) =>
        completionStatus(view.state) === "active"
          ? acceptCompletion(view)
          : false,
    },
  ]);
  const codeBlockNavigationKeymap = keymap.of([
    {
      key: "ArrowDown",
      run: (view) => enterAdjacentFencedCode(view, "down"),
    },
    {
      key: "ArrowUp",
      run: (view) => enterAdjacentFencedCode(view, "up"),
    },
  ]);
  const emojiDeletionKeymap = keymap.of([
    {
      key: "Backspace",
      run: (view) => deleteEmoji(view, "backward", getRegistry()),
    },
    {
      key: "Delete",
      run: (view) => deleteEmoji(view, "forward", getRegistry()),
    },
  ]);

  return [
    history(),
    markdown(),
    codeBlockDecorations,
    tableDecorations,
    richDecorations(resolveMedia, editDrawing, cropImage),
    mathInputHandler,
    emojiCompartment.of(
      createEmojiExtensions(emojiFrequencies, onEmojiSelect, registry),
    ),
    keymap.of(editorKeymap),
    Prec.highest(codeBlockNavigationKeymap),
    Prec.highest(completionTabKeymap),
    Prec.highest(emojiDeletionKeymap),
    Prec.highest(customEnterKeymap),
    EditorView.lineWrapping,
    placeholder(getPlaceholder() ?? ""),
    EditorView.updateListener.of((update) => {
      if (!update.docChanged) return;
      if (
        update.transactions.some(
          (transaction) => transaction.annotation(externalValueSync) === true,
        )
      ) {
        return;
      }
      onChange(update.state.doc.toString());
    }),
    EditorView.theme({
      "&": { fontSize: "inherit" },
      "&.cm-editor": { width: "100%" },
    }),
    EditorView.editorAttributes.of({
      class: "tm-md-editor",
      spellcheck: "true",
      "aria-label": "Markdown input",
    }),
    EditorView.domEventHandlers({
      focus(_event, view) {
        view.dispatch({ effects: codeBlockFocusEffect.of(true) });
      },
      blur(_event, view) {
        view.dispatch({ effects: codeBlockFocusEffect.of(false) });
      },
    }),
    markdownDecorations,
    codeHighlightDecorations,
  ];
}
