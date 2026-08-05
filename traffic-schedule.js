(function attachTrafficSchedule(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.DashiNaviTraffic = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createTrafficSchedule() {
  "use strict";

  function toJstEpoch(dateText, timeText) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText || "")) return NaN;
    if (!/^\d{2}:\d{2}$/.test(timeText || "")) return NaN;
    return Date.parse(`${dateText}T${timeText}:00+09:00`);
  }

  function parseJstDateTime(value) {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value || "")) return null;
    const parsed = new Date(`${value}:00+09:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function getJstParts(date) {
    const parts = new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23"
    }).formatToParts(date);

    return Object.fromEntries(parts.map((part) => [part.type, part.value]));
  }

  function getJstDateKey(date) {
    const p = getJstParts(date);
    return `${p.year}-${p.month}-${p.day}`;
  }

  function toJstInputValue(date) {
    const p = getJstParts(date);
    return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
  }

  function formatJstDateTime(date) {
    return new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).format(date);
  }

  function mapJstTimeToDate(date, targetDateText) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDateText || "")) return null;
    const p = getJstParts(date);
    const mapped = new Date(
      `${targetDateText}T${p.hour}:${p.minute}:${p.second}+09:00`
    );
    return Number.isNaN(mapped.getTime()) ? null : mapped;
  }

  function eligibleDays(days, includeDraft) {
    return (days || []).filter((day) => includeDraft || day.published);
  }

  function findActiveSlot(days, now, options) {
    const includeDraft = Boolean(options && options.includeDraft);
    const nowMs = now instanceof Date ? now.getTime() : Number(now);
    if (!Number.isFinite(nowMs)) return null;

    for (const day of eligibleDays(days, includeDraft)) {
      for (const slot of day.slots || []) {
        const startMs = toJstEpoch(day.date, slot.start);
        const endMs = toJstEpoch(day.date, slot.end);
        if (Number.isNaN(startMs) || Number.isNaN(endMs)) continue;
        if (nowMs >= startMs && nowMs < endMs) {
          return { day, slot, startMs, endMs };
        }
      }
    }
    return null;
  }

  return {
    eligibleDays,
    findActiveSlot,
    formatJstDateTime,
    getJstDateKey,
    getJstParts,
    mapJstTimeToDate,
    parseJstDateTime,
    toJstEpoch,
    toJstInputValue
  };
});
