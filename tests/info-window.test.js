const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const app = read("app.js");
const css = read("styles.css");
const html = read("index.html");
const configSource = read("config.js");
const sandbox = { window: {} };
vm.runInNewContext(configSource, sandbox);

const information = sandbox.window.DASHI_NAVI_CONFIG.poi.information;
const titles = information.map((point) => point.title);

assert.ok(titles.includes("新町山車集合場所　9/3 13時"));
assert.ok(titles.includes("年番引継ぎ会場　9/3 18時～"));
assert.ok(!titles.includes("一斉踊り会場"));
assert.ok(!titles.includes("ミドリヤさん裏"));
assert.ok(!titles.includes("まちづくり鹿嶋（株）前"));

const newTownMeeting = information.find(
  (point) => point.title === "新町山車集合場所　9/3 13時"
);
assert.ok(newTownMeeting);
assert.equal(Object.hasOwn(newTownMeeting, "photo"), false);

const informationJson = JSON.stringify(information);
for (const removedText of ["top.html", "御船祭保存会", "山車ナビ"]) {
  assert.equal(informationJson.includes(removedText), false);
}

assert.match(app, /new google\.maps\.InfoWindow\(\{ headerDisabled: true \}\)/);
assert.match(app, /clickableIcons: false/);
assert.match(app, /state\.map\.addListener\("click", \(\) => state\.infoWindow\.close\(\)\)/);
assert.match(app, /event\.target\.closest\("\.gm-style-iw-c"\)/);
assert.match(app, /if \(state\.infoWindow\) state\.infoWindow\.close\(\);/);
assert.match(app, /PAGE_PARAMS\.get\("admin"\) === "1"/);
assert.match(app, /"配信停止中"/);
assert.match(css, /\.gm-style \.gm-style-iw-chr\s*\{\s*display: none !important;/);
assert.match(html, /id="streamStatus"/);
assert.match(html, /styles\.css\?v=20260805-2/);
assert.match(html, /runtime-schedule\.js\?v=20260805-2/);
assert.match(html, /config\.js\?v=20260805-2/);
assert.match(html, /app\.js\?v=20260805-2/);

console.log("info-window regression tests passed");
