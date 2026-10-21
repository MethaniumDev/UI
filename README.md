# Nonanium UI

```sh
pnpm install https://github.com/nonanium/UI/releases/latest/download/nonanium-ui.tgz
```

## Error screen

`ErrorScreen` displays a large `GlobeOff` icon, an error heading, an optional description, and a service status link.

```tsx
import { Button, ErrorScreen } from "@nonanium/ui";

<ErrorScreen
  error="Connection failed"
  description="Check your connection and try again."
  onRetry={reconnect}
  actions={
    <Button variant="outline" onClick={reset}>
      Reset local data
    </Button>
  }
  statusLink={false}
/>;
```

- `onRetry` shows a recovery button. `retryLabel` defaults to `Retry`.
- `actions` accepts additional controls beside the retry button, stacked on small screens.
- `statusLink` defaults to `status.nonanium.net`. Pass `false` to hide it, or `{ label, link }` to customize it.
- `icon` replaces the default decorative icon.
- `fullScreen` defaults to `true`, including desktop window controls and safe-area spacing. Set it to `false` to embed the error in an existing layout.
- `className` styles the outer container. `description` accepts React content.
- `footer` adds a fixed bottom-left recovery hint. Wrap the application in `ErrorScreenProvider` with a `footer` prop to supply it to every error screen, including errors rendered before app initialization completes.

## Excalidraw

The `@nonanium/ui/excalidraw` subpath exports a thin wrapper around `@excalidraw/excalidraw` with a built-in LaTeX math button. Everything else (persistence, collaboration) stays app-side.

```tsx
import { Excalidraw, type ExcalidrawImperativeAPI } from "@nonanium/ui/excalidraw";

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
import { texToSvg } from "@nonanium/ui/excalidraw";

const svg = texToSvg("\\frac{a}{b}"); // { dataURL, width, height } | null
```

### Custom buttons

`createExcalidrawButton` builds a button matching excalidraw's island style. Place it via `renderTopRightUI` or as `Excalidraw` children, closing over the API yourself.

```tsx
import { createExcalidrawButton } from "@nonanium/ui/excalidraw";

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
