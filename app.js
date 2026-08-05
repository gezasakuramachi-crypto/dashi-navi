(function createDashiNaviApp() {
  "use strict";

  const CONFIG = window.DASHI_NAVI_CONFIG;
  const Traffic = window.DashiNaviTraffic;
  const Runtime = window.DashiNaviRuntime;

  if (!CONFIG || !Traffic || !Runtime) {
    throw new Error("山車ナビの設定ファイルを読み込めませんでした。");
  }

  const TRAFFIC_STYLE = {
    line: {
      strokeColor: "#f00000",
      strokeOpacity: 1,
      strokeWeight: 1.5,
      zIndex: 1800
    },
    polygon: {
      strokeColor: "#f00000",
      strokeOpacity: 1,
      strokeWeight: 1.5,
      fillColor: "#ff6996",
      fillOpacity: 0.34,
      zIndex: 1800
    }
  };
  const AUTO_TRAFFIC_VALUE = "__auto__";
  const MY_LOCATION_RADIUS_METERS = 15;
  const PAGE_PARAMS = new URLSearchParams(window.location.search);

  const state = {
    map: null,
    infoWindow: null,
    runtime: Runtime.normalMode(),
    preview: null,
    modeSignature: "",
    adminView: PAGE_PARAMS.get("admin") === "1",
    dashi: new Map(),
    positionApiFailed: false,
    trafficOverlays: [],
    trafficKey: null,
    trafficViewMode: "auto",
    trafficLoadVersion: 0,
    geoJsonCache: new Map(),
    trafficPanelOpen: false,
    toastTimer: null,
    myLocationMarker: null,
    myLocationCircle: null
  };

  const $ = (id) => document.getElementById(id);

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function showToast(message) {
    const toast = $("toast");
    window.clearTimeout(state.toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    state.toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 3200);
  }

  function readPreviewOverride() {
    if (PAGE_PARAMS.get("preview") !== "1") return null;
    try {
      const raw = localStorage.getItem(CONFIG.adminPreviewStorageKey);
      if (!raw) return null;
      return Runtime.normalize(JSON.parse(raw));
    } catch (error) {
      console.warn("管理者プレビュー設定を読み込めませんでした。", error);
      return null;
    }
  }

  function getRawMode() {
    return state.preview || state.runtime;
  }

  function getEffectiveMode(actualNow) {
    return Runtime.resolve(getRawMode(), actualNow || new Date());
  }

  function getEffectiveNow(actualNow) {
    return Runtime.getEffectiveNow(getRawMode(), actualNow || new Date());
  }

  function updateModeBanner() {
    const actualNow = new Date();
    const mode = getEffectiveMode(actualNow);
    const banner = $("testBanner");
    if (mode.mode === "test") {
      const testDate = Traffic.parseJstDateTime(mode.testDateTime);
      $("testBannerTime").textContent = testDate
        ? Traffic.formatJstDateTime(testDate)
        : "日時未設定";
      banner.hidden = false;
    } else if (mode.mode === "day-test") {
      const effectiveNow = getEffectiveNow(actualNow);
      $("testBannerTime").textContent =
        `${Number(mode.realDate.slice(5, 7))}/${Number(mode.realDate.slice(8, 10))}` +
        `→${Number(mode.festivalDate.slice(5, 7))}/${Number(mode.festivalDate.slice(8, 10))}` +
        `（${formatJstTime(effectiveNow)}）`;
      banner.hidden = false;
    } else {
      banner.hidden = true;
    }
  }

  async function loadRuntimeConfig(options) {
    const silent = Boolean(options && options.silent);
    const previousSignature = state.modeSignature;
    try {
      const response = await fetch(CONFIG.runtimeConfigUrl, { cache: "no-cache" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      state.runtime = Runtime.normalize(await response.json());
    } catch (error) {
      if (!silent) console.warn("公開モード設定を取得できないため通常モードで動作します。", error);
      state.runtime = Runtime.normalMode();
    }

    state.preview = readPreviewOverride();
    state.modeSignature = JSON.stringify(getEffectiveMode());
    updateModeBanner();

    if (previousSignature && previousSignature !== state.modeSignature && state.map) {
      state.trafficViewMode = "auto";
      await refreshPositions();
      await refreshAutoTraffic(true);
      populateTrafficSelectors();
    }
  }

  function activePublicPositionWindow() {
    return Traffic.findActiveSlot(
      CONFIG.publicPositionDays,
      getEffectiveNow(),
      { includeDraft: false }
    );
  }

  function isPositionVisible() {
    return state.adminView || Boolean(activePublicPositionWindow());
  }

  function hideDashiMarkers() {
    for (const entry of state.dashi.values()) {
      if (entry.marker) entry.marker.setMap(null);
    }
  }

  function updateStreamStatus() {
    const status = $("streamStatus");
    if (!status) return;

    if (!isPositionVisible()) {
      $("streamStatusTitle").textContent = "配信停止中";
      $("streamStatusText").textContent =
        "山車の現在地は運行時間中のみ表示します";
      status.classList.remove("error");
      status.hidden = false;
      return;
    }

    if (state.positionApiFailed) {
      $("streamStatusTitle").textContent = "位置情報を確認できません";
      $("streamStatusText").textContent =
        "通信状態を確認しながら自動で再接続しています";
      status.classList.add("error");
      status.hidden = false;
      return;
    }

    status.classList.remove("error");
    status.hidden = true;
  }

  function dashiStatus(dashiId) {
    if (!isPositionVisible()) {
      return { label: "配信停止中", stale: true };
    }
    const entry = state.dashi.get(dashiId);
    if (!entry || !entry.position) {
      return {
        label: state.positionApiFailed ? "位置情報を取得できません" : "位置情報準備中",
        stale: true
      };
    }
    if (entry.source === "test") {
      return { label: "テスト位置を表示中", stale: false };
    }

    const ageMs = Date.now() - entry.updatedAt.getTime();
    if (ageMs > CONFIG.positionApi.staleAfterMs) {
      return {
        label: `更新が止まっています（最終 ${formatJstTime(entry.updatedAt)}）`,
        stale: true
      };
    }
    return {
      label: `位置情報を受信中（${formatJstTime(entry.updatedAt)}更新）`,
      stale: false
    };
  }

  function formatJstTime(date) {
    return new Intl.DateTimeFormat("ja-JP", {
      timeZone: CONFIG.timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).format(date);
  }

  async function fetchLatestPosition(dashi) {
    const api = CONFIG.positionApi;
    if (!api.serverBase || !dashi.deviceId) return null;

    const url = `${api.serverBase}/api/positions?deviceId=${encodeURIComponent(dashi.deviceId)}&limit=1`;
    const response = await fetch(url, {
      cache: "no-store"
    });
    if (!response.ok) throw new Error(`位置取得失敗: HTTP ${response.status}`);
    const latest = await response.json();
    if (!latest) return null;

    const updatedAt = new Date(
      latest.deviceTime || latest.fixTime || latest.serverTime || Date.now()
    );
    return {
      lat: latest.latitude,
      lng: latest.longitude,
      updatedAt,
      source: "live"
    };
  }

  function resolveRouteUrl(dashi) {
    const routeUrls = dashi.routeUrls || {};
    const dateKey = Traffic.getJstDateKey(getEffectiveNow());
    return routeUrls[dateKey] || routeUrls.default || "";
  }

  function buildDashiInfo(dashi, entry) {
    const status = dashiStatus(dashi.id);
    const position = entry.position;
    const directionsUrl =
      `https://www.google.com/maps/dir/?api=1&destination=${position.lat},${position.lng}&travelmode=walking`;
    const routeUrl = resolveRouteUrl(dashi);
    const officialUrl = dashi.officialUrl || "";

    const routeButton = routeUrl
      ? `<a class="map-link" href="${escapeHtml(routeUrl)}" target="_blank" rel="noopener">経路図</a>`
      : '<span class="map-link-disabled">経路図（準備中）</span>';
    const officialButton = officialUrl
      ? `<a class="map-link" href="${escapeHtml(officialUrl)}" target="_blank" rel="noopener">公式HP</a>`
      : '<span class="map-link-disabled">公式HP（準備中）</span>';

    return `
      <div class="map-card">
        <h2>${escapeHtml(dashi.townName)} 山車</h2>
        <p class="map-status">${escapeHtml(status.label)}</p>
        <div class="map-card-actions">
          <a class="map-link" href="${escapeHtml(directionsUrl)}" target="_blank" rel="noopener">ここへ行く</a>
          ${routeButton}
          ${officialButton}
        </div>
        <p class="map-card-note">目的地はボタンを押した時点の山車位置です。交通規制と係員の案内を優先してください。</p>
      </div>
    `;
  }

  function ensureDashiMarker(dashi, position) {
    let entry = state.dashi.get(dashi.id);
    if (!entry) {
      entry = {};
      state.dashi.set(dashi.id, entry);
    }

    entry.position = { lat: position.lat, lng: position.lng };
    entry.updatedAt = position.updatedAt;
    entry.source = position.source;

    if (!entry.marker) {
      entry.marker = new google.maps.Marker({
        position: entry.position,
        map: state.map,
        title: `${dashi.townName} 山車`,
        zIndex: 5000,
        icon: {
          url: dashi.iconUrl,
          scaledSize: new google.maps.Size(42, 42)
        }
      });
      entry.marker.addListener("click", () => {
        state.infoWindow.setContent(buildDashiInfo(dashi, entry));
        state.infoWindow.open({ anchor: entry.marker, map: state.map });
      });
    } else {
      entry.marker.setPosition(entry.position);
      entry.marker.setMap(state.map);
    }
  }

  async function refreshOneDashi(dashi) {
    const mode = getEffectiveMode();
    let position = null;
    let requestFailed = false;

    if (!state.adminView && mode.mode === "test" && dashi.testPosition) {
      position = {
        ...dashi.testPosition,
        updatedAt: getEffectiveNow(),
        source: "test"
      };
    } else {
      try {
        position = await fetchLatestPosition(dashi);
      } catch (error) {
        requestFailed = true;
        console.warn(`${dashi.townName}の位置を取得できませんでした。`, error);
      }
    }

    if (position) {
      ensureDashiMarker(dashi, position);
      return true;
    }

    const entry = state.dashi.get(dashi.id);
    if (entry && entry.source === "test") {
      if (entry.marker) entry.marker.setMap(null);
      state.dashi.delete(dashi.id);
    }
    return !requestFailed;
  }

  async function refreshPositions() {
    if (!isPositionVisible()) {
      state.positionApiFailed = false;
      hideDashiMarkers();
      updateStreamStatus();
      renderDashiList();
      return;
    }

    const dashis = CONFIG.dashis.filter((dashi) => dashi.visible);
    const results = await Promise.all(dashis.map(refreshOneDashi));
    state.positionApiFailed = results.some((result) => result === false);
    updateStreamStatus();
    renderDashiList();
  }

  function renderDashiList() {
    const container = $("dashiList");
    container.innerHTML = "";

    for (const dashi of CONFIG.dashis.filter((item) => item.visible)) {
      const entry = state.dashi.get(dashi.id);
      const status = dashiStatus(dashi.id);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "dashi-card";
      button.innerHTML = `
        <img src="${escapeHtml(dashi.iconUrl)}" alt="">
        <span>
          <strong>${escapeHtml(dashi.townName)}</strong>
          <small>${escapeHtml(status.label)}</small>
        </span>
        <span class="chevron" aria-hidden="true">›</span>
      `;
      button.addEventListener("click", () => {
        if (!entry || !entry.marker) {
          showToast(`${dashi.townName}の位置情報は準備中です`);
          return;
        }
        closeDashiSheet();
        focusDashi(entry);
      });
      container.appendChild(button);
    }
  }

  function focusDashi(entry) {
    state.map.panTo(entry.marker.getPosition());
    if ((state.map.getZoom() || 0) < 17) state.map.setZoom(17);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      entry.marker.setAnimation(google.maps.Animation.BOUNCE);
      window.setTimeout(() => entry.marker.setAnimation(null), 1200);
    }
  }

  function openDashiSheet() {
    closeTrafficPanel();
    renderDashiList();
    $("sheetBackdrop").hidden = false;
    $("dashiSheet").hidden = false;
    $("dashiSheet").classList.add("open");
    $("bDashi").classList.add("active");
  }

  function closeDashiSheet() {
    $("sheetBackdrop").hidden = true;
    $("dashiSheet").classList.remove("open");
    $("dashiSheet").hidden = true;
    $("bDashi").classList.remove("active");
  }

  async function fetchGeoJson(url) {
    if (state.geoJsonCache.has(url)) return state.geoJsonCache.get(url);
    const response = await fetch(url, { cache: "no-cache" });
    if (!response.ok) throw new Error(`交通規制図を取得できません: HTTP ${response.status}`);
    const geoJson = await response.json();
    state.geoJsonCache.set(url, geoJson);
    return geoJson;
  }

  function geometryOverlays(geometry) {
    if (!geometry) return [];
    const overlays = [];
    const toPath = (coordinates) =>
      coordinates.map(([lng, lat]) => ({ lat, lng }));

    if (geometry.type === "LineString") {
      overlays.push(new google.maps.Polyline({
        path: toPath(geometry.coordinates),
        ...TRAFFIC_STYLE.line
      }));
    } else if (geometry.type === "MultiLineString") {
      for (const line of geometry.coordinates) {
        overlays.push(new google.maps.Polyline({
          path: toPath(line),
          ...TRAFFIC_STYLE.line
        }));
      }
    } else if (geometry.type === "Polygon") {
      overlays.push(new google.maps.Polygon({
        paths: geometry.coordinates.map(toPath),
        ...TRAFFIC_STYLE.polygon
      }));
    } else if (geometry.type === "MultiPolygon") {
      for (const polygon of geometry.coordinates) {
        overlays.push(new google.maps.Polygon({
          paths: polygon.map(toPath),
          ...TRAFFIC_STYLE.polygon
        }));
      }
    }
    return overlays;
  }

  function clearTrafficOverlays() {
    for (const overlay of state.trafficOverlays) overlay.setMap(null);
    state.trafficOverlays = [];
    state.trafficKey = null;
  }

  async function showTrafficMatch(match, force) {
    const nextKey = match ? `${match.day.id}:${match.slot.id}` : null;
    if (!force && state.trafficKey === nextKey) return;

    const loadVersion = ++state.trafficLoadVersion;
    clearTrafficOverlays();
    if (!match) return;

    try {
      const geoJson = await fetchGeoJson(match.slot.src);
      if (loadVersion !== state.trafficLoadVersion) return;
      const overlays = (geoJson.features || []).flatMap((feature) =>
        geometryOverlays(feature.geometry)
      );
      for (const overlay of overlays) overlay.setMap(state.map);
      state.trafficOverlays = overlays;
      state.trafficKey = nextKey;
    } catch (error) {
      console.warn(error);
      showToast("交通規制図を読み込めませんでした");
    }
  }

  function trafficDaysForCurrentMode() {
    const includeDraft = getEffectiveMode().mode === "test";
    return Traffic.eligibleDays(CONFIG.trafficDays, includeDraft);
  }

  function setTrafficSummary(match, isManual) {
    const summary = $("trafficSummary");
    const mode = getEffectiveMode();
    const notice = $("trafficNotice");

    if (match) {
      const draftNotice = match.day.note && mode.mode === "test"
        ? `${match.day.note}。`
        : "";
      if (isManual) {
        summary.textContent = `${match.day.label} ${match.slot.label}（指定表示）`;
        notice.textContent =
          `${draftNotice}選択した時間帯を固定表示中です。現在時刻による自動変更は行いません。`;
      } else {
        summary.textContent = `自動変更：${match.day.label} ${match.slot.label}`;
        notice.textContent =
          `${draftNotice}現在時刻に合わせて自動変更中です。実際の規制は警察官・係員の指示を優先してください。`;
      }
    } else {
      const days = trafficDaysForCurrentMode();
      summary.textContent = days.length
        ? "自動変更：現在実施中の交通規制はありません"
        : "令和8年の交通規制図は準備中です";
      if (mode.mode === "test") {
        notice.textContent = "自動変更中です。テスト日時に該当する規制はありません。";
      } else if (days.length) {
        notice.textContent = "自動変更中です。規制時間外のため、規制図は表示していません。";
      } else {
        notice.textContent = "正式な交通規制図の公開後に自動表示します。";
      }
    }
  }

  async function refreshAutoTraffic(force) {
    if (state.trafficViewMode !== "auto") return;
    const mode = getEffectiveMode();
    const match = Traffic.findActiveSlot(CONFIG.trafficDays, getEffectiveNow(), {
      includeDraft: mode.mode === "test"
    });
    await showTrafficMatch(match, force);
    setTrafficSummary(match, false);
  }

  function findTrafficMatch(dayId, slotId) {
    const day = trafficDaysForCurrentMode().find((item) => item.id === dayId);
    if (!day) return null;
    const slot = (day.slots || []).find((item) => item.id === slotId);
    return slot ? { day, slot } : null;
  }

  async function showManualTraffic(dayId, slotId) {
    const match = findTrafficMatch(dayId, slotId);
    if (!match) return;
    state.trafficViewMode = "manual";
    await showTrafficMatch(match, true);
    setTrafficSummary(match, true);
  }

  function populateSlotSelector(dayId, preferredSlotId) {
    const slotSelect = $("trafficSlot");
    const slotFields = $("trafficSlotFields");
    slotFields.hidden = dayId === AUTO_TRAFFIC_VALUE;
    slotSelect.innerHTML = "";

    if (dayId === AUTO_TRAFFIC_VALUE) {
      slotSelect.add(new Option("現在時刻に合わせて自動変更", ""));
      slotSelect.disabled = true;
      return;
    }

    const day = trafficDaysForCurrentMode().find((item) => item.id === dayId);

    if (!day || !(day.slots || []).length) {
      slotSelect.add(new Option("時間帯なし", ""));
      slotSelect.disabled = true;
      return;
    }

    for (const slot of day.slots) {
      slotSelect.add(new Option(slot.label, slot.id));
    }
    slotSelect.disabled = false;
    if (preferredSlotId && day.slots.some((slot) => slot.id === preferredSlotId)) {
      slotSelect.value = preferredSlotId;
    }
  }

  function populateTrafficSelectors() {
    const daySelect = $("trafficDay");
    const previousDay = daySelect.value;
    const previousSlot = $("trafficSlot").value;
    const days = trafficDaysForCurrentMode();
    daySelect.innerHTML = "";
    daySelect.add(new Option("自動変更（現在時刻）", AUTO_TRAFFIC_VALUE));

    for (const day of days) {
      const label = day.note && getEffectiveMode().mode === "test"
        ? `${day.label}（仮）`
        : day.label;
      daySelect.add(new Option(label, day.id));
    }
    daySelect.disabled = false;
    if (state.trafficViewMode === "auto" || !days.length) {
      daySelect.value = AUTO_TRAFFIC_VALUE;
    } else if (days.some((day) => day.id === previousDay)) {
      daySelect.value = previousDay;
    } else {
      daySelect.value = days[0].id;
    }
    populateSlotSelector(daySelect.value, previousSlot);
  }

  function openTrafficPanel() {
    closeDashiSheet();
    populateTrafficSelectors();
    state.trafficPanelOpen = true;
    $("trafficPanel").hidden = false;
    $("trafficPanel").classList.add("open");
    $("bTraffic").classList.add("active");
    $("bTraffic").setAttribute("aria-expanded", "true");
  }

  function closeTrafficPanel() {
    state.trafficPanelOpen = false;
    $("trafficPanel").classList.remove("open");
    $("trafficPanel").hidden = true;
    $("bTraffic").classList.remove("active");
    $("bTraffic").setAttribute("aria-expanded", "false");
  }

  function toggleTrafficPanel() {
    if (state.trafficPanelOpen) closeTrafficPanel();
    else openTrafficPanel();
  }

  function openHelp() {
    closeTrafficPanel();
    closeDashiSheet();
    $("helpModal").hidden = false;
    $("helpModal").classList.add("open");
    $("bHelp").classList.add("active");
  }

  function closeHelp() {
    $("helpModal").classList.remove("open");
    $("helpModal").hidden = true;
    $("bHelp").classList.remove("active");
  }

  function showMyLocation() {
    if (!navigator.geolocation) {
      showToast("この端末では現在地を取得できません");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (result) => {
        const position = {
          lat: result.coords.latitude,
          lng: result.coords.longitude
        };
        state.map.panTo(position);
        if ((state.map.getZoom() || 0) < 17) state.map.setZoom(17);

        if (state.myLocationMarker) state.myLocationMarker.setMap(null);
        if (state.myLocationCircle) state.myLocationCircle.setMap(null);

        state.myLocationMarker = new google.maps.Marker({
          position,
          map: state.map,
          title: "現在地",
          zIndex: 6000,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: "#4285f4",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2
          }
        });
        state.myLocationCircle = new google.maps.Circle({
          map: state.map,
          center: position,
          radius: MY_LOCATION_RADIUS_METERS,
          zIndex: 5900,
          strokeColor: "#4285f4",
          strokeOpacity: 0.5,
          strokeWeight: 1,
          fillColor: "#4285f4",
          fillOpacity: 0.14
        });
      },
      () => showToast("現在地を取得できませんでした。位置情報の許可をご確認ください。"),
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 12000
      }
    );
  }

  function poiInfoContent(point) {
    const photo = point.photo
      ? `<img src="${escapeHtml(point.photo)}" alt="">`
      : "";
    const description = point.description
      ? `<p>${escapeHtml(point.description)}</p>`
      : "";
    return `
      <div class="map-card poi-card">
        <h2>${escapeHtml(point.title || "場所")}</h2>
        ${photo}
        ${description}
      </div>
    `;
  }

  function addPoiMarkers() {
    const groups = [
      { points: CONFIG.poi.information, icon: CONFIG.icons.info },
      { points: CONFIG.poi.toilets, icon: CONFIG.icons.wc },
      { points: CONFIG.poi.parking, icon: CONFIG.icons.parking }
    ];

    for (const group of groups) {
      for (const point of group.points) {
        const marker = new google.maps.Marker({
          position: { lat: point.lat, lng: point.lng },
          map: state.map,
          title: point.title,
          zIndex: 2600,
          icon: {
            url: group.icon,
            scaledSize: new google.maps.Size(22, 22)
          }
        });
        marker.addListener("click", () => {
          state.infoWindow.setContent(poiInfoContent(point));
          state.infoWindow.open({ anchor: marker, map: state.map });
        });
      }
    }
  }

  async function applyMapViewport() {
    try {
      const response = await fetch(CONFIG.mapViewportUrl);
      if (!response.ok) return;
      const geoJson = await response.json();
      const coordinates = [];
      const pushCoordinate = ([lng, lat]) => coordinates.push({ lat, lng });

      for (const feature of geoJson.features || []) {
        const geometry = feature.geometry;
        if (!geometry) continue;
        if (geometry.type === "Polygon") geometry.coordinates.flat().forEach(pushCoordinate);
        if (geometry.type === "LineString") geometry.coordinates.forEach(pushCoordinate);
        if (geometry.type === "MultiPolygon") geometry.coordinates.flat(2).forEach(pushCoordinate);
        if (geometry.type === "MultiLineString") geometry.coordinates.flat().forEach(pushCoordinate);
      }

      if (!coordinates.length) return;
      const bounds = new google.maps.LatLngBounds();
      coordinates.forEach((coordinate) => bounds.extend(coordinate));
      state.map.fitBounds(bounds);
      google.maps.event.addListenerOnce(state.map, "idle", () => {
        state.map.setZoom(Math.min((state.map.getZoom() || CONFIG.mapZoom) + 2, 20));
      });
      state.map.setOptions({
        restriction: { latLngBounds: bounds, strictBounds: true }
      });
    } catch (error) {
      console.warn("地図の表示範囲を設定できませんでした。", error);
    }
  }

  function wireUiEvents() {
    $("bDashi").addEventListener("click", openDashiSheet);
    $("dashiSheetClose").addEventListener("click", closeDashiSheet);
    $("sheetBackdrop").addEventListener("click", closeDashiSheet);

    $("bTraffic").addEventListener("click", toggleTrafficPanel);
    $("trafficClose").addEventListener("click", closeTrafficPanel);
    $("trafficDay").addEventListener("change", async (event) => {
      if (event.target.value === AUTO_TRAFFIC_VALUE) {
        state.trafficViewMode = "auto";
        populateSlotSelector(AUTO_TRAFFIC_VALUE, "");
        await refreshAutoTraffic(true);
        return;
      }
      populateSlotSelector(event.target.value, "");
      await showManualTraffic(event.target.value, $("trafficSlot").value);
    });
    $("trafficSlot").addEventListener("change", async (event) => {
      await showManualTraffic($("trafficDay").value, event.target.value);
    });

    $("bMyLoc").addEventListener("click", showMyLocation);
    $("bHelp").addEventListener("click", openHelp);
    $("helpClose").addEventListener("click", closeHelp);
    $("helpModal").addEventListener("click", (event) => {
      if (event.target === $("helpModal")) closeHelp();
    });

    document.addEventListener("click", (event) => {
      if (!state.trafficPanelOpen) return;
      if ($("trafficPanel").contains(event.target) || $("bTraffic").contains(event.target)) return;
      closeTrafficPanel();
    });

    document.addEventListener("click", (event) => {
      if (!state.infoWindow || !(event.target instanceof Element)) return;
      if (event.target.closest(".gm-style-iw-c")) return;

      // 地図上は map の click イベントへ任せることで、マーカーを押して
      // 開いた直後のインフォメーションが閉じることを防ぎます。
      if ($("map").contains(event.target)) return;
      state.infoWindow.close();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      closeTrafficPanel();
      closeDashiSheet();
      closeHelp();
      if (state.infoWindow) state.infoWindow.close();
    });
  }

  function refreshAfterResume() {
    if (document.visibilityState === "hidden") return;
    refreshPositions();
    refreshAutoTraffic(true);
    loadRuntimeConfig({ silent: true });
  }

  function startRefreshEvents() {
    window.setInterval(refreshPositions, CONFIG.positionApi.pollMs);
    window.setInterval(() => refreshAutoTraffic(false), CONFIG.positionApi.pollMs);
    window.setInterval(
      () => loadRuntimeConfig({ silent: true }),
      CONFIG.runtimeConfigRefreshMs
    );

    document.addEventListener("visibilitychange", refreshAfterResume);
    window.addEventListener("focus", refreshAfterResume);
    window.addEventListener("pageshow", refreshAfterResume);
    window.addEventListener("online", refreshAfterResume);
  }

  async function initMap() {
    await loadRuntimeConfig();

    state.map = new google.maps.Map($("map"), {
      center: CONFIG.mapCenter,
      zoom: CONFIG.mapZoom,
      mapTypeControl: false,
      fullscreenControl: true,
      streetViewControl: false,
      // Google Maps標準施設の吹き出しは表示せず、祭礼用マーカーだけを操作対象にします。
      clickableIcons: false,
      gestureHandling: "greedy"
    });
    state.infoWindow = new google.maps.InfoWindow({ headerDisabled: true });
    state.map.addListener("click", () => state.infoWindow.close());

    $("mapLoading").hidden = true;
    wireUiEvents();
    addPoiMarkers();
    await applyMapViewport();
    await refreshPositions();
    populateTrafficSelectors();
    await refreshAutoTraffic(true);
    startRefreshEvents();
  }

  function bootGoogleMaps() {
    if (!CONFIG.googleMapsApiKey) {
      $("mapLoading").textContent = "Google Maps APIキーが未設定です";
      return;
    }

    window.initMap = initMap;
    const script = document.createElement("script");
    script.async = true;
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(CONFIG.googleMapsApiKey)}` +
      "&callback=initMap&v=weekly&language=ja&region=JP";
    script.onerror = () => {
      $("mapLoading").textContent = "地図を読み込めませんでした";
    };
    document.head.appendChild(script);
  }

  window.DashiNaviApp = { bootGoogleMaps };
})();
