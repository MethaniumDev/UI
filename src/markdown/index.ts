export { Markdown } from "./render/markdown";
export type {
  MarkdownComponents,
  MarkdownProps,
  MarkdownTheme,
  MarkdownVariant,
} from "./render/markdown";

export { default as Input } from "./editor/input";
export {
  createEmojiCompletionSource,
  emojiCompletionSource,
  findEmojiRanges,
  MAX_RENDERED_EMOJI_OPTIONS,
} from "./editor/emoji";
export type { InputController, InputProps } from "./editor/input";

export { default as Text } from "./render/text";
export type { TextProps } from "./render/text";

export { default as Emoji } from "./emoji/emoji";
export type { EmojiProps } from "./emoji/emoji";
export { EmojiProvider, useEmojiRegistry } from "./emoji/context";
export type { EmojiProviderProps } from "./emoji/context";
export {
  createEmojiRegistry,
  defaultEmojiRegistry,
  emojis,
  findEmojiShortcodes,
  getEmojiUrl,
  normalizeShortcode,
  resolveEmoji,
  searchEmojis,
} from "./emoji/registry";
export type {
  CustomEmojiDefinition,
  EmojiDefinition,
  EmojiRegistry,
  EmojiShortcodeMatch,
  RegisteredCustomEmoji,
  TwemojiDefinition,
} from "./emoji/registry";
