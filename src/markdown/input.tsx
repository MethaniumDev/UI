import {
  acceptCompletion,
  autocompletion,
  completionStatus,
  pickedCompletion,
  startCompletion,
  type Completion,
  type CompletionContext,
  type CompletionResult,
} from "@codemirror/autocomplete";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import { markdown } from "@codemirror/lang-markdown";
import { syntaxTree } from "@codemirror/language";
import {
  Annotation,
  Compartment,
  EditorSelection,
  EditorState,
  Prec,
  StateEffect,
  StateField,
  Transaction,
  type Extension,
  type Range,
  type SelectionRange,
} from "@codemirror/state";
import {
  Decoration,
  EditorView,
  keymap,
  placeholder,
  ViewPlugin,
  WidgetType,
  type DecorationSet,
  type KeyBinding,
  type ViewUpdate,
} from "@codemirror/view";
import { useEffect, useRef, type CSSProperties } from "react";
import { createRoot, type Root } from "react-dom/client";

import { cn } from "../lib/utils";
import { CodeBlock } from "./code-block";
import Emoji from "./emoji";
import { useEmojiRegistry } from "./emoji-context";
import {
  defaultEmojiRegistry,
  findEmojiShortcodes,
  getEmojiUrl,
  resolveEmoji,
  searchEmojis,
  type EmojiRegistry,
} from "./emoji-data";
import { parseCodeMeta } from "./markdown-meta";
import { highlightCodeTokens } from "./shiki";

export const MAX_RENDERED_EMOJI_OPTIONS = 100;

export type InputController = {
  focus: () => void;
  hasFocus: () => boolean;
  insertText: (text: string) => void;
};

export type InputProps = {
  ref?: HTMLDivElement;
  placeholder?: string;
  value: string;
  setValue: (value: string) => void;
  onSubmit?: () => void;
  invertEnterBehavior?: boolean;
  fontSize?: CSSProperties["fontSize"];
  paddingX?: CSSProperties["padding"];
  paddingY?: CSSProperties["padding"];
  className?: string;
  emojiFrequencies?: Readonly<Record<string, number>>;
  onEmojiSelect?: (shortcode: string) => void;
  autoFocus?: boolean;
  onControllerChange?: (controller: InputController | null) => void;
  registry?: EmojiRegistry;
};

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

function toCssLength(value: CSSProperties["padding"]) {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

function toCssPadding(
  vertical: CSSProperties["padding"],
  horizontal: CSSProperties["padding"],
) {
  return `${toCssLength(vertical) ?? "0.25rem"} ${toCssLength(horizontal) ?? "0.625rem"}`;
}

const hiddenTokenDecoration = Decoration.replace({ inclusive: false });
const strongDecoration = Decoration.mark({ class: "tm-md-strong" });
const emDecoration = Decoration.mark({ class: "tm-md-em" });
const delDecoration = Decoration.mark({ class: "tm-md-del" });
const codeDecoration = Decoration.mark({ class: "tm-md-code" });
const linkDecoration = Decoration.mark({ class: "tm-md-link" });
const externalValueSync = Annotation.define<boolean>();
const widgetRoots = new WeakMap<HTMLElement, Root>();

function destroyWidgetRoot(dom: HTMLElement) {
  const root = widgetRoots.get(dom);
  if (!root) return;
  widgetRoots.delete(dom);
  setTimeout(() => root.unmount(), 0);
}

type FencedCodeRange = {
  closingMark?: { from: number; to: number };
  code?: { from: number; to: number };
  info?: { from: number; to: number };
  openingMark: { from: number; to: number };
  revealFrom: number;
  revealTo: number;
};

function fencedCodeRanges(state: EditorState): FencedCodeRange[] {
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

function selectionTouchesFencedCode(state: EditorState) {
  const blocks = fencedCodeRanges(state);
  return state.selection.ranges.some((selection) =>
    blocks.some(
      (block) =>
        selection.from <= block.revealTo && selection.to >= block.revealFrom,
    ),
  );
}

function enterAdjacentFencedCode(view: EditorView, direction: "down" | "up") {
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
    widgetRoots.set(container, root);
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

const codeBlockFocusEffect = StateEffect.define<boolean>();
type CodeBlockDecorationState = {
  decorations: DecorationSet;
  focused: boolean;
};

const codeBlockDecorations = StateField.define<CodeBlockDecorationState>({
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
});

type EmojiRange = {
  from: number;
  shortcode: string;
  to: number;
  url: string;
};

class EmojiWidget extends WidgetType {
  readonly shortcode: string;
  readonly url: string;
  readonly registry: EmojiRegistry;

  constructor(shortcode: string, url: string, registry: EmojiRegistry) {
    super();
    this.shortcode = shortcode;
    this.url = url;
    this.registry = registry;
  }

  eq(other: EmojiWidget) {
    return (
      other.shortcode === this.shortcode &&
      other.url === this.url &&
      other.registry === this.registry
    );
  }

  toDOM() {
    const container = document.createElement("span");
    const root = createRoot(container);
    root.render(
      <Emoji
        className="tm-md-editor-emoji"
        registry={this.registry}
        shortcode={this.shortcode}
      />,
    );
    widgetRoots.set(container, root);
    return container;
  }

  destroy(dom: HTMLElement) {
    destroyWidgetRoot(dom);
  }

  ignoreEvent() {
    return true;
  }
}

function codeRanges(state: EditorState) {
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

export function findEmojiRanges(
  state: EditorState,
  registry: EmojiRegistry = defaultEmojiRegistry,
): EmojiRange[] {
  const document = state.doc.toString();
  const excluded = codeRanges(state);
  const ranges: EmojiRange[] = [];

  for (const match of findEmojiShortcodes(document, registry)) {
    const { from, to } = match;
    const inCode = excluded.some((range) => from < range.to && to > range.from);
    const emoji = inCode ? undefined : match.emoji;
    const url = emoji ? getEmojiUrl(emoji.shortcode, registry) : undefined;
    if (emoji && url)
      ranges.push({ from, shortcode: emoji.shortcode, to, url });
  }
  return ranges;
}

function createEmojiDecorations(registry: EmojiRegistry) {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      ranges: EmojiRange[];

      constructor(view: EditorView) {
        this.ranges = findEmojiRanges(view.state, registry);
        this.decorations = this.buildDecorations();
      }

      update(update: ViewUpdate) {
        if (
          update.docChanged ||
          syntaxTree(update.startState) !== syntaxTree(update.state)
        ) {
          this.ranges = findEmojiRanges(update.state, registry);
          this.decorations = this.buildDecorations();
        }
      }

      private buildDecorations() {
        return Decoration.set(
          this.ranges.map((range) =>
            Decoration.replace({
              inclusive: false,
              widget: new EmojiWidget(range.shortcode, range.url, registry),
            }).range(range.from, range.to),
          ),
          true,
        );
      }
    },
    {
      decorations: (instance) => instance.decorations,
      provide: (plugin) =>
        EditorView.atomicRanges.of(
          (view) => view.plugin(plugin)?.decorations ?? Decoration.none,
        ),
    },
  );
}

function deleteEmoji(
  view: EditorView,
  direction: "backward" | "forward",
  registry: EmojiRegistry,
) {
  const ranges = findEmojiRanges(view.state, registry);
  const deletions: Array<{ from: number; to: number }> = [];

  for (const selection of view.state.selection.ranges) {
    if (selection.empty) {
      const emoji = ranges.find((range) =>
        direction === "backward"
          ? selection.from > range.from && selection.from <= range.to
          : selection.from >= range.from && selection.from < range.to,
      );
      if (emoji) deletions.push({ from: emoji.from, to: emoji.to });
      continue;
    }

    let from = selection.from;
    let to = selection.to;
    let changed = false;
    for (const emoji of ranges) {
      if (from < emoji.to && to > emoji.from) {
        from = Math.min(from, emoji.from);
        to = Math.max(to, emoji.to);
        changed = true;
      }
    }
    if (changed) deletions.push({ from, to });
  }

  if (deletions.length === 0) return false;
  const merged = deletions
    .sort((a, b) => a.from - b.from)
    .reduce<Array<{ from: number; to: number }>>((result, deletion) => {
      const previous = result.at(-1);
      if (previous && deletion.from <= previous.to) {
        previous.to = Math.max(previous.to, deletion.to);
      } else {
        result.push({ ...deletion });
      }
      return result;
    }, []);

  view.dispatch({
    changes: merged.map((range) => ({ from: range.from, to: range.to })),
    selection: EditorSelection.cursor(merged[0].from),
    scrollIntoView: true,
    userEvent: direction === "backward" ? "delete.backward" : "delete.forward",
  });
  return true;
}

const markdownDecorations = ViewPlugin.fromClass(
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

const codeHighlightDecorations = ViewPlugin.fromClass(
  class {
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
  },
  { decorations: (instance) => instance.decorations },
);

export default function Input(props: InputProps) {
  const registry = useEmojiRegistry(props.registry);
  const elementRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | undefined>(undefined);
  const setValueRef = useRef(props.setValue);
  const onSubmitRef = useRef(props.onSubmit);
  const onEmojiSelectRef = useRef(props.onEmojiSelect);
  const invertEnterBehaviorRef = useRef(Boolean(props.invertEnterBehavior));
  const registryRef = useRef(registry);
  const emojiCompartmentRef = useRef<Compartment | null>(null);
  emojiCompartmentRef.current ??= new Compartment();
  const emojiCompartment = emojiCompartmentRef.current;

  useEffect(() => {
    setValueRef.current = props.setValue;
    onSubmitRef.current = props.onSubmit;
    onEmojiSelectRef.current = props.onEmojiSelect;
    invertEnterBehaviorRef.current = Boolean(props.invertEnterBehavior);
  }, [
    props.invertEnterBehavior,
    props.onEmojiSelect,
    props.onSubmit,
    props.setValue,
  ]);

  useEffect(() => {
    if (!elementRef.current) return;
    const state = EditorState.create({
      doc: props.value,
      extensions: createEditorExtensions(
        (value) => setValueRef.current(value),
        () => props.placeholder,
        () => invertEnterBehaviorRef.current,
        () => onSubmitRef.current?.(),
        emojiCompartment,
        props.emojiFrequencies,
        (shortcode) => onEmojiSelectRef.current?.(shortcode),
        registry,
        () => registryRef.current,
      ),
    });

    viewRef.current = new EditorView({ state, parent: elementRef.current });
    props.onControllerChange?.({
      focus: () => viewRef.current?.contentDOM.focus({ preventScroll: true }),
      hasFocus: () => viewRef.current?.hasFocus ?? false,
      insertText: (text) => {
        const editor = viewRef.current;
        if (!editor) return;
        editor.dispatch({
          ...editor.state.replaceSelection(text),
          annotations: Transaction.userEvent.of("input.type"),
          scrollIntoView: true,
        });
      },
    });
    if (props.autoFocus) viewRef.current.focus();

    return () => {
      props.onControllerChange?.(null);
      viewRef.current?.destroy();
      viewRef.current = undefined;
    };
    // The editor instance intentionally lives for the lifetime of this component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const editor = viewRef.current;
    if (!editor) return;
    const current = editor.state.doc.toString();
    if (props.value === current) return;
    editor.dispatch({
      changes: { from: 0, to: current.length, insert: props.value },
      annotations: [
        externalValueSync.of(true),
        Transaction.addToHistory.of(false),
      ],
      filter: false,
    });
  }, [props.value]);

  useEffect(() => {
    registryRef.current = registry;
    const editor = viewRef.current;
    if (!editor) return;
    const wasActive = completionStatus(editor.state) === "active";
    editor.dispatch({
      effects: emojiCompartment.reconfigure(
        createEmojiExtensions(
          props.emojiFrequencies,
          (shortcode) => onEmojiSelectRef.current?.(shortcode),
          registry,
        ),
      ),
    });
    if (wasActive) startCompletion(editor);
  }, [emojiCompartment, props.emojiFrequencies, registry]);

  return (
    <div
      ref={elementRef}
      className={cn(
        "tm-md-root min-h-8 w-full min-w-0 text-base outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        props.className,
      )}
      style={
        {
          fontSize: props.fontSize ?? "1rem",
          "--tm-md-content-padding": toCssPadding(
            props.paddingY,
            props.paddingX,
          ),
        } as CSSProperties & { "--tm-md-content-padding"?: string }
      }
    />
  );
}

function createEditorExtensions(
  onChange: (value: string) => void,
  getPlaceholder: () => string | undefined,
  getInvertEnterBehavior: () => boolean,
  onSubmit: () => void,
  emojiCompartment: Compartment,
  emojiFrequencies: Readonly<Record<string, number>> | undefined,
  onEmojiSelect: (shortcode: string) => void,
  registry: EmojiRegistry,
  getRegistry: () => EmojiRegistry,
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
        if (!getInvertEnterBehavior()) return false;
        onSubmit();
        return true;
      },
    },
    {
      key: "Enter",
      run: (view) => {
        if (completionStatus(view.state) === "active")
          return acceptCompletion(view);
        if (selectionTouchesFencedCode(view.state)) return false;
        if (getInvertEnterBehavior()) return false;
        onSubmit();
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

function createEmojiExtensions(
  frequencies: Readonly<Record<string, number>> | undefined,
  onEmojiSelect: (shortcode: string) => void,
  registry: EmojiRegistry,
): Extension[] {
  return [
    createEmojiAutocomplete(frequencies, onEmojiSelect, registry),
    createEmojiDecorations(registry),
  ];
}

function createEmojiAutocomplete(
  frequencies: Readonly<Record<string, number>> | undefined,
  onEmojiSelect: (shortcode: string) => void,
  registry: EmojiRegistry,
) {
  return autocompletion({
    activateOnTyping: true,
    addToOptions: [
      {
        position: 20,
        render(completion) {
          const container = document.createElement("span");
          createRoot(container).render(
            <Emoji
              className="tm-md-completion-emoji"
              registry={registry}
              shortcode={completion.label}
            />,
          );
          return container;
        },
      },
    ],
    maxRenderedOptions: MAX_RENDERED_EMOJI_OPTIONS,
    override: [
      createEmojiCompletionSource(frequencies, onEmojiSelect, registry),
    ],
  });
}

function normalizedFrequencies(
  frequencies: Readonly<Record<string, number>> | undefined,
  registry: EmojiRegistry,
) {
  const normalized = new Map<string, number>();
  for (const [value, frequency] of Object.entries(frequencies ?? {})) {
    const shortcode = resolveEmoji(value, registry)?.shortcode;
    if (!shortcode || !Number.isFinite(frequency) || frequency <= 0) continue;
    normalized.set(shortcode, (normalized.get(shortcode) ?? 0) + frequency);
  }
  return normalized;
}

export function createEmojiCompletionSource(
  frequencies?: Readonly<Record<string, number>>,
  onEmojiSelect: (shortcode: string) => void = () => undefined,
  registry: EmojiRegistry = defaultEmojiRegistry,
) {
  const normalized = normalizedFrequencies(frequencies, registry);
  const maxFrequency = Math.max(0, ...normalized.values());

  return (context: CompletionContext): CompletionResult | null => {
    const token = context.matchBefore(/:[a-z0-9_+-]*$/i);
    if (!token) return null;
    if (
      codeRanges(context.state).some(
        (range) => token.from < range.to && token.to > range.from,
      )
    ) {
      return null;
    }
    const characterBefore = context.state.sliceDoc(
      Math.max(0, token.from - 1),
      token.from,
    );
    if (characterBefore && /[a-z0-9_]/i.test(characterBefore)) return null;

    const query = token.text.slice(1).toLowerCase();
    const options: Completion[] = searchEmojis(query, registry)
      .map((emoji) => {
        const aliases = emoji.aliases.map((alias) => alias.toLowerCase());
        const matchedAlias =
          aliases.find((alias) => alias === query) ??
          aliases.find((alias) => alias.startsWith(query)) ??
          aliases.find((alias) => alias.includes(query)) ??
          emoji.name;
        const relevance = !query
          ? 0
          : matchedAlias === query
            ? 80
            : matchedAlias.startsWith(query)
              ? 40
              : 0;
        const frequency = normalized.get(emoji.shortcode) ?? 0;
        const usage =
          maxFrequency > 0
            ? (15 * Math.log1p(frequency)) / Math.log1p(maxFrequency)
            : 0;

        return {
          apply(view, completion, from, to) {
            view.dispatch({
              annotations: pickedCompletion.of(completion),
              changes: { from, insert: `${emoji.shortcode} `, to },
              selection: EditorSelection.cursor(
                from + emoji.shortcode.length + 1,
              ),
            });
            onEmojiSelect(emoji.shortcode);
          },
          boost: relevance + usage,
          displayLabel: emoji.shortcode,
          label: `:${matchedAlias}:`,
          type: "text",
          frequency,
          relevance,
        } satisfies Completion & { frequency: number; relevance: number };
      })
      .sort(
        (a, b) =>
          b.relevance - a.relevance ||
          b.frequency - a.frequency ||
          (a.displayLabel ?? a.label).localeCompare(b.displayLabel ?? b.label),
      );

    return {
      from: token.from,
      options,
      validFor: /^:[a-z0-9_+-]*$/i,
    };
  };
}

export const emojiCompletionSource = createEmojiCompletionSource();

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
          Decoration.mark({ class: "tm-md-hr" }).range(lineFrom, line.to),
        );
      }
      continue;
    }
    if (/^\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?$/.test(text)) {
      if (lineFrom < line.to) {
        builder.push(
          Decoration.mark({ class: "tm-md-del" }).range(lineFrom, line.to),
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
) {
  if (token.from >= token.to) return false;
  const overlapsSelection = selections.some((selection) =>
    overlapsRange(selection, token.revealFrom, token.revealTo),
  );
  if (!overlapsSelection) {
    builder.push(hiddenTokenDecoration.range(token.from, token.to));
  }
  return !overlapsSelection;
}

function overlapsRange(
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
