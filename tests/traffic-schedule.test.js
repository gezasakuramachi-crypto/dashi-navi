"use strict";

const assert = require("node:assert/strict");
const Traffic = require("../traffic-schedule.js");

const days = [
  {
    id: "2026-09-01",
    date: "2026-09-01",
    published: true,
    slots: [
      { id: "0901-a", start: "10:30", end: "15:30" },
      { id: "0901-b", start: "15:30", end: "19:30" },
      { id: "0901-c", start: "19:30", end: "20:30" },
      { id: "0901-d", start: "20:30", end: "22:00" }
    ]
  },
  {
    id: "2026-09-02",
    date: "2026-09-02",
    published: true,
    slots: [
      { id: "0902-a", start: "08:00", end: "10:00" },
      { id: "0902-b", start: "10:00", end: "14:00" },
      { id: "0902-c", start: "14:00", end: "16:00" },
      { id: "0902-d", start: "16:00", end: "16:30" },
      { id: "0902-e", start: "16:30", end: "17:00" },
      { id: "0902-f", start: "17:00", end: "22:00" }
    ]
  },
  {
    id: "2026-09-03",
    date: "2026-09-03",
    published: true,
    slots: [
      { id: "0903-a", start: "08:00", end: "12:30" },
      { id: "0903-b", start: "12:30", end: "14:00" },
      { id: "0903-c", start: "14:00", end: "16:30" },
      { id: "0903-d", start: "16:30", end: "19:00" },
      { id: "0903-e", start: "19:00", end: "19:30" },
      { id: "0903-f", start: "19:30", end: "22:00" }
    ]
  },
  {
    id: "draft",
    date: "2026-09-04",
    published: false,
    slots: [{ id: "draft-a", start: "10:00", end: "11:00" }]
  }
];

function activeSlotId(dateTime, options) {
  return Traffic.findActiveSlot(days, new Date(dateTime), options)?.slot.id || null;
}

assert.equal(activeSlotId("2026-09-01T10:29:59+09:00"), null, "初日の開始前");
assert.equal(activeSlotId("2026-09-01T10:30:00+09:00"), "0901-a", "9月1日開始");
assert.equal(activeSlotId("2026-09-01T15:30:00+09:00"), "0901-b", "9月1日15時30分");
assert.equal(activeSlotId("2026-09-01T19:30:00+09:00"), "0901-c", "9月1日19時30分");
assert.equal(activeSlotId("2026-09-01T20:30:00+09:00"), "0901-d", "9月1日20時30分");
assert.equal(activeSlotId("2026-09-01T22:00:00+09:00"), null, "9月1日終了");

assert.equal(activeSlotId("2026-09-02T07:59:59+09:00"), null, "2日目の開始前");
assert.equal(activeSlotId("2026-09-02T08:00:00+09:00"), "0902-a", "9月2日開始");
assert.equal(activeSlotId("2026-09-02T10:00:00+09:00"), "0902-b", "9月2日10時");
assert.equal(activeSlotId("2026-09-02T14:00:00+09:00"), "0902-c", "9月2日14時");
assert.equal(activeSlotId("2026-09-02T16:00:00+09:00"), "0902-d", "9月2日16時");
assert.equal(activeSlotId("2026-09-02T16:30:00+09:00"), "0902-e", "9月2日16時30分");
assert.equal(activeSlotId("2026-09-02T17:00:00+09:00"), "0902-f", "9月2日17時");
assert.equal(activeSlotId("2026-09-02T22:00:00+09:00"), null, "9月2日終了");

assert.equal(activeSlotId("2026-09-03T07:59:59+09:00"), null, "3日目の開始前");
assert.equal(activeSlotId("2026-09-03T08:00:00+09:00"), "0903-a", "9月3日開始");
assert.equal(activeSlotId("2026-09-03T12:30:00+09:00"), "0903-b", "9月3日12時30分");
assert.equal(activeSlotId("2026-09-03T14:00:00+09:00"), "0903-c", "9月3日14時");
assert.equal(activeSlotId("2026-09-03T16:30:00+09:00"), "0903-d", "9月3日16時30分");
assert.equal(activeSlotId("2026-09-03T19:00:00+09:00"), "0903-e", "9月3日19時");
assert.equal(activeSlotId("2026-09-03T19:30:00+09:00"), "0903-f", "9月3日19時30分");
assert.equal(activeSlotId("2026-09-03T22:00:00+09:00"), null, "3日間の規制終了");

assert.equal(
  activeSlotId("2026-09-04T10:30:00+09:00"),
  null,
  "通常モードでは未公開データを表示しない"
);
assert.equal(
  activeSlotId("2026-09-04T10:30:00+09:00", { includeDraft: true }),
  "draft-a",
  "テストモードでは未公開データを確認できる"
);

assert.equal(
  Traffic.getJstDateKey(new Date("2026-08-31T15:30:00Z")),
  "2026-09-01",
  "UTCから日本時間の日付へ変換する"
);
assert.equal(
  Traffic.parseJstDateTime("2026-09-03T16:30").toISOString(),
  "2026-09-03T07:30:00.000Z",
  "管理画面の日時を日本時間として解釈する"
);
assert.equal(
  Traffic.mapJstTimeToDate(
    new Date("2026-08-06T06:45:12+09:00"),
    "2026-09-02"
  ).toISOString(),
  "2026-09-01T21:45:12.000Z",
  "実時間の時分秒を保って祭礼日へ置換する"
);

console.log("traffic-schedule tests: ok");
