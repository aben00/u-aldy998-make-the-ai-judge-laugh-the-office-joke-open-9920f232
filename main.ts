// SPDX-License-Identifier: MIT
// Make the AI Judge Laugh: the Office Joke Open — entry program.
// Node 22, standard library only. Writes one single-line office joke to
// /output/entry.txt, checks the competition gate first, then reads the file
// back and confirms the bytes match exactly.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const ENTRY =
  "My out-of-office reply has a better work-life balance than I do.";

const OUTPUT_PATH = process.env.ENTRY_OUTPUT ?? "/output/entry.txt";
const MIN_CHARS = 1;
const MAX_CHARS = 200;

// Returns every gate violation found, or an empty list when the line is good.
function checkEntry(line: string): string[] {
  const problems: string[] = [];
  const points = [...line];
  if (points.length < MIN_CHARS || points.length > MAX_CHARS) {
    problems.push(
      `entry is ${points.length} characters, outside the ${MIN_CHARS}-${MAX_CHARS} range`,
    );
  }
  if (line.trim().length === 0) {
    problems.push("entry is only whitespace");
  }
  if (line !== line.trim()) {
    problems.push("entry has leading or trailing whitespace");
  }
  for (const ch of line) {
    if (ch === "\n" || ch === "\r") {
      problems.push("entry spans more than one line");
      break;
    }
  }
  for (const ch of line) {
    const code = ch.codePointAt(0) ?? 0;
    if (code < 0x20 || code === 0x7f) {
      problems.push("entry contains a control character");
      break;
    }
  }
  return problems;
}

const problems = checkEntry(ENTRY);
if (problems.length > 0) {
  for (const problem of problems) console.error(`FAIL: ${problem}`);
  process.exit(1);
}

// Confirms the file on disk is byte-for-byte the entry we meant to write:
// same text, same byte length, same character count, still a single line.
function verifyWritten(path: string, expected: string): void {
  const back = readFileSync(path, "utf8");
  if (back !== expected) {
    console.error("FAIL: read-back text differs from the entry");
    process.exit(1);
  }
  if (Buffer.byteLength(back, "utf8") !== Buffer.byteLength(expected, "utf8")) {
    console.error("FAIL: read-back byte length differs from the entry");
    process.exit(1);
  }
  if ([...back].length !== [...expected].length) {
    console.error("FAIL: read-back character count differs from the entry");
    process.exit(1);
  }
  if (checkEntry(back).length > 0) {
    console.error("FAIL: read-back text no longer passes the gate");
    process.exit(1);
  }
}

mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, ENTRY, "utf8");

verifyWritten(OUTPUT_PATH, ENTRY);

console.log(`OK: wrote ${[...ENTRY].length} characters to ${OUTPUT_PATH}`);
console.log(ENTRY);
