import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const experience = await readFile(new URL("components/Experience.tsx", root), "utf8");
const webgl = await readFile(new URL("components/WebGLWorld.tsx", root), "utf8");
const packageJson = JSON.parse(await readFile(new URL("package.json", root), "utf8"));

function webpDimensions(buffer) {
  const format = buffer.toString("ascii", 12, 16);
  if (format === "VP8X") {
    return { width: 1 + buffer.readUIntLE(24, 3), height: 1 + buffer.readUIntLE(27, 3) };
  }
  if (format === "VP8 ") {
    const frame = buffer.indexOf(Buffer.from([0x9d, 0x01, 0x2a]), 20);
    assert.ok(frame > 0, "invalid VP8 frame header");
    return { width: buffer.readUInt16LE(frame + 3) & 0x3fff, height: buffer.readUInt16LE(frame + 5) & 0x3fff };
  }
  if (format === "VP8L") {
    const bits = buffer.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  throw new Error(`unsupported WebP format: ${format}`);
}

test("contains no ChatGPT or OpenAI runtime dependency", async () => {
  const files = await readdir(root);
  assert.ok(!files.includes(".openai"));
  assert.ok(!files.includes("worker"));
  assert.ok(!files.includes("wrangler.toml"));
  assert.doesNotMatch(JSON.stringify(packageJson), /chatgpt|openai|vinext|wrangler|cloudflare/i);
  assert.doesNotMatch(experience, /chatgpt|sign.?in|auth/i);
});

test("defers the heavy WebGL engine from the initial route bundle", () => {
  assert.match(experience, /dynamic\(\(\)=>import\("\.\/WebGLWorld"\)/);
  assert.doesNotMatch(experience, /from "three"/);
  assert.match(webgl, /from "three"/);
});

test("preloads only the current and next two screenplay scenes", () => {
  assert.match(experience, /offset<=2/);
  assert.doesNotMatch(experience, /Promise\.all\([^)]*art/i);
});

test("scene images stay within the network performance budget", async () => {
  const sceneDirectory = new URL("public/art/scenes/", root);
  const names = (await readdir(sceneDirectory)).filter((name) => name.endsWith(".webp"));
  assert.equal(names.length, 76);
  const sizes = await Promise.all(names.map(async (name) => (await stat(new URL(name, sceneDirectory))).size));
  const dimensions = await Promise.all(names.map(async (name) => webpDimensions(await readFile(new URL(name, sceneDirectory)))));
  assert.ok(Math.max(...sizes) <= 300_000, "a scene image exceeds the 300 KB transfer budget");
  assert.ok(sizes.reduce((sum, size) => sum + size, 0) <= 7_000_000, "scene art exceeds the 7 MB total budget");
  assert.ok(dimensions.every(({ width, height }) => width >= 1280 && Math.abs(width / height - 16 / 9) < 0.01), "scene art must stay sharp and widescreen");
});
