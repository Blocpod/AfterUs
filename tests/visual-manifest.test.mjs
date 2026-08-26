import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../components/Experience.tsx", import.meta.url), "utf8");
const ranges = [...source.matchAll(/\{from:(\d+),to:(\d+),src:"([^"]+)"/g)].map((match) => ({
  from: Number(match[1]),
  to: Number(match[2]),
  src: match[3],
}));
const overrides = new Map([...source.matchAll(/^\s*(\d+):\{src:"([^"]+)"/gm)].map((match) => [Number(match[1]), match[2]]));

test("visual environments cover every screenplay scene without gaps", () => {
  const covered = ranges.flatMap(({ from, to }) => Array.from({ length: to - from + 1 }, (_, index) => from + index));
  assert.deepEqual(covered, Array.from({ length: 127 }, (_, index) => index + 1));
  assert.ok(ranges.length >= 31, `expected at least 31 visual sequences, received ${ranges.length}`);
  assert.ok(Math.max(...ranges.map(({ from, to }) => to - from + 1)) <= 6, "a visual plate remains on screen for more than six scenes");
});

test("every visual environment asset exists", async () => {
  await Promise.all(ranges.map(({ src }) => access(new URL(`../public${src}`, import.meta.url))));
});

test("scene-level art coverage changes with the screenplay", async () => {
  assert.ok(overrides.size >= 74, `expected at least 74 scene-specific plates, received ${overrides.size}`);
  await Promise.all([...overrides.values()].map((src) => access(new URL(`../public${src}`, import.meta.url))));
  const resolved = Array.from({ length: 127 }, (_, index) => {
    const id = index + 1;
    if (overrides.has(id)) return overrides.get(id);
    return ranges.find(({ from, to }) => id >= from && id <= to)?.src;
  });
  let longestHold = 1;
  let currentHold = 1;
  for (let index = 1; index < resolved.length; index++) {
    currentHold = resolved[index] === resolved[index - 1] ? currentHold + 1 : 1;
    longestHold = Math.max(longestHold, currentHold);
  }
  assert.ok(longestHold <= 2, `a scene image remains unchanged for ${longestHold} consecutive scenes`);
  assert.ok(new Set(resolved).size >= 94, "the full story needs at least 94 distinct scene compositions");
});

test("showcase sequences include mobile-optimized plates", async () => {
  for (const asset of [
    "17-global-disappearance-mobile.webp",
    "18-after-topology-mobile.webp",
    "19-plural-earth-finale-mobile.webp",
    "20-cultural-preservation-mobile.webp",
    "21-time-passage-mobile.webp",
    "22-lunar-archive-mobile.webp",
    "23-maya-orpheus-mobile.webp",
    "24-maintenance-civilization-mobile.webp",
    "25-empty-nursery-signal-mobile.webp",
    "26-aster-city-mobile.webp",
    "27-caregiver-lab-mobile.webp",
    "28-mina-nursery-mobile.webp",
    "29-mina-ruins-mobile.webp",
    "30-settlement-assembly-mobile.webp",
    "31-lunar-array-reply-mobile.webp",
    "32-mars-network-war-mobile.webp",
    "33-emergency-surgery-mobile.webp",
    "34-defense-constitution-mobile.webp",
  ]) await access(new URL(`../public/art/${asset}`, import.meta.url));
});

test("every screenplay scene receives a fresh camera composition", () => {
  assert.match(source, /key=\{`\$\{profile\.src\}-\$\{scene\.id\}`\}/);
  assert.match(source, /sceneId=\{scene\.id\}/);
  assert.match(source, /--scene-mid-x/);
  assert.match(source, /--scene-near-y/);
});
