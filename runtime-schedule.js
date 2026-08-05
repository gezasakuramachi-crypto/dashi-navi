(function attachRuntimeSchedule(root, factory) {
  const Traffic =
    typeof module === "object" && module.exports
      ? require("./traffic-schedule.js")
      : root.DashiNaviTraffic;
  const api = factory(Traffic);
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.DashiNaviRuntime = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createRuntimeSchedule(Traffic) {
  "use strict";

  const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

  function normalMode() {
    return { mode: "normal" };
  }

  function normalize(value) {
    if (value && value.mode === "test" && Traffic.parseJstDateTime(value.testDateTime)) {
      return { mode: "test", testDateTime: value.testDateTime };
    }

    if (
      value &&
      value.mode === "day-test" &&
      DATE_PATTERN.test(value.realDate || "") &&
      DATE_PATTERN.test(value.festivalDate || "") &&
      Traffic.parseJstDateTime(value.startsAt) &&
      Traffic.parseJstDateTime(value.endsAt)
    ) {
      const startsAt = Traffic.parseJstDateTime(value.startsAt);
      const endsAt = Traffic.parseJstDateTime(value.endsAt);
      if (startsAt.getTime() < endsAt.getTime()) {
        return {
          mode: "day-test",
          realDate: value.realDate,
          festivalDate: value.festivalDate,
          startsAt: value.startsAt,
          endsAt: value.endsAt
        };
      }
    }

    return normalMode();
  }

  function isDayTestActive(mode, actualNow) {
    if (!mode || mode.mode !== "day-test") return false;
    const nowMs = actualNow instanceof Date ? actualNow.getTime() : Number(actualNow);
    const start = Traffic.parseJstDateTime(mode.startsAt);
    const end = Traffic.parseJstDateTime(mode.endsAt);
    return Boolean(
      Number.isFinite(nowMs) &&
      start &&
      end &&
      nowMs >= start.getTime() &&
      nowMs < end.getTime()
    );
  }

  function resolve(value, actualNow) {
    const mode = normalize(value);
    if (mode.mode !== "day-test") return mode;
    return isDayTestActive(mode, actualNow) ? mode : normalMode();
  }

  function getEffectiveNow(value, actualNow) {
    const safeActualNow =
      actualNow instanceof Date && !Number.isNaN(actualNow.getTime())
        ? actualNow
        : new Date();
    const mode = resolve(value, safeActualNow);

    if (mode.mode === "test") {
      return Traffic.parseJstDateTime(mode.testDateTime) || safeActualNow;
    }
    if (mode.mode === "day-test") {
      return Traffic.mapJstTimeToDate(safeActualNow, mode.festivalDate) || safeActualNow;
    }
    return safeActualNow;
  }

  return {
    getEffectiveNow,
    isDayTestActive,
    normalMode,
    normalize,
    resolve
  };
});
