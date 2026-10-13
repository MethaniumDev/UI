import { useEffect, useState, type RefObject } from "react";
import {
  CaptureUpdateAction,
  convertToExcalidrawElements,
  newElementWith,
  viewportCoordsToSceneCoords,
} from "@excalidraw/excalidraw";
import type {
  BinaryFileData,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";
import type {
  ExcalidrawImageElement,
  FileId,
} from "@excalidraw/excalidraw/element/types";
import { mathjax } from "mathjax-full/js/mathjax.js";
import { TeX } from "mathjax-full/js/input/tex.js";
import { SVG } from "mathjax-full/js/output/svg.js";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import type { LiteElement } from "mathjax-full/js/adaptors/lite/Element.js";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html.js";

import { createExcalidrawButton } from "./button";

export type TexSvg = { dataURL: string; width: number; height: number };

export type MathController = { open: (tex: string) => void };

// Metrics are em: 20, ex: 10, so one ex unit in the emitted svg equals 10px.
const EX_SIZE_PX = 10;

let mathDocument: ReturnType<typeof mathjax.document> | null = null;
let mathAdaptor: ReturnType<typeof liteAdaptor> | null = null;

export function texToSvg(tex: string): TexSvg | null {
  if (!mathDocument || !mathAdaptor) {
    mathAdaptor = liteAdaptor();
    RegisterHTMLHandler(mathAdaptor);
    mathDocument = mathjax.document("", {
      InputJax: new TeX(),
      OutputJax: new SVG({ fontCache: "local" }),
    });
  }
  let node: ReturnType<typeof mathDocument.convert>;
  try {
    node = mathDocument.convert(tex, {
      em: 20,
      ex: EX_SIZE_PX,
      containerWidth: 1600,
    });
  } catch {
    return null;
  }
  if (mathAdaptor.outerHTML(node).includes("data-mjx-error")) return null;
  const svg = mathAdaptor.firstChild(node) as LiteElement;
  const width =
    parseFloat(mathAdaptor.getAttribute(svg, "width") ?? "") * EX_SIZE_PX;
  const height =
    parseFloat(mathAdaptor.getAttribute(svg, "height") ?? "") * EX_SIZE_PX;
  if (!(width > 0) || !(height > 0)) return null;
  mathAdaptor.setAttribute(svg, "width", `${width}px`);
  mathAdaptor.setAttribute(svg, "height", `${height}px`);
  return {
    dataURL: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(mathAdaptor.outerHTML(svg))}`,
    width,
    height,
  };
}

/** Returns the selected element if exactly one selected element is a formula. */
export function findSelectedMathElement(api: ExcalidrawImperativeAPI) {
  const { selectedElementIds } = api.getAppState();
  const matches = api
    .getSceneElements()
    .filter(
      (element) =>
        !element.isDeleted &&
        selectedElementIds[element.id] &&
        typeof element.customData?.math === "string",
    );
  return matches.length === 1 ? matches[0] : null;
}

function toBinaryFile(fileId: FileId, image: TexSvg): BinaryFileData {
  return {
    mimeType: "image/svg+xml",
    id: fileId,
    dataURL: image.dataURL as BinaryFileData["dataURL"],
    created: Date.now(),
  };
}

function insertMath(api: ExcalidrawImperativeAPI, tex: string, image: TexSvg) {
  const fileId = crypto.randomUUID() as FileId;
  api.addFiles([toBinaryFile(fileId, image)]);
  const appState = api.getAppState();
  const center = viewportCoordsToSceneCoords(
    {
      clientX: appState.offsetLeft + appState.width / 2,
      clientY: appState.offsetTop + appState.height / 2,
    },
    appState,
  );
  const [element] = convertToExcalidrawElements([
    {
      type: "image",
      fileId,
      x: center.x - image.width / 2,
      y: center.y - image.height / 2,
      width: image.width,
      height: image.height,
      customData: { math: tex },
    },
  ]);
  if (!element) return;
  api.updateScene({
    elements: [...api.getSceneElementsIncludingDeleted(), element],
    appState: { selectedElementIds: { [element.id]: true as const } },
    captureUpdate: CaptureUpdateAction.IMMEDIATELY,
  });
}

function replaceMath(
  api: ExcalidrawImperativeAPI,
  elementId: string,
  tex: string,
  image: TexSvg,
) {
  // addFiles never updates an existing fileId, so re-rendered formulas get a
  // fresh id and the previous file becomes an orphan.
  const fileId = crypto.randomUUID() as FileId;
  api.addFiles([toBinaryFile(fileId, image)]);
  api.updateScene({
    elements: api.getSceneElementsIncludingDeleted().map((element) =>
      element.id === elementId && element.type === "image"
        ? newElementWith(element, {
            fileId,
            x: element.x + (element.width - image.width) / 2,
            y: element.y + (element.height - image.height) / 2,
            width: image.width,
            height: image.height,
            customData: { ...element.customData, math: tex },
          })
        : element,
    ),
    captureUpdate: CaptureUpdateAction.IMMEDIATELY,
  });
}

function SigmaIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 7V4H6l6 8-6 8h12v-3" />
    </svg>
  );
}

export function MathButton({
  apiRef,
  controllerRef,
}: {
  apiRef: RefObject<ExcalidrawImperativeAPI | null>;
  controllerRef: RefObject<MathController | null>;
}) {
  const [open, setOpen] = useState(false);
  const [tex, setTex] = useState("");
  const [preview, setPreview] = useState<{ tex: string; image: TexSvg } | null>(
    null,
  );

  useEffect(() => {
    controllerRef.current = {
      open: (next) => {
        setTex(next);
        setOpen(true);
      },
    };
    return () => {
      controllerRef.current = null;
    };
  }, [controllerRef]);

  useEffect(() => {
    if (!tex) {
      setPreview(null);
      return;
    }
    const timer = setTimeout(() => {
      const image = texToSvg(tex);
      setPreview(image ? { tex, image } : null);
    }, 250);
    return () => clearTimeout(timer);
  }, [tex]);

  // Ignore previews that lag behind the current input.
  const image = preview?.tex === tex ? preview.image : null;

  const apply = () => {
    const api = apiRef.current;
    if (!api || !image) return;
    const selected = findSelectedMathElement(api);
    if (selected) replaceMath(api, selected.id, tex, image);
    else insertMath(api, tex, image);
    setOpen(false);
  };

  return createExcalidrawButton({
    icon: <SigmaIcon />,
    label: "Math",
    active: open,
    open,
    onOpenChange: setOpen,
    children: (
      <>
        <textarea
          value={tex}
          placeholder="x^2 or \frac{a}{b}"
          onChange={(event) => setTex(event.target.value)}
        />
        <div className="methanium-excalidraw-popover-preview">
          {image ? (
            <img
              src={image.dataURL}
              width={image.width}
              height={image.height}
              alt="Formula preview"
            />
          ) : tex ? (
            <span className="methanium-excalidraw-popover-error">
              Invalid formula
            </span>
          ) : null}
        </div>
        <div className="methanium-excalidraw-popover-actions">
          <button
            type="button"
            className="methanium-excalidraw-popover-insert"
            disabled={!image}
            onClick={apply}
          >
            Insert
          </button>
        </div>
      </>
    ),
  });
}
