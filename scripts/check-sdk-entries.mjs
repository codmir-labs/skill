#!/usr/bin/env node
// Checks that every `@codmir/sdk/<subpath>` this repository names is an entry of the SDK
// release it targets. The entries are listed in scripts/sdk-exports.json: update that file
// (exports, version, commit) whenever the SDK's export map changes, then run `npm test`.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const spec = JSON.parse(readFileSync(join(root, "scripts", "sdk-exports.json"), "utf8"));
const entries = new Set(spec.exports.map((key) => (key === "." ? "" : key.replace(/^\.\//, ""))));

// Where the skill names entries: these two files, and every text file under these directories.
const files = ["SKILL.md", "README.md"];
const dirs = ["docs", "src"];
const textFile = /\.(md|ts|tsx|js|mjs|cjs|json|svg|txt)$/;

function walk(dir) {
  for (const name of readdirSync(join(root, dir))) {
    const rel = join(dir, name);
    if (statSync(join(root, rel)).isDirectory()) walk(rel);
    else if (textFile.test(name)) files.push(rel);
  }
}
for (const dir of dirs) walk(dir);

// `@codmir/sdk` or `@codmir/sdk/<subpath>`; a trailing dot ends a sentence, not a path.
const reference = /@codmir\/sdk(?:\/([A-Za-z0-9][\w.-]*(?:\/[\w.-]+)*))?(?![\w-])/g;

let misses = 0;
let checked = 0;
for (const file of files) {
  const lines = readFileSync(join(root, file), "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const match of line.matchAll(reference)) {
      const entry = (match[1] ?? "").replace(/\.+$/, "");
      checked++;
      if (entries.has(entry)) continue;
      console.log(`${file}:${i + 1}: @codmir/sdk/${entry} is not an entry of @codmir/sdk ${spec.version}`);
      misses++;
    }
  });
}

if (misses > 0) {
  console.log(`${misses} entries missing from @codmir/sdk ${spec.version} (${spec.commit})`);
  process.exit(1);
}
console.log(`ok: ${checked} references to @codmir/sdk match the ${entries.size} entries of ${spec.version} (${spec.commit})`);
