const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const mainHtml = read("index.html");
const scheduleSource = read("schedule/schedule.js");
const adCss = read("schedule/ad-rotator.css");
const adScript = read("schedule/ad-rotator.js");
const mainCss = read("styles.css");
const buildPages = read("tools/build-pages.mjs");
const advertiserUrl = "https://www.koken-realestate.com/";

for (const asset of [
  "mark/ads/koken-01.png",
  "mark/ads/koken-02.png",
  "mark/ads/koken-03.png"
]) {
  const assetPath = path.join(root, asset);
  assert.equal(fs.existsSync(assetPath), true, `${asset} が存在する`);
  assert.deepEqual(
    Array.from(fs.readFileSync(assetPath).subarray(0, 8)),
    [137, 80, 78, 71, 13, 10, 26, 10],
    `${asset} がPNG画像である`
  );
}

for (const source of [mainHtml, scheduleSource]) {
  assert.match(source, new RegExp(advertiserUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  for (const filename of ["koken-01.png", "koken-02.png", "koken-03.png"]) {
    assert.match(source, new RegExp(filename.replace(".", "\\.")));
  }
  assert.match(source, /target="_blank"/);
  assert.match(source, /rel="noopener noreferrer"/);
}

assert.match(mainHtml, /ad-rotator--fixed/);
assert.match(scheduleSource, /ad-rotator--inline/);
assert.match(adCss, /background:\s*#ffffff/);
assert.match(adCss, /--advertisement-height:\s*clamp\(32px, 8\.84vw, 90px\)/);
assert.match(mainCss, /var\(--advertisement-height\)/);
assert.match(buildPages, /\["data", "mark", "schedule"\]/);

class FakeClassList {
  constructor() {
    this.classes = new Set();
  }

  toggle(name, enabled) {
    if (enabled) this.classes.add(name);
    else this.classes.delete(name);
  }

  contains(name) {
    return this.classes.has(name);
  }
}

const slides = Array.from({ length: 3 }, () => ({
  classList: new FakeClassList()
}));
const rotator = {
  querySelectorAll(selector) {
    assert.equal(selector, "[data-ad-slide]");
    return slides;
  }
};
const eventListeners = new Map();
const timers = [];
const clearedTimers = [];
const fakeDocument = {
  readyState: "complete",
  hidden: false,
  querySelectorAll(selector) {
    assert.equal(selector, "[data-ad-rotator]");
    return [rotator];
  },
  addEventListener(type, listener) {
    eventListeners.set(type, listener);
  }
};
const fakeWindow = {
  setInterval(callback, delay) {
    const timer = { callback, delay, id: timers.length + 1 };
    timers.push(timer);
    return timer.id;
  },
  clearInterval(timerId) {
    clearedTimers.push(timerId);
  }
};

vm.runInNewContext(adScript, {
  document: fakeDocument,
  window: fakeWindow
});

assert.equal(timers[0].delay, 5000);
assert.equal(slides[0].classList.contains("is-active"), true);
assert.equal(slides[1].classList.contains("is-active"), false);

timers[0].callback();
assert.equal(slides[1].classList.contains("is-active"), true);
timers[0].callback();
assert.equal(slides[2].classList.contains("is-active"), true);
timers[0].callback();
assert.equal(slides[0].classList.contains("is-active"), true);

fakeDocument.hidden = true;
eventListeners.get("visibilitychange")();
assert.deepEqual(clearedTimers, [1]);

fakeDocument.hidden = false;
eventListeners.get("visibilitychange")();
assert.equal(timers[1].delay, 5000);

console.log("advertisement rotator tests passed");
