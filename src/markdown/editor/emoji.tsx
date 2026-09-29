import {
  autocompletion,
  pickedCompletion,
  type Completion,
  type CompletionContext,
  type CompletionResult,
} from "@codemirror/autocomplete";
import { syntaxTree } from "@codemirror/language";
import {
  EditorSelection,
  type EditorState,
  type Extension,
} from "@codemirror/state";
import {
  Decoration,
  EditorView,
  ViewPlugin,
  WidgetType,
  type DecorationSet,
  type ViewUpdate,
} from "@codemirror/view";
import { createRoot } from "react-dom/client";

import Emoji from "../emoji/emoji";
import {
  defaultEmojiRegistry,
  findEmojiShortcodes,
  getEmojiUrl,
  resolveEmoji,
  searchEmojis,
  type EmojiRegistry,
} from "../emoji/registry";
import { codeRanges, destroyWidgetRoot, registerWidgetRoot } from "./shared";

export const MAX_RENDERED_EMOJI_OPTIONS = 100;

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

export function deleteEmoji(
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

export function createEmojiExtensions(
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
