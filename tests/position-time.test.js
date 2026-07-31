"use strict";

const assert = require("node:assert/strict");

global.window = {
  DASHI_NAVI_CONFIG: {
    timeZone: "Asia/Tokyo",
    positionApi: {}
  },
  DashiNaviTraffic: {}
};

require("../app.js");

const { resolvePositionTimestamp } = window.DashiNaviApp;

assert.equal(
  resolvePositionTimestamp({
    deviceTime: "2026-07-31T00:20:33.000Z",
    fixTime: "2026-07-31T09:20:33.000Z",
    serverTime: "2026-07-31T09:20:34.951Z"
  }),
  "2026-07-31T09:20:33.000Z",
  "端末時刻にずれがある場合はGPS測位時刻を優先する"
);

assert.equal(
  resolvePositionTimestamp({
    deviceTime: "2026-07-31T00:20:33.000Z",
    serverTime: "2026-07-31T09:20:34.951Z"
  }),
  "2026-07-31T09:20:34.951Z",
  "GPS測位時刻がない場合はサーバー受信時刻を使う"
);

assert.equal(
  resolvePositionTimestamp({
    deviceTime: "2026-07-31T00:20:33.000Z"
  }),
  "2026-07-31T00:20:33.000Z",
  "他の時刻がない場合だけ端末時刻を使う"
);

console.log("position-time tests: ok");
