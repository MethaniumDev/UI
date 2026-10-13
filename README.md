# Methanium UI

```sh
pnpm install https://git.methanium.net/methanium/ui/releases/download/latest/methanium-ui.tgz
```

## Excalidraw

The `@methanium/ui/excalidraw` subpath exports a thin wrapper around `@excalidraw/excalidraw` with a built-in LaTeX math button. Everything else (persistence, collaboration) stays app-side.

```tsx
import { Excalidraw, type ExcalidrawImperativeAPI } from "@methanium/ui/excalidraw";

<Excalidraw
  className="h-[480px]" // the container needs an explicit size
  onChange={(elements, appState, files) => save(elements, appState, files)}
  excalidrawAPI={(api) => (apiRef.current = api)}
/>
```

Props are the upstream `ExcalidrawProps` plus `className` for the container and `disableMath` (default false). Theming follows the root `.dark` class that the library's ThemeProvider maintains; an explicit `theme` prop wins.

### Math

The sigma button in the top-right converts TeX to SVG with `mathjax-full` and inserts it as an image element at the viewport center. The TeX source is kept in the element's `customData.math`, so double-clicking a selected formula reopens the editor with it. `disableMath` removes the button and the double-click behavior.

The conversion is also available standalone:

```ts
import { texToSvg } from "@methanium/ui/excalidraw";

const svg = texToSvg("\\frac{a}{b}"); // { dataURL, width, height } | null
```

### Custom buttons

`createExcalidrawButton` builds a button matching excalidraw's island style. Place it via `renderTopRightUI` or as `Excalidraw` children, closing over the API yourself.

```tsx
import { createExcalidrawButton } from "@methanium/ui/excalidraw";

<Excalidraw
  renderTopRightUI={() =>
    createExcalidrawButton({
      label: "Clear",
      onClick: () => apiRef.current?.resetScene(),
    })
  }
/>
```

Pass `children` (and optionally `open` / `onOpenChange` for controlled mode) to get a popover panel instead of a click handler; it closes on outside clicks and Escape.

### CSS

Vite consumers get the excalidraw styles automatically through the component import. Elsewhere add:

```ts
import "@excalidraw/excalidraw/index.css";
```

