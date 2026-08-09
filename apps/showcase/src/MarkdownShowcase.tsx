import { Markdown } from "@methanium/ui";
import {
  createEmojiRegistry,
  EmojiProvider,
  Input,
  Text,
  type InputController,
} from "@methanium/ui/markdown";
import { useRef, useState } from "react";

import methaniumLogo from "../../../src/theme/assets/methanium-logo.svg";

const emojiRegistry = createEmojiRegistry({
  customEmojis: [
    {
      shortcode: ":methanium:",
      name: "Methanium",
      aliases: [":meth:"],
      src: methaniumLogo,
    },
  ],
});

const markdownContent = [
  "# Complete Markdown showcase",
  "",
  "This page exercises the default Markdown renderers. It includes **bold text**, *emphasis*, ~~strikethrough~~, and `inline code` in one paragraph.",
  "",
  "Shortcodes use local Twemoji assets :fire: :white_check_mark:, while applications can register their own images :methanium:.",
  "",
  "Visit the [Methanium](https://methanium.net) or jump to the [code examples](#code-examples). Bare URLs are supported too: https://example.com.",
  "",
  "![Methanium logo](" + methaniumLogo + ")",
  "",
  "## Headings",
  "",
  "### Third-level heading",
  "",
  "#### Fourth-level heading",
  "",
  "##### Fifth-level heading",
  "",
  "###### Sixth-level heading",
  "",
  "Headings receive stable IDs and reveal a link anchor when hovered or focused.",
  "",
  "## Lists",
  "",
  "- Unordered list item",
  "- Another item with nested content",
  "  - Nested item",
  "  - Another nested item",
  "",
  "1. First ordered item",
  "2. Second ordered item",
  "3. Third ordered item",
  "",
  "- [x] Completed task",
  "- [ ] Pending task",
  "- [ ] Another pending task",
  "",
  "## Blockquote",
  "",
  "> Good interfaces make common actions obvious and uncommon actions possible.",
  ">",
  "> A blockquote can contain multiple paragraphs and **formatted text**.",
  "",
  "## Table",
  "",
  "| Component | Source | Styling |",
  "| :--- | :---: | ---: |",
  "| Heading | `components.tsx` | Tailwind |",
  "| Code block | `code-block.tsx` | Tailwind |",
  "| Shiki theme | `index.css` | CSS variables |",
  "",
  "---",
  "",
  "## Math",
  "",
  "Inline math renders inside a sentence: $E = mc^2$.",
  "",
  "$$",
  "\\int_{-\\infty}^{\\infty} e^{-x^2} \\, dx = \\sqrt{\\pi}",
  "$$",
  "",
  "## Code examples",
  "",
  "The first block includes a filename, line numbers, and highlighted lines.",
  "",
  '```tsx title="greeting.tsx" {4,7-9} showLineNumbers',
  "type GreetingProps = {",
  "  name: string;",
  "};",
  "",
  "export function Greeting({ name }: GreetingProps) {",
  "  return (",
  '    <p className="text-lg">',
  "      Hello, <strong>{name}</strong>!",
  "    </p>",
  "  );",
  "}",
  "```",
  "",
  "A supported language without metadata:",
  "",
  "```nix",
  "{ pkgs, ... }: {",
  "  environment.systemPackages = [ pkgs.git ];",
  "}",
  "```",
  "",
  "An unknown language falls back to plain text:",
  "",
  "```made-up-language",
  "the syntax highlighter does not know this language",
  "```",
  "",
  "## Footnotes",
  "",
  "Markdown can keep supporting details out of the main flow.[^details] It can also reuse a longer note.[^long-note]",
  "",
  "[^details]: This is a short footnote.",
  "[^long-note]: This footnote contains enough text to demonstrate wrapping and the generated back-reference link.",
].join("\n");

function MarkdownShowcase() {
  const [inputValue, setInputValue] = useState(
    'Hello **Markdown** :fire:\n\nTry the custom :methanium: emoji or type another `:shortcode:`. \n```ts\nconst stuff = "stuff";\n```',
  );
  const controllerRef = useRef<InputController | null>(null);

  return (
    <EmojiProvider registry={emojiRegistry}>
      <div className="flex min-w-0 flex-col gap-3 min-w-0 rounded-lg border bg-muted/20 p-4">
        <p>Cool input box</p>
        <Input
          className="min-h-28 "
          value={inputValue}
          setValue={setInputValue}
          placeholder="Write Markdown or type :fire:"
          emojiFrequencies={{ ":methanium:": 20, ":fire:": 10 }}
          onControllerChange={(controller) => {
            controllerRef.current = controller;
          }}
        />
        <p>And it's output</p>
        <Text value={inputValue} />
      </div>

      <Markdown content={markdownContent} className="mx-auto max-w-4xl" />
    </EmojiProvider>
  );
}

export { MarkdownShowcase };
