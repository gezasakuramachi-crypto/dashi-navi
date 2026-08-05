"use strict";

const assert = require("node:assert/strict");
const Runtime = require("../runtime-schedule.js");

const dayTest = {
  mode: "day-test",
  realDate: "2026-08-06",
  festivalDate: "2026-09-02",
  startsAt: "2026-08-06T00:00",
  endsAt: "2026-08-07T00:00"
};

assert.equal(
  Runtime.resolve(dayTest, new Date("2026-08-05T23:59:59+09:00")).mode,
  "normal",
  "開始前は通常日時"
);
assert.equal(
  Runtime.resolve(dayTest, new Date("2026-08-06T00:00:00+09:00")).mode,
  "day-test",
  "8月6日0時に一日テスト開始"
);
assert.equal(
  Runtime.getEffectiveNow(
    dayTest,
    new Date("2026-08-06T18:30:45+09:00")
  ).toISOString(),
  "2026-09-02T09:30:45.000Z",
  "8月6日の時分秒を保ったまま9月2日へ置換"
);
assert.equal(
  Runtime.resolve(dayTest, new Date("2026-08-07T00:00:00+09:00")).mode,
  "normal",
  "8月7日0時に自動で通常日時へ復帰"
);

const fixedTest = {
  mode: "test",
  testDateTime: "2026-09-03T19:30"
};
assert.equal(
  Runtime.getEffectiveNow(fixedTest, new Date("2026-08-05T12:00:00+09:00")).toISOString(),
  "2026-09-03T10:30:00.000Z",
  "固定テストは指定日時を返す"
);
assert.deepEqual(
  Runtime.normalize({ mode: "day-test", realDate: "bad" }),
  { mode: "normal" },
  "不完全な一日テスト設定は通常モードへ戻す"
);

console.log("runtime schedule tests: ok");
