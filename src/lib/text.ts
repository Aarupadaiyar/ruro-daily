/** Split prose into sentences without breaking on "U.S." or "3.5". */
export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=["“‘(]?[A-Z0-9₹$])/)
    .map((s) => s.trim())
    .filter(Boolean);
}
