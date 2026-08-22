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
assert.match(mainHtml, /<aside class="access-counter" aria-label="アクセスカウンター">/);
assert.match(
  mainHtml,
  /<a href="https:\/\/www\.stylemap\.co\.jp\/" title="アクセスカウンター" aria-label="アクセスカウンター"><span class="f-counter" data-dir="67" data-id="1787371082"><\/span><\/a>/
);
assert.match(
  mainHtml,
  /<a href="https:\/\/www\.stylemap\.co\.jp\/"[^>]*><span class="f-counter"[^>]*><\/span><\/a>\s*<script src="https:\/\/www\.f-counter\.net\/js-counter\/counter\.js" async><\/script>/
);
assert.match(mainCss, /--counter-height:\s*clamp\(50px, 15\.625vw, 72px\);/);
assert.match(
  mainCss,
  /#map\s*\{[\s\S]*?inset:\s*var\(--header-height\) 0 calc\(var\(--footer-height\) \+ var\(--counter-height\) \+ env\(safe-area-inset-bottom\)\) 0;/
);
assert.match(
  mainCss,
  /\.bottom-bar\s*\{[\s\S]*?inset:\s*auto 0 calc\(var\(--counter-height\) \+ env\(safe-area-inset-bottom\)\);/
);
assert.match(mainCss, /\.access-counter\s*\{[\s\S]*?position:\s*fixed;/);
assert.match(
  scheduleCss,
  /\.page-footer\s*\{[^}]*calc\(28px \+ env\(safe-area-inset-bottom\)\)/
);

for (const page of schedulePages) {
  assert.doesNotMatch(page, /f-counter|access-counter/);
}

for (const asset of [
  "koken-640x100.png",
  "sponsor-recruit-01-640x100.png",
  "sponsor-recruit-02-640x100.png",
  "sponsor-recruit-03-640x100.png"
]) {
  const file = fs.readFileSync(path.join(root, "mark", "ads", asset));
  assert.equal(file.readUInt32BE(16), 640, `${asset} の幅は640pxのまま保存する`);
  assert.equal(file.readUInt32BE(20), 100, `${asset} の高さは100pxのまま保存する`);
}

assert.equal(fs.existsSync(path.join(root, "sponsor.html")), true);
assert.match(read("sponsor.html"), /docs\.google\.com\/forms/);

console.log("access counter and advertisement tests passed");
