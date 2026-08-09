# Methanium UI

```sh
pnpm install https://git.methanium.net/methanium/ui/releases/download/latest/methanium-ui.tgz
```

## Markdown

The renderer is available from the package root. The live editor, compact text
renderer, and emoji APIs use the `@methanium/ui/markdown` entry point.

```tsx
import { Markdown } from "@methanium/ui";
import {
  EmojiProvider,
  Input,
  createEmojiRegistry,
} from "@methanium/ui/markdown";

const registry = createEmojiRegistry({
  customEmojis: [
    {
      shortcode: ":party_parrot:",
      aliases: [":parrot_party:"],
      src: "/emoji/party-parrot.webp",
    },
  ],
});

<EmojiProvider registry={registry}>
  <Input value={value} setValue={setValue} />
  <Markdown content={value} />
</EmojiProvider>;
```

Custom shortcodes and aliases must be unique and may not collide with built-in
Twemoji names. Twemoji graphics are bundled locally and do not use a CDN. The
graphics are provided by the [Twemoji project](https://github.com/jdecked/twemoji)
under CC-BY 4.0; code is licensed under MIT.
