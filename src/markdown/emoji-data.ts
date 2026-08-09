import shortcodeData from "emojibase-data/en/shortcodes/joypixels.json";

import { twemojiAssetUrls } from "./twemoji-assets";

export type TwemojiDefinition = {
  aliases: readonly string[];
  hexcode: string;
  name: string;
  shortcode: string;
  source: "twemoji";
  src: string;
};

export type CustomEmojiDefinition = {
  aliases?: readonly string[];
  name?: string;
  shortcode: string;
  src: string;
};

export type RegisteredCustomEmoji = {
  aliases: readonly string[];
  name: string;
  shortcode: string;
  source: "custom";
  src: string;
};

export type EmojiDefinition = TwemojiDefinition | RegisteredCustomEmoji;

export type EmojiShortcodeMatch = {
  emoji: EmojiDefinition;
  from: number;
  to: number;
};

export type EmojiRegistry = {
  emojis: readonly EmojiDefinition[];
  findShortcodes: (value: string) => EmojiShortcodeMatch[];
  normalizeShortcode: (value: string) => string | undefined;
  resolve: (value: string) => EmojiDefinition | undefined;
  search: (query: string) => EmojiDefinition[];
};

function normalizeName(value: string) {
  return value
    .trim()
    .replace(/^:+|:+$/g, "")
    .toLowerCase();
}

function assertName(value: string, label: string) {
  const normalized = normalizeName(value);
  if (!normalized || !/^[a-z0-9_+-]+$/.test(normalized)) {
    throw new Error(
      `${label} must contain only letters, numbers, underscores, plus signs, or hyphens`,
    );
  }
  return normalized;
}

export const emojis: readonly TwemojiDefinition[] = Object.entries(
  shortcodeData as Record<string, string | string[]>,
).map(([rawHexcode, value]) => {
  const aliases = Array.isArray(value) ? value : [value];
  const name = aliases[0];
  const hexcode = rawHexcode.toLowerCase().replaceAll("_", "-");
  const twemojiHexcode = hexcode
    .split("-")
    .filter((codepoint) => codepoint !== "fe0f")
    .map((codepoint) => codepoint.replace(/^0+/, "") || "0")
    .join("-");
  const src = twemojiAssetUrls[hexcode] ?? twemojiAssetUrls[twemojiHexcode];
  if (!src) {
    throw new Error(`Missing local Twemoji asset for ${hexcode}`);
  }

  return {
    aliases,
    hexcode,
    name,
    shortcode: `:${name}:`,
    source: "twemoji" as const,
    src,
  };
});

function createRegistry(
  definitions: readonly EmojiDefinition[],
): EmojiRegistry {
  const emojiByName = new Map<string, EmojiDefinition>();
  for (const emoji of definitions) {
    for (const alias of emoji.aliases)
      emojiByName.set(normalizeName(alias), emoji);
  }

  function resolve(value: string) {
    return emojiByName.get(normalizeName(value));
  }

  function findShortcodes(value: string) {
    const matches: EmojiShortcodeMatch[] = [];
    let searchFrom = 0;

    while (searchFrom < value.length) {
      const from = value.indexOf(":", searchFrom);
      if (from === -1) break;

      const candidate = value.slice(from).match(/^:([a-z0-9_+-]+):/i);
      if (!candidate) {
        searchFrom = from + 1;
        continue;
      }

      const emoji = resolve(candidate[1]);
      if (!emoji) {
        searchFrom = from + candidate[0].length - 1;
        continue;
      }

      const to = from + candidate[0].length;
      matches.push({ emoji, from, to });
      searchFrom = to;
    }

    return matches;
  }

  function search(query: string) {
    const normalizedQuery = normalizeName(query);
    if (!normalizedQuery) return [...definitions];

    return definitions
      .map((emoji) => {
        const names = emoji.aliases.map(normalizeName);
        const exact = names.includes(normalizedQuery);
        const prefix = names.some((name) => name.startsWith(normalizedQuery));
        const contains = names.some((name) => name.includes(normalizedQuery));
        return { emoji, rank: exact ? 0 : prefix ? 1 : contains ? 2 : 3 };
      })
      .filter(({ rank }) => rank < 3)
      .sort(
        (left, right) =>
          left.rank - right.rank ||
          left.emoji.name.localeCompare(right.emoji.name),
      )
      .map(({ emoji }) => emoji);
  }

  return Object.freeze({
    emojis: Object.freeze([...definitions]),
    findShortcodes,
    normalizeShortcode: (value: string) => resolve(value)?.shortcode,
    resolve,
    search,
  });
}

export function createEmojiRegistry({
  customEmojis = [],
}: {
  customEmojis?: readonly CustomEmojiDefinition[];
} = {}): EmojiRegistry {
  const occupied = new Map<string, string>();
  for (const emoji of emojis) {
    for (const alias of emoji.aliases)
      occupied.set(normalizeName(alias), emoji.shortcode);
  }

  const customDefinitions = customEmojis.map((emoji) => {
    const canonicalName = assertName(emoji.shortcode, "Custom emoji shortcode");
    if (!emoji.src.trim()) {
      throw new Error(`Custom emoji :${canonicalName}: must have a source URL`);
    }

    const aliases = [
      canonicalName,
      ...(emoji.aliases ?? []).map((alias) =>
        assertName(alias, `Alias for :${canonicalName}:`),
      ),
    ];
    for (const alias of new Set(aliases)) {
      const existing = occupied.get(alias);
      if (existing) {
        throw new Error(
          `Emoji name :${alias}: for :${canonicalName}: conflicts with ${existing}`,
        );
      }
      occupied.set(alias, `:${canonicalName}:`);
    }

    return Object.freeze({
      aliases: Object.freeze([...new Set(aliases)]),
      name: emoji.name?.trim() || canonicalName,
      shortcode: `:${canonicalName}:`,
      source: "custom" as const,
      src: emoji.src,
    });
  });

  return createRegistry([...emojis, ...customDefinitions]);
}

export const defaultEmojiRegistry = createEmojiRegistry();

export function resolveEmoji(value: string, registry = defaultEmojiRegistry) {
  return registry.resolve(value);
}

export function normalizeShortcode(
  value: string,
  registry = defaultEmojiRegistry,
) {
  return registry.normalizeShortcode(value);
}

export function findEmojiShortcodes(
  value: string,
  registry = defaultEmojiRegistry,
) {
  return registry.findShortcodes(value);
}

export function searchEmojis(query: string, registry = defaultEmojiRegistry) {
  return registry.search(query);
}

export function getEmojiUrl(
  shortcode: string,
  registry = defaultEmojiRegistry,
) {
  return registry.resolve(shortcode)?.src;
}
