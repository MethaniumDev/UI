import type { CSSProperties } from "react";

import type { EmojiRegistry } from "./emoji-data";
import { Markdown } from "./markdown";

export type TextProps = {
  fontSize?: CSSProperties["fontSize"];
  registry?: EmojiRegistry;
  value: string;
};

export default function Text({ fontSize, registry, value }: TextProps) {
  return (
    <Markdown
      content={value}
      registry={registry}
      variant="compact"
      style={{ fontSize: fontSize ?? "1rem" }}
    />
  );
}
