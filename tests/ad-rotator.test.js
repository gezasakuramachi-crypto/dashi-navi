const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const mainHtml = read("index.html");
const mainCss = read("styles.css");
const scheduleSource = read("schedule/schedule.js");
const scheduleCss = read("schedule/schedule.css");
const schedulePages = [
  "schedule/index.html",
  "schedule/9-2.html",
  "schedule/9-3.html"
].map(read);

for (const source of [mainHtml, scheduleSource, ...schedulePages]) {
  assert.doesNotMatch(source, /data-ad-rotator|ad-rotator|mark\/ads\/|koken-realestate/);
}

assert.doesNotMatch(mainCss, /--advertisement-height/);
assert.doesNotMatch(scheduleCss, /--advertisement-height/);
assert.match(
  mainCss,
  /#map\s*\{[\s\S]*?inset:\s*var\(--header-height\) 0 calc\(var\(--footer-height\) \+ env\(safe-area-inset-bottom\)\) 0;/
);
assert.match(
  mainCss,
  /\.bottom-bar\s*\{[\s\S]*?inset:\s*auto 0 env\(safe-area-inset-bottom\);/
);
assert.match(
  scheduleCss,
  /\.page-footer\s*\{[^}]*calc\(28px \+ env\(safe-area-inset-bottom\)\)/
);

console.log("advertisement removal tests passed");
