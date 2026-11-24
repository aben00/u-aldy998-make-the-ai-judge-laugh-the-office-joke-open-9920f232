// SPDX-License-Identifier: MIT
// Make the AI Judge Laugh: the Office Joke Open.
// Writes one single-line office joke (at most 200 characters) to /output/entry.txt.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const JOKE =
  "The office fridge says 'Label your food,' so someone labelled the milk 'Property of Greg.' Greg left in 2019.";

// Gate: one line, 1-200 characters counted by code points, no control
// characters, no leading or trailing whitespace. Throws on any failure.
function checkGate(text: string): number {
  const points = [...text];
  if (points.length < 1 || points.length > 200) {
    throw new Error(`joke is ${points.length} characters, must be 1-200`);
  }
  if (text !== text.trim()) {
    throw new Error("joke has leading or trailing whitespace");
  }
  for (const ch of points) {
    const code = ch.codePointAt(0)!;
    if (code < 0x20 || code === 0x7f) {
      throw new Error(`joke holds a control character U+${code.toString(16).padStart(4, "0")}`);
    }
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("joke must be a single line");
  }
  return points.length;
}

const length = checkGate(JOKE);

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", JOKE, "utf8");

const back = readFileSync("/output/entry.txt", "utf8");
if (back !== JOKE) throw new Error("read-back mismatch: entry.txt differs from the joke");

console.log(`wrote ${length} characters to /output/entry.txt`);
