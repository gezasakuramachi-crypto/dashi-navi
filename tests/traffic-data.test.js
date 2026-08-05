"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const Traffic = require("../traffic-schedule.js");

const projectRoot = path.resolve(__dirname, "..");
const sandbox = { window: {} };
vm.runInNewContext(
  fs.readFileSync(path.join(projectRoot, "config.js"), "utf8"),
  sandbox,
  { filename: "config.js" }
);

const config = sandbox.window.DASHI_NAVI_CONFIG;
const expectedDays = [
  {
    date: "2026-09-01",
    label: "9月1日",
    featurePrefix: "9/1",
    slots: [
      ["10:30", "15:30", "data/91-1030-1530.geojson", 1],
      ["15:30", "19:30", "data/91-1530-1930.geojson", 5],
      ["19:30", "20:30", "data/91-1930-2030.geojson", 2],
      ["20:30", "22:00", "data/91-2030-2200.geojson", 3]
    ]
  },
  {
    date: "2026-09-02",
    label: "9月2日",
    featurePrefix: "9/2",
    slots: [
      ["08:00", "10:00", "data/92-0800-1000.geojson", 9],
      ["10:00", "14:00", "data/92-1000-1400.geojson", 6],
      ["14:00", "16:00", "data/92-1400-1600.geojson", 13],
      ["16:00", "16:30", "data/92-1600-1630.geojson", 8],
      ["16:30", "17:00", "data/92-1630-1700.geojson", 6],
      ["17:00", "22:00", "data/92-1700-2200.geojson", 1]
    ]
  },
  {
    date: "2026-09-03",
    label: "9月3日",
    featurePrefix: "9/3",
    slots: [
      ["08:00", "12:30", "data/93-0800-1230.geojson", 1],
      ["12:30", "14:00", "data/93-1230-1400.geojson", 3],
      ["14:00", "16:30", "data/93-1400-1630.geojson", 1],
      ["16:30", "19:00", "data/93-1630-1900.geojson", 2],
      ["19:00", "19:30", "data/93-1900-1930.geojson", 3],
      ["19:30", "22:00", "data/93-1930-2200.geojson", 2]
    ]
  }
];

assert.deepEqual(
  Array.from(config.trafficDays, (day) => day.date),
  expectedDays.map((day) => day.date),
  "今年は9月1日・2日・3日の3日間"
);

let totalSlots = 0;
const slotIds = new Set();
const sources = new Set();

for (const expectedDay of expectedDays) {
  const day = config.trafficDays.find((item) => item.date === expectedDay.date);
  assert.ok(day, `${expectedDay.label}の交通規制設定がある`);
  assert.equal(day.published, true, `${expectedDay.label}は通常画面に公開`);
  assert.equal(
    day.slots.length,
    expectedDay.slots.length,
    `${expectedDay.label}の時間帯数`
  );

  for (let index = 0; index < expectedDay.slots.length; index += 1) {
    const slot = day.slots[index];
    const [start, end, source, featureCount] = expectedDay.slots[index];
    totalSlots += 1;

    assert.equal(slot.start, start);
    assert.equal(slot.end, end);
    assert.equal(slot.src, source);
    assert.equal(slotIds.has(slot.id), false, `${slot.id}は重複しない`);
    assert.equal(sources.has(source), false, `${source}は重複しない`);
    slotIds.add(slot.id);
    sources.add(source);

    assert.equal(
      Traffic.toJstEpoch(day.date, slot.end) >
        Traffic.toJstEpoch(day.date, slot.start),
      true,
      `${day.label} ${slot.label}の終了は開始より後`
    );

    if (index > 0) {
      assert.equal(
        day.slots[index - 1].end,
        slot.start,
        `${day.label} ${slot.label}は直前の時間帯と隙間なく接続する`
      );
    }

    const filePath = path.join(projectRoot, source);
    assert.equal(fs.existsSync(filePath), true, `${source}が存在する`);
    const geoJson = JSON.parse(fs.readFileSync(filePath, "utf8"));
    assert.equal(geoJson.type, "FeatureCollection");
    assert.equal(geoJson.features.length, featureCount, `${source}の図形数`);

    for (const feature of geoJson.features) {
      assert.equal(
        feature.properties.name,
        `${expectedDay.featurePrefix} ${start}-${end}`
      );
      assert.equal(feature.geometry.type, "Polygon");
      assert.ok(feature.geometry.coordinates.length >= 1);

      for (const ring of feature.geometry.coordinates) {
        assert.ok(ring.length >= 4, "ポリゴンは4点以上");
        assert.deepEqual(ring[0], ring.at(-1), "ポリゴンが閉じている");
        for (const [longitude, latitude] of ring) {
          assert.ok(longitude >= 140.5 && longitude <= 140.8, "経度が鹿嶋周辺");
          assert.ok(latitude >= 35.8 && latitude <= 36.1, "緯度が鹿嶋周辺");
        }
      }
    }
  }
}

assert.equal(totalSlots, 16, "3日間で合計16パターン");

console.log("traffic data tests: ok");
