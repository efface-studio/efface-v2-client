import { tokenize } from "./highlight";
import { COMMENT_COST, NEWLINE_COST } from "./BuildMode.constants";
import type { BuildEvent, BuildFile, BuildSource } from "./BuildMode.types";

// Copy as the JSX renders it: a `t("key")` / `t.raw("key")` call, or a bare
// `{value}` / `{item.value}` child between tags.
const COPY = /\bt(?:\.raw)?\("[^"]+"\)|(?<=[>\s])\{[a-zA-Z_]\w*(?:\.\w+)*\}(?=\s*(?:<|$))/gm;

/**
 * A component's real source, readied for typing, with the preview's stages
 * pinned to it: outlines from the first character, letters as the copy goes
 * in, colour once the last of it is in, media halfway from there to the end.
 */
export function toBuildFile(source: BuildSource): BuildFile {
  const lineNumbers: number[] = [];
  const folds: number[] = [];
  source.blocks.forEach((b, i) => {
    const count = b.code.split("\n").length;
    for (let k = 0; k < count; k++) lineNumbers.push(b.start + k);
    if (i < source.blocks.length - 1) folds.push(lineNumbers.length - 1);
  });
  const code = source.blocks.map((b) => b.code).join("\n");

  const copy = [...code.matchAll(COPY)];
  // Letters fill from the first piece of copy to the end of the last, over at
  // least a third of the file (a block may render all its copy in one `{body}`).
  const copyEnd = copy.length ? copy[copy.length - 1].index + copy[copy.length - 1][0].length : Math.round(code.length * 0.6);
  const copyStart = copy.length ? copy[0].index : Math.round(code.length * 0.2);
  const textSpan: [number, number] = [Math.max(0, Math.min(copyStart, copyEnd - Math.round(code.length / 3))), copyEnd];
  const lineEnd = code.indexOf("\n", copyEnd);
  const colorAt = lineEnd < 0 ? copyEnd : lineEnd;
  const events: { at: number; event: BuildEvent }[] = [
    { at: 0, event: "layout" },
    { at: textSpan[0], event: "text" },
    { at: colorAt, event: "color" },
    { at: Math.round((colorAt + code.length) / 2), event: "media" },
  ];

  // Indent after a line break is free (the editor auto-indents), comments are
  // skimmed, so the time goes on the code itself.
  const cost: number[] = [];
  for (const tok of tokenize(code))
    for (let k = 0; k < tok.text.length; k++)
      cost.push(tok.text[k] === "\n" ? NEWLINE_COST : tok.kind === "comment" ? COMMENT_COST : 1);
  for (let i = 1; i < code.length; i++) if (code[i] === " " && (code[i - 1] === "\n" || cost[i - 1] === 0)) cost[i] = 0;

  return {
    name: source.path.split("/").at(-1) ?? source.path,
    path: source.path,
    code,
    lineNumbers,
    folds,
    events,
    textSpan,
    cost,
  };
}
