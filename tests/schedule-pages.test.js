const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

for (const page of ["schedule/index.html", "schedule/9-2.html", "schedule/9-3.html"]) {
  assert.equal(fs.existsSync(path.join(root, page)), true, `${page} が存在する`);
  const html = read(page);
  assert.match(html, /schedule\.css\?v=20260821-1/);
  assert.match(html, /schedule\.js\?v=20260821-1/);
  assert.doesNotMatch(html, /ad-rotator/);
}

const schedule = read("schedule/schedule.js");
const scheduleCss = read("schedule/schedule.css");
const admin = read("admin.html");
const buildPages = read("tools/build-pages.mjs");

for (const mapId of [
  "1wnaaa4BzSV38wpZTjvUsC-6AFUJgWrE",
  "1uwH9Ev7Z-RionWUW7xosEwmG1j3hvlQ",
  "1iSwJTXqS-7W9GptQ1p9q82myQndugbQ",
  "1-L6Hkj7gZOI6CvOoGsAMHbFEGs0SvdM",
  "1hOzCpo2AYEOAW75tD0rnXtHASK7FRck",
  "1zWt2TnUcFQ5jwjI5zbjUkpCsb7xT6xc",
  "1oJISLf7jiyDP8iGFQ81kuC9ekG3T05M",
  "1d5sStF44q29Eh0tA75oetNn97e4iNr4",
  "198vNazs-OGaw2szb1b6RJ0paOr2oauw",
  "1aVRi7Ed9P5YZxNEJSLOg2nV695fUNl4",
  "1Q4RNYVSgucO-mLRKspDzCGe5ECwm-YA",
  "11a7L6DMlUi5GDAASMdAoOJJOiR6sGzs",
  "1pOcI3vWw05sHGBjk1cWZd54631HdIxM"
]) {
  assert.match(schedule, new RegExp(mapId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
}

assert.doesNotMatch(schedule, /櫻町区 若連/);
assert.match(schedule, /const routeMaps = day\.slots\.map/);
assert.match(schedule, /class="route-list">\$\{routeMaps\}<\/div>/);
assert.match(schedule, /経路図は時間順に並んでいます/);
assert.match(schedule, /別の日の経路図を見る/);
assert.match(schedule, /class="bottom-day-tabs"[^>]*>\$\{dayTabs\}<\/nav>/);
assert.match(schedule, /loading="\$\{index === 0 \? "eager" : "lazy"\}"/);
assert.doesNotMatch(schedule, /time-button|showSlot|id="routeMap"/);
assert.match(scheduleCss, /\.route-list\s*\{[^}]*display:\s*grid;/);
assert.match(scheduleCss, /\.route-list\s*\{[^}]*gap:\s*24px;/);
assert.match(scheduleCss, /\.route-panel-heading\s*\{[^}]*display:\s*flex;/);
assert.match(scheduleCss, /\.bottom-day-tabs\s*\{[^}]*grid-template-columns:\s*repeat\(3,1fr\)/);
assert.doesNotMatch(scheduleCss, /\.time-buttons|\.time-button/);
assert.doesNotMatch(scheduleCss, /overflow-x:\s*auto/);
assert.doesNotMatch(schedule, /data-ad-rotator|mark\/ads\/|koken-realestate/);
assert.doesNotMatch(scheduleCss, /--advertisement-height/);
assert.match(scheduleCss, /\.page-footer\s*\{[^}]*env\(safe-area-inset-bottom\)/);
assert.match(buildPages, /\["data", "mark", "schedule"\]/);
assert.match(admin, /山車ナビ 管理用ページ/);
assert.match(admin, /href="schedule\/"/);
assert.match(admin, /index\.html\?admin=1&amp;preview=1/);
assert.match(admin, /config\.js\?v=20260810-1/);
assert.match(admin, /noindex,nofollow,noarchive/);

console.log("schedule page tests passed");
