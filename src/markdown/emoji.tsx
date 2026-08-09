import { useEffect, useState } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "../cmp/tooltip";
import { useEmojiRegistry } from "./emoji-context";
import type { EmojiRegistry } from "./emoji-data";

export type EmojiProps = {
  className?: string;
  registry?: EmojiRegistry;
  shortcode: string;
  tooltip?: boolean;
};

export default function Emoji({
  className = "size-6",
  registry: registryOverride,
  shortcode,
  tooltip = true,
}: EmojiProps) {
  const registry = useEmojiRegistry(registryOverride);
  const emoji = registry.resolve(shortcode);
  const [failedSource, setFailedSource] = useState<string>();

  useEffect(() => setFailedSource(undefined), [emoji?.src]);

  if (!emoji || failedSource === emoji.src) return <span>{shortcode}</span>;

  const image = (
    <img
      alt={emoji.shortcode}
      className={className}
      decoding="async"
      draggable={false}
      loading="lazy"
      src={emoji.src}
      onError={() => setFailedSource(emoji.src)}
    />
  );

  if (!tooltip) return image;

  return (
    <Tooltip>
      <TooltipTrigger render={image} />
      <TooltipContent sideOffset={8}>{emoji.shortcode}</TooltipContent>
    </Tooltip>
  );
}
