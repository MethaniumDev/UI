import { completionStatus, startCompletion } from "@codemirror/autocomplete";
import { Compartment, EditorState, Transaction } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { useEffect, useRef, type CSSProperties } from "react";

import { cn } from "../../lib/utils";
import { useEmojiRegistry } from "../emoji/context";
import type { EmojiRegistry } from "../emoji/registry";
import { createEmojiExtensions } from "./emoji";
import { createEditorExtensions, externalValueSync } from "./extensions";
import {
  refreshMediaEffect,
  type CropImage,
  type EditDrawing,
  type ResolveMedia,
} from "./rich-media";

export type InputController = {
  focus: () => void;
  hasFocus: () => boolean;
  insertText: (text: string) => void;
  insertTable: () => void;
  insertMath: (display?: boolean) => void;
  refreshMedia: () => void;
};

export type InputProps = {
  ref?: HTMLDivElement;
  placeholder?: string;
  value: string;
  setValue: (value: string) => void;
  onSubmit?: () => void;
  invertEnterBehavior?: boolean;
  fontSize?: CSSProperties["fontSize"];
  paddingX?: CSSProperties["padding"];
  paddingY?: CSSProperties["padding"];
  className?: string;
  emojiFrequencies?: Readonly<Record<string, number>>;
  onEmojiSelect?: (shortcode: string) => void;
  autoFocus?: boolean;
  onControllerChange?: (controller: InputController | null) => void;
  registry?: EmojiRegistry;
  resolveMedia?: ResolveMedia;
  onEditDrawing?: EditDrawing;
  onCropImage?: CropImage;
};

function toCssLength(value: CSSProperties["padding"]) {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

function toCssPadding(
  vertical: CSSProperties["padding"],
  horizontal: CSSProperties["padding"],
) {
  return `${toCssLength(vertical) ?? "0.25rem"} ${toCssLength(horizontal) ?? "0.625rem"}`;
}

export default function Input(props: InputProps) {
  const registry = useEmojiRegistry(props.registry);
  const elementRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | undefined>(undefined);
  const setValueRef = useRef(props.setValue);
  const onSubmitRef = useRef(props.onSubmit);
  const onEmojiSelectRef = useRef(props.onEmojiSelect);
  const invertEnterBehaviorRef = useRef(Boolean(props.invertEnterBehavior));
  const registryRef = useRef(registry);
  const emojiCompartmentRef = useRef<Compartment | null>(null);
  emojiCompartmentRef.current ??= new Compartment();
  const emojiCompartment = emojiCompartmentRef.current;

  useEffect(() => {
    setValueRef.current = props.setValue;
    onSubmitRef.current = props.onSubmit;
    onEmojiSelectRef.current = props.onEmojiSelect;
    invertEnterBehaviorRef.current = Boolean(props.invertEnterBehavior);
  }, [
    props.invertEnterBehavior,
    props.onEmojiSelect,
    props.onSubmit,
    props.setValue,
  ]);

  useEffect(() => {
    if (!elementRef.current) return;
    const state = EditorState.create({
      doc: props.value,
      extensions: createEditorExtensions(
        (value) => setValueRef.current(value),
        () => props.placeholder,
        () => invertEnterBehaviorRef.current,
        () => onSubmitRef.current,
        emojiCompartment,
        props.emojiFrequencies,
        (shortcode) => onEmojiSelectRef.current?.(shortcode),
        registry,
        () => registryRef.current,
        props.resolveMedia,
        props.onEditDrawing,
        props.onCropImage,
      ),
    });

    viewRef.current = new EditorView({ state, parent: elementRef.current });
    props.onControllerChange?.({
      focus: () => viewRef.current?.contentDOM.focus({ preventScroll: true }),
      hasFocus: () => viewRef.current?.hasFocus ?? false,
      insertText: (text) => {
        const editor = viewRef.current;
        if (!editor) return;
        editor.dispatch({
          ...editor.state.replaceSelection(text),
          annotations: Transaction.userEvent.of("input.type"),
          scrollIntoView: true,
        });
      },
      insertTable: () => {
        const editor = viewRef.current;
        if (!editor) return;
        editor.dispatch({
          ...editor.state.replaceSelection(
            "| Column 1 | Column 2 |\n| --- | --- |\n|  |  |\n",
          ),
          annotations: Transaction.userEvent.of("input.type"),
        });
        editor.focus();
      },
      insertMath: (display = false) => {
        const editor = viewRef.current;
        if (!editor) return;
        editor.dispatch({
          ...editor.state.replaceSelection(display ? "$$  $$" : "$  $"),
          annotations: Transaction.userEvent.of("input.type"),
        });
        editor.focus();
      },
      refreshMedia: () => {
        viewRef.current?.dispatch({ effects: refreshMediaEffect.of() });
      },
    });
    if (props.autoFocus) viewRef.current.focus();

    return () => {
      props.onControllerChange?.(null);
      viewRef.current?.destroy();
      viewRef.current = undefined;
    };
    // The editor instance intentionally lives for the lifetime of this component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const editor = viewRef.current;
    if (!editor) return;
    const current = editor.state.doc.toString();
    if (props.value === current) return;
    editor.dispatch({
      changes: { from: 0, to: current.length, insert: props.value },
      annotations: [
        externalValueSync.of(true),
        Transaction.addToHistory.of(false),
      ],
      filter: false,
    });
  }, [props.value]);

  useEffect(() => {
    registryRef.current = registry;
    const editor = viewRef.current;
    if (!editor) return;
    const wasActive = completionStatus(editor.state) === "active";
    editor.dispatch({
      effects: emojiCompartment.reconfigure(
        createEmojiExtensions(
          props.emojiFrequencies,
          (shortcode) => onEmojiSelectRef.current?.(shortcode),
          registry,
        ),
      ),
    });
    if (wasActive) startCompletion(editor);
  }, [emojiCompartment, props.emojiFrequencies, registry]);

  return (
    <div
      ref={elementRef}
      className={cn(
        "tm-md-root min-h-8 w-full min-w-0 text-base outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        props.className,
      )}
      style={
        {
          fontSize: props.fontSize ?? "1rem",
          "--tm-md-content-padding": toCssPadding(
            props.paddingY,
            props.paddingX,
          ),
        } as CSSProperties & { "--tm-md-content-padding"?: string }
      }
    />
  );
}
