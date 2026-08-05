"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const Traffic = require("../traffic-schedule.js");
const Runtime = require("../runtime-schedule.js");

const sandbox = { window: {} };
vm.runInNewContext(
  fs.readFileSync(path.resolve(__dirname, "../config.js"), "utf8"),
  sandbox,
  { filename: "config.js" }
);
const days = sandbox.window.DASHI_NAVI_CONFIG.publicPositionDays;

function activeId(dateTime) {
  return Traffic.findActiveSlot(days, new Date(dateTime))?.slot.id || null;
}

assert.equal(activeId("2026-09-01T09:59:59+09:00"), null);
assert.equal(activeId("2026-09-01T10:00:00+09:00"), "position-0901-1000-2200");
assert.equal(activeId("2026-09-01T22:00:00+09:00"), null);

assert.equal(activeId("2026-09-02T05:59:59+09:00"), null);
assert.equal(activeId("2026-09-02T06:00:00+09:00"), "position-0902-0600-0700");
assert.equal(activeId("2026-09-02T07:00:00+09:00"), null);
assert.equal(activeId("2026-09-02T18:00:00+09:00"), "position-0902-1800-2200");
assert.equal(activeId("2026-09-02T22:00:00+09:00"), null);

assert.equal(activeId("2026-09-03T11:29:59+09:00"), null);
assert.equal(activeId("2026-09-03T11:30:00+09:00"), "position-0903-1130-2200");
assert.equal(activeId("2026-09-03T22:00:00+09:00"), null);

const mappedNow = Runtime.getEffectiveNow(
  {
    mode: "day-test",
    realDate: "2026-08-06",
    festivalDate: "2026-09-02",
    startsAt: "2026-08-06T00:00",
    endsAt: "2026-08-07T00:00"
  },
  new Date("2026-08-06T18:15:00+09:00")
);
assert.equal(
  Traffic.findActiveSlot(days, mappedNow)?.slot.id,
  "position-0902-1800-2200",
  "明日の18時15分は9月2日18時15分の公開枠として判定"
);

console.log("position schedule tests: ok");
