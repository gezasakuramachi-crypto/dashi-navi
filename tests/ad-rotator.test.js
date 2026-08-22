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
const counterTag = mainHtml.match(/<!--カウンタータグここから-->([\s\S]*?)<!--カウンタータグここまで-->/)?.[1];
assert.ok(counterTag, "イージーカウンターのタグを確認できる");
assert.doesNotMatch(counterTag, /http:\/\//);
assert.match(counterTag, /https:\/\/www\.ezcounter\.net\/images\/today\.gif/);
assert.match(counterTag, /https:\/\/www\.ezcounter\.net\/tday-d37-f5-167\/6a8926a173660\//);
assert.match(counterTag, /https:\/\/www\.ezcounter\.net\/images\/yesterday\.gif/);
assert.match(counterTag, /https:\/\/www\.ezcounter\.net\/yday-d37-f5-167\/6a8926a173660\//);
assert.match(counterTag, /https:\/\/www\.ezcounter\.net\/images\/total\.gif/);
assert.match(counterTag, /https:\/\/www\.ezcounter\.net\/total-d37-f6-167\/6a8926a173660\//);
assert.doesNotMatch(mainHtml, /f-counter|1787371082|stylemap\.co\.jp/);
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
  assert.doesNotMatch(page, /ezcounter|access-counter/);
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
