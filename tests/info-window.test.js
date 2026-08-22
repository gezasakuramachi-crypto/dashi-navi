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
const sakuramachi = sandbox.window.DASHI_NAVI_CONFIG.dashis.find(
  (dashi) => dashi.id === "sakuramachi"
);

assert.ok(titles.includes("新町山車集合場所　9/3 13時"));
assert.ok(titles.includes("年番引継ぎ会場　9/3 18時～"));
assert.ok(titles.includes("大町通り山車集合\n9/3　15時・17時"));
assert.ok(!titles.includes("宮内ビル駐車場"));
assert.ok(!titles.includes("一斉踊り会場"));
assert.ok(!titles.includes("ミドリヤさん裏"));
assert.ok(!titles.includes("まちづくり鹿嶋（株）前"));

const newTownMeeting = information.find(
  (point) => point.title === "新町山車集合場所　9/3 13時"
);
assert.ok(newTownMeeting);
assert.equal(Object.hasOwn(newTownMeeting, "photo"), false);

assert.ok(sakuramachi);
assert.equal(sakuramachi.townName, "櫻町区");
assert.equal(sakuramachi.deviceId, 2);
assert.equal(sakuramachi.routeUrls.default, "schedule/");
assert.equal(
  sakuramachi.iconUrl,
  "mark/sakuramachi-konohanasakuya-icon.png"
);
assert.equal(
  fs.existsSync(path.join(root, sakuramachi.iconUrl)),
  true,
  "木花咲耶姫の丸形アイコンが存在する"
);

const informationJson = JSON.stringify(information);
for (const removedText of ["top.html", "御船祭保存会", "山車ナビ"]) {
  assert.equal(informationJson.includes(removedText), false);
}

assert.match(app, /new google\.maps\.InfoWindow\(\{ headerDisabled: true \}\)/);
assert.match(app, /clickableIcons: true/);
assert.match(app, /state\.map\.addListener\("click", \(\) => state\.infoWindow\.close\(\)\)/);
assert.match(app, /event\.target\.closest\("\.gm-style-iw-c"\)/);
assert.match(app, /if \(state\.infoWindow\) state\.infoWindow\.close\(\);/);
assert.match(app, /PAGE_PARAMS\.get\("admin"\) === "1"/);
assert.match(app, /"配信停止中"/);
assert.match(app, /className: "dashi-marker-label"/);
assert.match(app, /text: dashi\.townName/);
assert.match(app, /labelOrigin: new google\.maps\.Point/);
assert.doesNotMatch(app, /ここへ行く/);
assert.doesNotMatch(app, /google\.com\/maps\/dir/);
assert.match(app, /trafficStatusText/);
assert.match(app, /"自動更新"/);
assert.match(app, /\$\("trafficStatusBadge"\)\.addEventListener\("click", toggleTrafficPanel\)/);
assert.match(app, /\$\("trafficStatusBadge"\)\.setAttribute\("aria-expanded", "true"\)/);
assert.match(app, /\$\("trafficStatusBadge"\)\.setAttribute\("aria-expanded", "false"\)/);
assert.match(app, /\$\("trafficStatusBadge"\)\.contains\(event\.target\)/);
assert.match(
  app,
  /fullscreenControlOptions:\s*\{\s*position:\s*google\.maps\.ControlPosition\.RIGHT_BOTTOM\s*\}/
);
assert.match(css, /\.gm-style \.gm-style-iw-chr\s*\{\s*display: none !important;/);
assert.match(css, /\.gm-style \.gm-style-iw-c\s*\{[\s\S]*?max-width:\s*calc\(100vw - 32px\) !important;/);
assert.match(css, /\.gm-style \.gm-style-iw-d\s*\{[\s\S]*?overflow:\s*hidden !important;/);
assert.match(css, /\.map-card-actions\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/);
assert.match(css, /\.map-link,\s*\n\.map-link-disabled\s*\{[\s\S]*?min-width:\s*0;/);
assert.match(css, /\.dashi-marker-label\s*\{/);
assert.match(css, /\.traffic-status-badge\s*\{/);
assert.match(css, /\.traffic-status-badge\s*\{[\s\S]*?cursor:\s*pointer;/);
assert.doesNotMatch(
  css.match(/\.traffic-status-badge\s*\{[\s\S]*?\n\}/)?.[0] || "",
  /pointer-events:\s*none/
);
assert.match(css, /\.stream-status\s*\{[\s\S]*?z-index:\s*22;/);
assert.match(css, /\.stream-status\s*\{[\s\S]*?left:\s*8px;/);
assert.match(css, /\.traffic-panel\s*\{[\s\S]*?z-index:\s*24;/);
assert.match(css, /\.schedule-link\s*\{/);
assert.match(html, /id="streamStatus"/);
assert.doesNotMatch(html, /山車の現在地は運行時間中のみ表示します/);
assert.match(
  html,
  /<button id="trafficStatusBadge"[^>]*aria-controls="trafficPanel"[^>]*aria-expanded="false"/
);
assert.match(html, /id="trafficStatusText" aria-live="polite"/);
assert.match(html, /href="schedule\/"/);
assert.doesNotMatch(html, /ここへ行く/);
assert.match(html, /styles\.css\?v=20260822-2/);
assert.doesNotMatch(html, /ad-rotator/);
assert.match(html, /runtime-schedule\.js\?v=20260810-1/);
assert.match(html, /config\.js\?v=20260810-1/);
assert.match(html, /app\.js\?v=20260811-2/);
assert.match(html, /【企画・製作・運用】/);
assert.match(html, /<p class="help-profile-name">MASUMI<\/p>/);
assert.match(html, /令和7年から個人で「山車ナビ」の開発・運用を無償で行っています/);
assert.match(html, /mailto:geza\.sakuramachi@gmail\.com/);
assert.match(html, />geza\.sakuramachi@gmail\.com<\/a>/);
assert.match(html, /※祭礼当日などは、すぐに返信できない場合があります。/);
assert.match(html, /祭礼・観光関連リンク/);
assert.match(html, /href="https:\/\/kashimajingu\.jp\/"/);
assert.match(html, /href="http:\/\/www\.sopia\.or\.jp\/kashima-kanko\/"/);
assert.match(html, />鹿島神宮<\/strong>/);
assert.match(html, />鹿嶋市観光協会<\/strong>/);
assert.match(html, /class="help-related-link"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/);
assert.doesNotMatch(html, /LINE\s*ID/i);
assert.doesNotMatch(html, /masumi\.takayasu@gmail\.com/);
assert.match(css, /\.help-contact-link\s*\{[\s\S]*?overflow-wrap:\s*anywhere;/);
assert.match(css, /\.help-related-list\s*\{/);
assert.match(css, /\.help-related-link\s*\{[\s\S]*?grid-template-columns:\s*38px minmax\(0, 1fr\) auto;/);

console.log("info-window regression tests passed");
