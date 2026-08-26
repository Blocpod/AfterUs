import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const page = await readFile(new URL("../components/Experience.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

test("story cards travel vertically through depth without lateral escape", () => {
  assert.match(page, /translate3d\(0,\$\{offset\*106\}px/);
  assert.doesNotMatch(page, /translate3d\(\$\{x\}/);
});

test("story cards are hard-clipped inside their reading plane", () => {
  assert.match(css, /\.story-frame\{[^}]*overflow:hidden/);
  assert.match(css, /\.screenplay\{[^}]*overflow:hidden/);
  assert.match(css, /\.script-line\{[^}]*max-width:calc\(100% - 40px\)/);
  assert.match(css, /\.script-line\{[^}]*overflow:hidden/);
  assert.match(css, /\.script-line p\{[^}]*overflow-wrap:anywhere/);
});

test("speaker and dialogue are compiled into one readable beat", () => {
  assert.match(page, /speakerLabel:text/);
  assert.match(page, /beat\.speakerLabel&&<span>/);
});
