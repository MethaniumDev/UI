import type { Image, Parent, Root, Text } from "mdast";
import { SKIP, visit } from "unist-util-visit";

import type { EmojiRegistry } from "./registry";

export function remarkEmoji({ registry }: { registry: EmojiRegistry }) {
  return (tree: Root) => {
    visit(tree, "text", (node: Text, index, parent: Parent | undefined) => {
      if (index === undefined || !parent) return;
      const matches = registry.findShortcodes(node.value);
      if (matches.length === 0) return;

      const children: Parent["children"] = [];
      let cursor = 0;
      for (const match of matches) {
        if (match.from > cursor) {
          children.push({
            type: "text",
            value: node.value.slice(cursor, match.from),
          });
        }
        children.push({
          type: "image",
          url: match.emoji.src,
          alt: match.emoji.shortcode,
          data: {
            hProperties: {
              dataEmoji: match.emoji.shortcode,
            },
          },
        } satisfies Image);
        cursor = match.to;
      }
      if (cursor < node.value.length) {
        children.push({ type: "text", value: node.value.slice(cursor) });
      }

      parent.children.splice(index, 1, ...children);
      return [SKIP, index + children.length];
    });
  };
}
