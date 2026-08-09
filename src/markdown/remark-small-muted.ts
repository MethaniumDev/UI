import type { Emphasis, Parent, Root, Text } from "mdast";
import { SKIP, visit } from "unist-util-visit";

const delimiter = "??++";

export function remarkSmallMuted() {
  return (tree: Root) => {
    visit(tree, "text", (node: Text, index, parent: Parent | undefined) => {
      if (index === undefined || !parent) return;

      const children: Parent["children"] = [];
      let cursor = 0;
      let opening = node.value.indexOf(delimiter);

      while (opening !== -1) {
        const contentStart = opening + delimiter.length;
        const closing = node.value.indexOf(delimiter, contentStart);
        if (closing === -1) break;

        if (opening > cursor) {
          children.push({ type: "text", value: node.value.slice(cursor, opening) });
        }
        children.push({
          type: "emphasis",
          children: [{ type: "text", value: node.value.slice(contentStart, closing) }],
          data: {
            hName: "span",
            hProperties: { className: ["text-xs", "text-muted-foreground"] },
          },
        } satisfies Emphasis);

        cursor = closing + delimiter.length;
        opening = node.value.indexOf(delimiter, cursor);
      }

      if (children.length === 0) return;
      if (cursor < node.value.length) {
        children.push({ type: "text", value: node.value.slice(cursor) });
      }

      parent.children.splice(index, 1, ...children);
      return [SKIP, index + children.length];
    });
  };
}
