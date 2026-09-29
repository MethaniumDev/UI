import { isolateHistory } from "@codemirror/commands";
import {
  EditorSelection,
  StateEffect,
  type EditorState,
  type Range,
} from "@codemirror/state";
import {
  Decoration,
  EditorView,
  ViewPlugin,
  WidgetType,
  type DecorationSet,
  type ViewUpdate,
} from "@codemirror/view";
import katex from "katex";

import { codeRanges } from "./shared";
import { markerDecoration } from "./inline";

export type ResolveMedia = (source: string) => string | undefined;
export type EditDrawing = (source: string) => void;
export type CropImage = (source: string, alt: string) => void;

export const refreshMediaEffect = StateEffect.define<void>();

type RichRange = {
  from: number;
  to: number;
  kind: "math" | "image" | "drawing" | "video";
  value: string;
  alt?: string;
  display?: boolean;
};

function richRanges(state: EditorState): RichRange[] {
  const text = state.doc.toString();
  const excluded = codeRanges(state);
  const ranges: RichRange[] = [];
  const pattern =
    /\$\$[^$\n]+\$\$|(?<!\$)\$[^$\n]+\$(?!\$)|!\[([^\]]*)\]\(([^)\n]+)\)|!\[\[([^\]\n]+)\]\]/g;
  for (const match of text.matchAll(pattern)) {
    const from = match.index;
    const to = from + match[0].length;
    if (excluded.some((range) => from < range.to && to > range.from)) continue;
    if (match[0].startsWith("$"))
      ranges.push({
        from,
        to,
        kind: "math",
        value: match[0].slice(
          match[0].startsWith("$$") ? 2 : 1,
          match[0].startsWith("$$") ? -2 : -1,
        ),
        display: match[0].startsWith("$$"),
      });
    else {
      const source = match[2] || match[3];
      const kind = match[2]
        ? "image"
        : source.toLowerCase().endsWith(".excalidraw")
          ? "drawing"
          : /\.(mp4|webm|ogg|mov|m4v)$/i.test(source)
            ? "video"
            : "image";
      ranges.push({ from, to, kind, value: source, alt: match[1] });
    }
  }
  return ranges;
}

class RichWidget extends WidgetType {
  readonly range: RichRange;
  readonly resolve?: ResolveMedia;
  readonly editDrawing?: EditDrawing;
  readonly cropImage?: CropImage;
  constructor(
    range: RichRange,
    resolve?: ResolveMedia,
    editDrawing?: EditDrawing,
    cropImage?: CropImage,
  ) {
    super();
    this.range = range;
    this.resolve = resolve;
    this.editDrawing = editDrawing;
    this.cropImage = cropImage;
  }

  eq(other: RichWidget) {
    return (
      JSON.stringify(this.range) === JSON.stringify(other.range) &&
      this.resolve === other.resolve
    );
  }

  toDOM(view: EditorView) {
    const element = document.createElement("span");
    element.className = `tm-md-rich tm-md-rich-${this.range.kind}`;
    if (this.range.kind === "math") {
      try {
        katex.render(this.range.value, element, {
          throwOnError: true,
          displayMode: this.range.display,
        });
      } catch {
        element.textContent = "Failed to render LaTeX";
        element.classList.add("tm-md-math-error");
      }
      element.title = this.range.value;
      element.onclick = () => {
        view.dispatch({
          selection: EditorSelection.cursor(
            this.range.from + (this.range.display ? 2 : 1),
          ),
        });
        view.focus();
      };
    } else {
      const url = this.resolve?.(this.range.value);
      if (this.range.kind === "image" && url) {
        const image = document.createElement("img");
        image.src = url;
        image.alt = this.range.alt || "";
        element.append(image);
        image.onclick = () => {
          const alt = prompt("Image alt text", this.range.alt || "");
          if (alt !== null && this.range.alt !== undefined)
            view.dispatch({
              changes: {
                from: this.range.from + 2,
                to: this.range.from + 2 + this.range.alt.length,
                insert: alt,
              },
            });
        };
        if (this.cropImage) {
          const crop = document.createElement("button");
          crop.textContent = "Crop";
          crop.onclick = () =>
            this.cropImage?.(this.range.value, this.range.alt || "");
          element.append(crop);
        }
      } else if (this.range.kind === "video" && url) {
        const video = document.createElement("video");
        video.src = url;
        video.controls = true;
        element.append(video);
      } else if (this.range.kind === "drawing") {
        const preview = document.createElement("span");
        preview.textContent = `Drawing · ${this.range.value}`;
        preview.className = "tm-md-drawing-preview";
        element.append(preview);
        const button = document.createElement("button");
        button.textContent = "Edit";
        button.onclick = () => this.editDrawing?.(this.range.value);
        element.append(button);
      } else element.textContent = this.range.value;
    }
    return element;
  }
  ignoreEvent() {
    return true;
  }
}

export function richDecorations(
  resolve?: ResolveMedia,
  editDrawing?: EditDrawing,
  cropImage?: CropImage,
) {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      constructor(view: EditorView) {
        this.decorations = this.build(view);
      }
      update(update: ViewUpdate) {
        if (
          update.docChanged ||
          update.selectionSet ||
          update.focusChanged ||
          update.transactions.some((transaction) =>
            transaction.effects.some((effect) => effect.is(refreshMediaEffect)),
          )
        )
          this.decorations = this.build(update.view);
      }
      build(view: EditorView) {
        const decorations: Range<Decoration>[] = [];
        for (const range of richRanges(view.state)) {
          const active =
            view.hasFocus &&
            view.state.selection.ranges.some(
              (selection) =>
                selection.from <= range.to && selection.to >= range.from,
            );
          if (!active) {
            decorations.push(
              Decoration.replace({
                widget: new RichWidget(range, resolve, editDrawing, cropImage),
              }).range(range.from, range.to),
            );
          } else if (range.kind === "math") {
            const delimiter = range.display ? 2 : 1;
            decorations.push(
              markerDecoration.range(range.from, range.from + delimiter),
              markerDecoration.range(range.to - delimiter, range.to),
            );
          }
        }
        return Decoration.set(decorations, true);
      }
    },
    { decorations: (plugin) => plugin.decorations },
  );
}

// Rewrites common LaTeX shortcuts ("times", "->") typed inside math ranges.
export const mathInputHandler = EditorView.inputHandler.of(
  (view, from, to, text) => {
    const math = richRanges(view.state).find(
      (range) =>
        range.kind === "math" &&
        from > range.from + (range.display ? 1 : 0) &&
        to < range.to - (range.display ? 1 : 0),
    );
    if (!math || !text) return false;
    const prefix = view.state.sliceDoc(Math.max(math.from, from - 5), from);
    const typed = prefix + text;
    const shortcut = typed.endsWith("times")
      ? { source: "times", replacement: "\\times" }
      : typed.endsWith("->")
        ? { source: "->", replacement: "\\to" }
        : null;
    if (!shortcut) return false;
    view.dispatch({
      changes: { from, to, insert: text },
      selection: EditorSelection.cursor(from + text.length),
      userEvent: "input.type",
    });
    const start = from + text.length - shortcut.source.length;
    view.dispatch({
      changes: {
        from: start,
        to: from + text.length,
        insert: shortcut.replacement,
      },
      selection: EditorSelection.cursor(start + shortcut.replacement.length),
      annotations: isolateHistory.of("before"),
      userEvent: "input.type",
    });
    return true;
  },
);
