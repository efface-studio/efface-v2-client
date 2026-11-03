import type { BuildPart, BuildToken } from "./BuildMode.types";

// Enough of a JSX/TS lexer to colour the editor the way VS Code's Dark+ does:
// comments, strings, colours, tags, attributes, keys, keywords, numbers.
const LEX =
  /(\/\/[^\n]*|\{\/\*.*?\*\/\})|("(?:[^"\\]|\\.)*"|`[^`]*`)|(#[0-9a-fA-F]{6}\b)|(<\/?)([A-Za-z][\w.]*)|(\/?>)|(\b[a-zA-Z]+(?==))|(\b[a-z]\w*(?=:\s))|\b(export|default|return|import|from)\b|\b(function|const)\b|(\b\d+(?:\.\d+)?\b)|([{}()[\];,=.])/g;
const KINDS: (BuildToken["kind"] | "name")[] = [
  "comment",
  "str",
  "hex",
  "bracket",
  "name",
  "bracket",
  "attr",
  "key",
  "control",
  "keyword",
  "num",
  "punct",
];
const COLOR_STRING = /^"(#[0-9a-fA-F]{6}|rgba?\([^)]*\))"$/;

function lex(code: string): BuildToken[] {
  const out: BuildToken[] = [];
  let last = 0;
  for (const m of code.matchAll(LEX)) {
    if (m.index > last) {
      // The name after `function` is a function declaration.
      const gap = code.slice(last, m.index);
      out.push({ text: gap, kind: out.at(-1)?.text === "function" ? "fn" : "plain" });
    }
    const groups = m.slice(1);
    const at = groups.findIndex((g) => g !== undefined);
    const kind = KINDS[at];
    if (kind === "bracket" && groups[at + 1] !== undefined) {
      // `<Tag`: the bracket, then the name — a component when capitalised.
      const name = groups[at + 1];
      out.push({ text: groups[at], kind: "bracket" }, { text: name, kind: /^[A-Z]/.test(name) ? "component" : "tag" });
    } else if (kind === "str" && COLOR_STRING.test(m[0])) {
      // A colour written as a string gets its own token, so it can show a swatch.
      out.push({ text: '"', kind: "str" }, { text: m[0].slice(1, -1), kind: "hex" }, { text: '"', kind: "str" });
    } else out.push({ text: m[0], kind: kind === "name" ? "tag" : kind });
    last = m.index + m[0].length;
  }
  if (last < code.length) out.push({ text: code.slice(last), kind: "plain" });
  return out;
}

/**
 * A file's parts as editor tokens. Copy (`text` parts) is never lexed — it is
 * the page's words, typed as they read — so a "//" or a quote in it stays copy.
 */
export function tokenize(parts: BuildPart[]): BuildToken[] {
  return parts.flatMap((p) => (p.event === "text" ? [{ text: p.code, kind: "copy" as const }] : lex(p.code)));
}
