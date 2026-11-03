import type { BuildToken } from "./BuildMode.types";

// Enough of a TSX lexer to colour the editor: comments, strings, tags,
// attributes, keys, keywords, calls, numbers and punctuation. A `//` straight
// after `>`, `:` or a word is copy or a URL, not a comment.
const RULES: [BuildToken["kind"] | "tagOpen", RegExp][] = [
  ["comment", /\{\/\*[\s\S]*?\*\/\}|\/\*[\s\S]*?\*\/|(?<![>:\w"'/])\/\/[^\n]*/],
  ["str", /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`[^`]*`/],
  ["tagOpen", /<\/?[A-Za-z][\w.]*/],
  ["bracket", /\/?>/],
  ["attr", /\b[a-zA-Z][\w-]*(?==[{"'])/],
  ["key", /\b[a-zA-Z_]\w*(?=:\s)/],
  ["control", /\b(?:export|default|return|import|from|if|else|as)\b/],
  ["keyword", /\b(?:function|const|let|new|true|false|null|undefined|typeof|void)\b/],
  ["fn", /\b[a-zA-Z_]\w*(?=\()/],
  ["num", /\b\d+(?:\.\d+)?\b/],
  ["punct", /=>|[{}()[\];,.?:=!&|+*%]/],
];
const LEX = new RegExp(RULES.map(([, r]) => `(${r.source})`).join("|"), "g");
const COLOR_STRING = /^["'](#[0-9a-fA-F]{3,8}|rgba?\([^)]*\))["']$/;

/** The source as editor tokens; everything between matches is plain. */
export function tokenize(code: string): BuildToken[] {
  const out: BuildToken[] = [];
  let last = 0;
  for (const m of code.matchAll(LEX)) {
    if (m.index > last) out.push({ text: code.slice(last, m.index), kind: "plain" });
    const kind = RULES[m.slice(1).findIndex((g) => g !== undefined)][0];
    if (kind === "tagOpen") {
      // `<Tag`: the bracket, then the name — a component when capitalised.
      const name = m[0].replace(/^<\/?/, "");
      out.push(
        { text: m[0].slice(0, m[0].length - name.length), kind: "bracket" },
        { text: name, kind: /^[A-Z]/.test(name) ? "component" : "tag" }
      );
    } else if (kind === "str" && COLOR_STRING.test(m[0])) {
      // A colour written as a string gets its own token, so it can show a swatch.
      const q = m[0][0];
      out.push({ text: q, kind: "str" }, { text: m[0].slice(1, -1), kind: "hex" }, { text: q, kind: "str" });
    } else out.push({ text: m[0], kind });
    last = m.index + m[0].length;
  }
  if (last < code.length) out.push({ text: code.slice(last), kind: "plain" });
  return out;
}
