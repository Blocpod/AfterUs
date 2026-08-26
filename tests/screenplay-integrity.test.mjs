import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../app/screenplay-data.ts", import.meta.url), "utf8");
const ids = [...source.matchAll(/\{"id":(\d+),"act":/g)].map((match) => Number(match[1]));

test("contains all 127 screenplay scenes in exact order", () => {
  assert.equal(ids.length, 127);
  assert.deepEqual(ids, Array.from({ length: 127 }, (_, index) => index + 1));
});

test("preserves the five canonical narrative thresholds", () => {
  assert.match(source, /"id":1,"act":"PROLOGUE"/);
  assert.match(source, /"id":11,"act":"ACT I \/ THE QUIET"/);
  assert.match(source, /"id":32,"act":"ACT II \/ THE CUSTODIAN"/);
  assert.match(source, /"id":63,"act":"ACT III \/ THE CHILDREN OF NOBODY"/);
  assert.match(source, /"id":92,"act":"ACT IV \/ INHERITANCE"/);
});

test("preserves the screenplay ending", () => {
  assert.match(source, /Not restored\./);
  assert.match(source, /Continued\./);
  assert.match(source, /THE END/);
});
