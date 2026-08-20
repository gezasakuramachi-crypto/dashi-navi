const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const mainHtml = read("index.html");
const mainCss = read("styles.css");
const rotatorCss = read("schedule/ad-rotator.css");
const rotatorJs = read("schedule/ad-rotator.js");
const scheduleSource = read("schedule/schedule.js");
const schedulePages = [
  "schedule/index.html",
  "schedule/9-2.html",
  "schedule/9-3.html"
].map(read);

const expectedSlides = [
  "sponsor-recruit-01-640x100.png",
  "koken-640x100.png",
  "sponsor-recruit-02-640x100.png",
  "koken-640x100.png",
  "sponsor-recruit-03-640x100.png"
];

for (const asset of new Set(expectedSlides)) {
  const file = fs.readFileSync(path.join(root, "mark", "ads", asset));
  assert.equal(file.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  assert.equal(file.readUInt32BE(16), 640, `${asset} の幅は640px`);
  assert.equal(file.readUInt32BE(20), 100, `${asset} の高さは100px`);
}

function slideAssets(source) {
  return Array.from(
    source.matchAll(/src="(?:\.\.\/)?mark\/ads\/([^"/]+-640x100\.png)"/g),
    (match) => match[1]
  );
}

assert.deepEqual(slideAssets(mainHtml), expectedSlides);
assert.deepEqual(slideAssets(scheduleSource), expectedSlides);
assert.equal((mainHtml.match(/data-ad-slide/g) || []).length, 5);
assert.equal((scheduleSource.match(/data-ad-slide/g) || []).length, 5);
assert.equal((mainHtml.match(/href="sponsor\.html"/g) || []).length, 3);
assert.equal((scheduleSource.match(/href="\.\.\/sponsor\.html"/g) || []).length, 3);
assert.equal((mainHtml.match(/href="https:\/\/www\.koken-realestate\.com\/"/g) || []).length, 2);
assert.equal((scheduleSource.match(/href="https:\/\/www\.koken-realestate\.com\/"/g) || []).length, 2);
assert.equal((mainHtml.match(/koken-realestate\.com\/" target="_blank" rel="noopener noreferrer"/g) || []).length, 2);
assert.doesNotMatch(mainHtml, /koken-0[23]\.png/);
assert.doesNotMatch(scheduleSource, /koken-0[23]\.png/);

for (const html of schedulePages) {
  assert.match(html, /ad-rotator\.css\?v=20260820-1/);
  assert.match(html, /ad-rotator\.js\?v=20260820-1/);
}

assert.match(rotatorCss, /--advertisement-height:\s*clamp\(50px, 15\.625vw, 100px\)/);
assert.match(rotatorCss, /\.ad-rotator\s*\{[\s\S]*?background:\s*#ffffff/);
assert.match(rotatorCss, /\.ad-rotator-slide img\s*\{[\s\S]*?width:\s*min\(100%, 640px\)/);
assert.match(rotatorCss, /\.ad-rotator-slide\.is-active\s*\{[\s\S]*?pointer-events:\s*auto/);
assert.doesNotMatch(rotatorCss, /nth-child/);
assert.match(mainCss, /#map\s*\{[\s\S]*?var\(--advertisement-height\)/);
assert.match(mainCss, /\.bottom-bar\s*\{[\s\S]*?var\(--advertisement-height\)/);
assert.match(mainCss, /\.toast\s*\{[\s\S]*?var\(--advertisement-height\)/);

const slides = Array.from({ length: 5 }, () => {
  const classes = new Set();
  const attributes = new Map();
  return {
    classList: {
      toggle(name, enabled) {
        if (enabled) classes.add(name);
        else classes.delete(name);
      },
      contains(name) {
        return classes.has(name);
      }
    },
    setAttribute(name, value) {
      attributes.set(name, value);
    },
    getAttribute(name) {
      return attributes.get(name);
    },
    tabIndex: 0
  };
});

const timers = [];
const clearedTimers = [];
const listeners = new Map();
const rotator = {
  querySelectorAll(selector) {
    assert.equal(selector, "[data-ad-slide]");
    return slides;
  }
};
const document = {
  hidden: false,
  readyState: "complete",
  querySelectorAll(selector) {
    assert.equal(selector, "[data-ad-rotator]");
    return [rotator];
  },
  addEventListener(name, callback) {
    listeners.set(name, callback);
  }
};
const window = {
  setInterval(callback, delay) {
    const timer = { callback, delay, id: timers.length + 1 };
    timers.push(timer);
    return timer.id;
  },
  clearInterval(id) {
    clearedTimers.push(id);
  }
};

vm.runInNewContext(rotatorJs, { document, window });
assert.equal(timers[0].delay, 5000);
assert.equal(slides[0].classList.contains("is-active"), true);
assert.equal(slides[0].getAttribute("aria-hidden"), "false");
assert.equal(slides[0].tabIndex, 0);
assert.equal(slides[1].tabIndex, -1);

timers[0].callback();
assert.equal(slides[0].classList.contains("is-active"), false);
assert.equal(slides[1].classList.contains("is-active"), true);
assert.equal(slides[1].getAttribute("aria-hidden"), "false");

document.hidden = true;
listeners.get("visibilitychange")();
assert.deepEqual(clearedTimers, [1]);
document.hidden = false;
listeners.get("visibilitychange")();
assert.equal(timers.length, 2);
assert.equal(timers[1].delay, 5000);

console.log("advertisement rotator tests passed");
