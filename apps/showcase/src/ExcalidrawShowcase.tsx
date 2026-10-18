import { useState } from "react";
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";
import {
  Excalidraw,
  createExcalidrawButton,
  type ExcalidrawImperativeAPI,
} from "@nonanium/ui/excalidraw";

const initialScene = {
  elements: convertToExcalidrawElements([
    { type: "rectangle", x: 140, y: 120, width: 180, height: 100 },
    { type: "ellipse", x: 420, y: 150, width: 140, height: 90 },
  ]),
};

export function ExcalidrawShowcase() {
  const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null);

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">Excalidraw</h2>
      <p className="text-sm text-muted-foreground">
        Use the sigma button to insert LaTeX. Double-click an inserted formula
        to edit it, and the Clear button is a custom top-right button.
      </p>
      <div className="h-120 overflow-hidden rounded-lg border">
        <Excalidraw
          className="h-full"
          initialData={initialScene}
          excalidrawAPI={setApi}
          renderTopRightUI={() =>
            createExcalidrawButton({
              label: "Clear",
              onClick: () => api?.resetScene(),
            })
          }
        />
      </div>
    </section>
  );
}
