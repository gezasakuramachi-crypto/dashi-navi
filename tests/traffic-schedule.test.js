"use strict";

const assert = require("node:assert/strict");
const Traffic = require("../traffic-schedule.js");

const days = [
  {
    id: "published",
    date: "2026-09-01",
    published: true,
    slots: [
      { id: "a", start: "10:30", end: "15:00" },
      { id: "b", start: "15:00", end: "16:00" }
    ]
  },
  {
    id: "draft",
    date: "2026-09-02",
    published: false,
    slots: [
      { id: "c", start: "11:00", end: "12:30" }
    ]
  }
];

assert.equal(
  Traffic.findActiveSlot(days, new Date("2026-09-01T10:29:59+09:00")),
  null,
  "開始前は表示しない"
);

assert.equal(
  Traffic.findActiveSlot(days, new Date("2026-09-01T10:30:00+09:00")).slot.id,
  "a",
  "開始時刻ちょうどに表示する"
);

assert.equal(
  Traffic.findActiveSlot(days, new Date("2026-09-01T15:00:00+09:00")).slot.id,
  "b",
  "境界時刻に次の規制へ切り替える"
);

assert.equal(
  Traffic.findActiveSlot(days, new Date("2026-09-01T16:00:00+09:00")),
  null,
  "終了時刻ちょうどに非表示へ切り替える"
);

assert.equal(
  Traffic.findActiveSlot(days, new Date("2026-09-02T11:30:00+09:00")),
  null,
  "通常モードでは未公開データを表示しない"
);

assert.equal(
  Traffic.findActiveSlot(
    days,
    new Date("2026-09-02T11:30:00+09:00"),
    { includeDraft: true }
  ).slot.id,
  "c",
  "テストモードでは未公開データを確認できる"
);

assert.equal(
  Traffic.getJstDateKey(new Date("2026-08-31T15:30:00Z")),
  "2026-09-01",
  "UTCから日本時間の日付へ変換する"
);

assert.equal(
  Traffic.parseJstDateTime("2026-09-01T16:30").toISOString(),
  "2026-09-01T07:30:00.000Z",
  "管理画面の日時を日本時間として解釈する"
);

console.log("traffic-schedule tests: ok");
