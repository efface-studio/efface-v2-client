/** A run of a source file, starting at its 1-based line number. */
export interface SourceBlock {
  start: number;
  code: string;
}

/**
 * The part of a component file worth watching being typed: the default
 * export's signature and the JSX it returns, at their real line numbers. The
 * imports and hooks between them are left folded, as an editor would.
 */
export function excerpt(src: string): SourceBlock[] {
  const lines = src.split("\n");
  const sigStart = lines.findIndex((l) => l.startsWith("export default function"));
  if (sigStart < 0) return [{ start: 1, code: src }];
  // The signature ends at the `) {` that opens the body (it may span lines).
  let sigEnd = sigStart;
  while (sigEnd < lines.length - 1 && !/\)\s*(?::[^=]*)?\{\s*$/.test(lines[sigEnd])) sigEnd++;
  const retStart = lines.findIndex((l, i) => i > sigEnd && l.startsWith("  return ("));
  const retEnd = lines.findIndex((l, i) => i > retStart && l.startsWith("  );"));
  if (retStart < 0 || retEnd < 0) return [{ start: sigStart + 1, code: lines.slice(sigStart).join("\n") }];
  const close = lines[retEnd + 1]?.startsWith("}") ? retEnd + 1 : retEnd;

  const blocks: SourceBlock[] = [{ start: sigStart + 1, code: lines.slice(sigStart, sigEnd + 1).join("\n") }];
  const body = { start: retStart + 1, code: lines.slice(retStart, close + 1).join("\n") };
  // A body that follows the signature directly needs no fold between them.
  if (retStart === sigEnd + 1) blocks[0].code += `\n${body.code}`;
  else blocks.push(body);
  return blocks;
}
