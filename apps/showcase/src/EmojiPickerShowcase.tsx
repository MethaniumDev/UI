import { useState } from "react";
import { Blocks } from "lucide-react";
import { Button, EmojiPicker } from "@nonanium/ui";
import { createEmojiRegistry, Emoji } from "@nonanium/ui/markdown";

import nonaniumLogo from "../../../src/theme/assets/nonanium-logo.svg";

const registry = createEmojiRegistry({
  customCategories: [{ id: "nonanium", name: "Nonanium", icon: <Blocks /> }],
  customEmojis: [
    { shortcode: ":nona:", name: "Nona", src: nonaniumLogo },
    {
      shortcode: ":nonanium:",
      name: "Nonanium",
      src: nonaniumLogo,
      category: "nonanium",
    },
  ],
});

export function EmojiPickerShowcase() {
  const [selected, setSelected] = useState(":fire:");
  const [custom, setCustom] = useState(true);
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Emoji picker</h2>
      <div className="flex flex-wrap items-start gap-6">
        <EmojiPicker
          registry={custom ? registry : undefined}
          onEmojiSelect={(emoji) => setSelected(emoji.shortcode)}
        />
        <div className="flex max-w-sm flex-col gap-4 text-sm">
          <p className="text-muted-foreground">
            Search by shortcode, browse categories, or use the arrow keys to
            move between emojis. Hover or focus an emoji to preview it.
          </p>
          <div role="status" className="flex items-center gap-3">
            <Emoji
              registry={registry}
              shortcode={selected}
              className="size-8"
            />
            {selected}
          </div>
          <Button variant="outline" onClick={() => setCustom(!custom)}>
            {custom ? "Remove custom emojis" : "Add custom emojis"}
          </Button>
          <p className="text-muted-foreground">
            Custom categories come from the emoji registry. Each has its own
            name and icon below the custom emoji shortcut.
          </p>
        </div>
      </div>
    </section>
  );
}
