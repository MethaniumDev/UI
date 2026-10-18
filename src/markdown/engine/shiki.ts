import type { Element, Root } from "hast";
import {
  createCssVariablesTheme,
  createHighlighterCore,
  type HighlighterCore,
  type LanguageInput,
} from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

const THEME_NAME = "nonanium-css";
const CACHE_LIMIT = 200;

export type HighlightedCodeToken = {
  color?: string;
  content: string;
  fontStyle?: number;
  offset: number;
};

export const shikiPreClassName =
  "shiki m-0 w-max min-w-full bg-[var(--markdown-code-background,var(--markdown-code-background-default))]! font-mono text-[0.82rem]/[1.7] text-[var(--markdown-code-foreground)]! [tab-size:2]";
export const shikiLineClassNames =
  "line -mx-4 inline-block min-w-full px-4 group-data-[line-numbers]/code-block:before:inline-block group-data-[line-numbers]/code-block:before:w-10 group-data-[line-numbers]/code-block:before:pe-4 group-data-[line-numbers]/code-block:before:text-end group-data-[line-numbers]/code-block:before:text-muted-foreground group-data-[line-numbers]/code-block:before:select-none group-data-[line-numbers]/code-block:before:content-[attr(data-line)]";
export const highlightedLineClassNames =
  "bg-primary/12 shadow-[inset_0.18rem_0_var(--primary-foreground-alt)]";

const aliases: Record<string, string> = {
  "c++": "cpp",
  cjs: "javascript",
  gql: "graphql",
  html: "html",
  js: "javascript",
  javascript: "javascript",
  jsx: "jsx",
  markdown: "markdown",
  md: "markdown",
  mjs: "javascript",
  nix: "nix",
  py: "python",
  rs: "rust",
  sh: "shellscript",
  shell: "shellscript",
  bash: "shellscript",
  ts: "typescript",
  tsx: "tsx",
  typescript: "typescript",
  yml: "yaml",
};

const lazyLanguages: Record<string, LanguageInput> = {
  c: () => import("@shikijs/langs/c"),
  cpp: () => import("@shikijs/langs/cpp"),
  diff: () => import("@shikijs/langs/diff"),
  dockerfile: () => import("@shikijs/langs/dockerfile"),
  go: () => import("@shikijs/langs/go"),
  graphql: () => import("@shikijs/langs/graphql"),
  java: () => import("@shikijs/langs/java"),
  kotlin: () => import("@shikijs/langs/kotlin"),
  lua: () => import("@shikijs/langs/lua"),
  python: () => import("@shikijs/langs/python"),
  rust: () => import("@shikijs/langs/rust"),
  sql: () => import("@shikijs/langs/sql"),
};

const supportedLanguages = new Set([
  ...Object.values(aliases),
  ...Object.keys(lazyLanguages),
  "css",
  "json",
  "toml",
  "yaml",
]);
const cache = new Map<string, Root>();
const loadingLanguages = new Map<string, Promise<void>>();
let highlighterPromise: Promise<HighlighterCore> | undefined;

function getHighlighter() {
  highlighterPromise ??= createHighlighterCore({
    engine: createJavaScriptRegexEngine({ target: "auto" }),
    themes: [
      createCssVariablesTheme({
        name: THEME_NAME,
        variablePrefix: "--markdown-code-",
        variableDefaults: {
          background: "transparent",
          foreground: "var(--foreground)",
        },
        fontStyle: true,
      }),
    ],
    langs: [
      import("@shikijs/langs/nix"),
      import("@shikijs/langs/javascript"),
      import("@shikijs/langs/typescript"),
      import("@shikijs/langs/jsx"),
      import("@shikijs/langs/tsx"),
      import("@shikijs/langs/json"),
      import("@shikijs/langs/shellscript"),
      import("@shikijs/langs/html"),
      import("@shikijs/langs/css"),
      import("@shikijs/langs/markdown"),
      import("@shikijs/langs/yaml"),
      import("@shikijs/langs/toml"),
    ],
  });
  return highlighterPromise;
}

function normalizeLanguage(language?: string) {
  const normalized = language?.trim().toLowerCase();
  if (!normalized) return undefined;
  return aliases[normalized] ?? normalized;
}

async function ensureLanguage(highlighter: HighlighterCore, language: string) {
  if (highlighter.getLoadedLanguages().includes(language)) return;
  const loader = lazyLanguages[language];
  if (!loader) return;

  let pending = loadingLanguages.get(language);
  if (!pending) {
    pending = highlighter.loadLanguage(loader).then(() => undefined);
    loadingLanguages.set(language, pending);
  }
  await pending;
}

function addClassNames(node: Element, classNames: string) {
  const current = node.properties.className ?? node.properties.class;
  const classes = Array.isArray(current)
    ? current.map(String)
    : current === undefined
      ? []
      : [String(current)];
  node.properties.className = [...classes, ...classNames.split(" ")];
}

function decorateTree(tree: Root, highlightedLines: ReadonlySet<number>) {
  const pre = tree.children.find(
    (node): node is Element =>
      node.type === "element" && node.tagName === "pre",
  );
  if (pre) addClassNames(pre, shikiPreClassName);

  const code = pre?.children.find(
    (node): node is Element =>
      node.type === "element" && node.tagName === "code",
  );
  let line = 0;
  for (const node of code?.children ?? []) {
    if (node.type !== "element") continue;
    const className = node.properties.className ?? node.properties.class;
    const classes = Array.isArray(className)
      ? className.map(String)
      : className === undefined
        ? []
        : [String(className)];
    if (!classes.includes("line")) continue;
    line += 1;
    node.properties["data-line"] = String(line);
    addClassNames(node, shikiLineClassNames);
    if (highlightedLines.has(line))
      addClassNames(node, highlightedLineClassNames);
  }
}

export function isSupportedLanguage(language?: string) {
  const normalized = normalizeLanguage(language);
  return normalized !== undefined && supportedLanguages.has(normalized);
}

export async function highlightCodeTokens(
  code: string,
  language: string,
): Promise<HighlightedCodeToken[] | null> {
  const normalized = normalizeLanguage(language);
  if (!normalized || !supportedLanguages.has(normalized)) return null;

  const highlighter = await getHighlighter();
  await ensureLanguage(highlighter, normalized);
  return highlighter
    .codeToTokens(code, { lang: normalized, theme: THEME_NAME })
    .tokens.flatMap((line) =>
      line.map(({ color, content, fontStyle, offset }) => ({
        color,
        content,
        fontStyle,
        offset,
      })),
    );
}

export async function highlightCode(
  code: string,
  language: string,
  highlightedLines: ReadonlySet<number>,
) {
  const normalized = normalizeLanguage(language);
  if (!normalized || !supportedLanguages.has(normalized)) return null;

  const highlighted = [...highlightedLines].sort((left, right) => left - right);
  const key = JSON.stringify([code, normalized, highlighted]);
  const cached = cache.get(key);
  if (cached) {
    cache.delete(key);
    cache.set(key, cached);
    return cached;
  }

  const highlighter = await getHighlighter();
  await ensureLanguage(highlighter, normalized);
  const tree = highlighter.codeToHast(code, {
    lang: normalized,
    theme: THEME_NAME,
  });
  decorateTree(tree, highlightedLines);
  cache.set(key, tree);
  if (cache.size > CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  return tree;
}
