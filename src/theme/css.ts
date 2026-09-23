import type { Theme, ThemeModeScope, ThemeRule, ThemeTokens } from "./types";

export const THEME_STYLE_ELEMENT_ID = "methanium-theme-style";

/** Ids that are safe to embed into a CSS attribute selector. */
export function isSafeThemeId(id: string) {
  return /^[A-Za-z0-9_-]+$/.test(id);
}

function qualifier(id: string, mode: ThemeModeScope) {
  const scope = isSafeThemeId(id) ? `:root[data-theme="${id}"]` : ":root";
  if (mode === "dark") return `:root.dark${scope.slice(5)}`;
  if (mode === "light") return `:root:not(.dark)${scope.slice(5)}`;
  return scope;
}

/** Splits a selector list on commas that are not nested in brackets/parens. */
export function splitTopLevelComma(selector: string) {
  const parts: string[] = [];
  let current = "";
  let depth = 0;
  let quote: string | null = null;
  for (const char of selector) {
    if (quote) {
      current += char;
      if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
    } else if (char === "(" || char === "[") {
      depth += 1;
    } else if (char === ")" || char === "]") {
      depth = Math.max(0, depth - 1);
    } else if (char === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function qualifySelector(selector: string, id: string, mode: ThemeModeScope) {
  const root = qualifier(id, mode);
  return splitTopLevelComma(selector)
    .map((part) =>
      part.includes("&") ? part.replaceAll("&", root) : `${root} ${part}`,
    )
    .join(",\n");
}

function indent(text: string, prefix = "  ") {
  return text
    .split("\n")
    .map((line) => (line.trim() ? prefix + line : line))
    .join("\n");
}

export function renderRule(rule: ThemeRule, id: string) {
  const selector = qualifySelector(rule.selector, id, rule.mode);
  const declarations = rule.declarations.trim();
  if (!selector || !declarations) return "";
  const block = `${selector} {\n${indent(declarations)}\n}`;
  return rule.layer?.trim()
    ? `@layer ${rule.layer.trim()} {\n${indent(block)}\n}`
    : block;
}

function renderTokens(tokens: ThemeTokens, id: string, mode: ThemeModeScope) {
  const entries = Object.entries(tokens).filter(([, value]) => value.trim());
  if (!entries.length) return "";
  const body = entries.map(([name, value]) => `${name}: ${value};`).join("\n");
  return `${qualifier(id, mode)} {\n${indent(body)}\n}`;
}

/**
 * Renders the complete stylesheet for a theme: light tokens, dark tokens,
 * then its rules in stored order. Only the active theme is ever rendered,
 * so nothing needs scoping beyond the theme qualifier.
 */
export function renderThemeCss(theme: Theme) {
  const blocks = [
    renderTokens(theme.tokens.light, theme.id, "both"),
    renderTokens(theme.tokens.dark, theme.id, "dark"),
    ...theme.rules.map((rule) => renderRule(rule, theme.id)),
  ].filter(Boolean);
  return blocks.join("\n\n");
}
