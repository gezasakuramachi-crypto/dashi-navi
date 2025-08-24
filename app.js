/* ================= 設定 ================= */
const CONFIG = {
  // ※APIキーの読み込みは index.html 側の <script src="...maps..."> が担当
  SERVER_BASE: "https://traccar-railway.fly.dev",
  DEVICE_ID: 1,
  PUBLIC_BEARER:
    "RzBFAiAaeMvmv32ZrmskwLBY7hx0jHxCezE-NGOh_K2-QFuHgQIhAOY_es0TTwL-GX4pbel4G6wxKQcYjJd1EgtRzGKhSlQ7eyJ1Ijo2LCJlIjoiMjAyNS0wOC0yN1QxNTowMDowMC4wMDArMDA6MDAifQ",
  POLL_MS: 5000,
  DASHI_ICON:
    "https://www.dropbox.com/scl/fi/echpcekhl6f13c9df5uzh/sakura.png?rlkey=e93ng3fdwbdlkvr07zkvw9pph&raw=1",
  DASHI_PHOTO:
    "https://gezasakuramachi-crypto.github.io/dashi-navi/mark/sakura-konohana_R.png", // ← 山車のInfoWindowに表示
};

// 地図外観（ライト＆POI少なめ）
const MAP_CENTER = { lat: 35.966, lng: 140.628 };
const MAP_ZOOM = 15;
const MAP_STYLE = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
];

// 歩行者専用の強調（道路色が変わったように見せる三層）
const STROKE = {
  casing: { strokeColor: "#ffffff", strokeOpacity: 1, strokeWeight: 10, zIndex: 1001 },
  main: { strokeColor: "#6bc06b", strokeOpacity: 0.95, strokeWeight: 6, zIndex: 1002 },
  glow: { strokeColor: "#6bc06b", strokeOpacity: 0.25, strokeWeight: 14, zIndex: 1000 },
};

/* ================== イベント系マーカー定義 ================== */
// 共通：タイトル先頭の丸数字や記号を落とす
const cleanTitle = (s) => String(s || "").replace(/^[\s\u2460-\u2473\u3251-\u325F\u32B1-\u32BF\u3000・\-\d\.\(\)]+/, "");

// アイコン
const ICONS = {
  info: "https://gezasakuramachi-crypto.github.io/dashi-navi/mark/info.png",
  wc:   "https://gezasakuramachi-crypto.github.io/dashi-navi/mark/wc.png",
  park: "https://gezasakuramachi-crypto.github.io/dashi-navi/mark/parking.png",
};

// ■インフォメーション
const INFO_POINTS = [
  {
    title: "年番引継ぎ会場",
    lat: 35.9658889, lng: 140.6268333,
    photo: "https://gezasakuramachi-crypto.github.io/dashi-navi/mark/nen-hiki.png",
    desc: [
      "9月2日18:15～",
      "山車の運行を執り仕切るのが「山車年番」です。",
      "今年の年番が、次年度年番町内に",
      "お伺いをたて引継ぐことを「年番引継」といいます。"
    ].join("\n"),
  },
  {
    title: "にぎわい広場",
    lat: 35.9664167, lng: 140.6277778,
    photo: "", // なし
    desc: "飲食販売屋台あり。\nトイレ・休憩スペースもあります。",
  },
  {
    title: "総踊りのの字廻し会場",
    lat: 35.9679444, lng: 140.6300278,
    photo: "https://gezasakuramachi-crypto.github.io/dashi-navi/mark/souodori2.png",
    desc: [
      "9月1日18:00～",
      "町内の山車が勢ぞろいして、",
      "全町内が年番区の演奏にあわせて",
      "総踊りをします。",
      "その後は各町内による、",
      "のの字廻しが披露されます。"
    ].join("\n"),
  },
  {
    title: "一斉踊り会場",
    lat: 35.9670556, lng: 140.6306944,
    photo: "",
    desc: [
      "9月2日13:30～",
      "五ケ町が終結し、各町内が",
      "順番に踊りを踊っていきます。",
      "その後年番区を先頭に",
      "役曳きをして全町内を曳きまわします。"
    ].join("\n"),
  },
  {
    title: "大町通り山車集合",
    lat: 35.9679722, lng: 140.6286944,
    photo: "",
    desc: [
      "9/1 15:10-16:00",
      "9/2 15:00-15:30",
      "五ヶ町の山車が大町通り",
      "に並びます"
    ].join("\n"),
  },
];

// ■トイレ
const WC_POINTS = [
  { title: "鹿島神宮公衆トイレ",          lat: 35.9679444, lng: 140.6305833 },
  { title: "にぎわい広場 トイレ",          lat: 35.9664167, lng: 140.6278611 },
  { title: "鹿嶋市宮中地区駐車場 トイレ",  lat: 35.9665000, lng: 140.6318056 },
  { title: "道祖神児童公園 公衆トイレ",    lat: 35.9639444, lng: 140.6292778 },
  { title: "観光案内所 公衆トイレ",        lat: 35.9672778, lng: 140.6266944 },
];

// ■駐車場
const PARK_POINTS = [
  { title: "鹿嶋市宮中地区駐車場",         lat: 35.9665833, lng: 140.6320000 },
  { title: "鹿嶋市営鹿島神宮駅西駐車場",   lat: 35.9700000, lng: 140.6238333 },
];

/* ================= 交通規制スロット（そのまま） ================= */
const DAYS = [
  {
    id: "d1",
    label: "9/1（日）",
    slots: [
      { name: "9/1 10:30–15:00", start: "2025-09-01T10:30:00+09:00", end: "2025-09-01T15:00:00+09:00", src: "data/91-1030-1500map.geojson" },
      { name: "9/1 15:00–16:00", start: "2025-09-01T15:00:00+09:00", end: "2025-09-01T16:00:00+09:00", src: "data/91-1500-1600.geojson" },
      { name: "9/1 16:00–19:30", start: "2025-09-01T16:00:00+09:00", end: "2025-09-01T19:30:00+09:00", src: "data/91-1600-1930.geojson" },
      { name: "9/1 19:30–20:45", start: "2025-09-01T19:30:00+09:00", end: "2025-09-01T20:45:00+09:00", src: "data/91-1930-2045.geojson" },
      { name: "9/1 20:45–22:00", start: "2025-09-01T20:45:00+09:00", end: "2025-09-01T22:00:00+09:00", src: "data/91-2045-2200.geojson" },
    ],
  },
  {
    id: "d2",
    label: "9/2（月）",
    slots: [
      { name: "9/2 11:00–12:30", start: "2025-09-02T11:00:00+09:00", end: "2025-09-02T12:30:00+09:00", src: "data/92-1100-1230.geojson" },
      { name: "9/2 12:30–14:00", start: "2025-09-02T12:30:00+09:00", end: "2025-09-02T14:00:00+09:00", src: "data/92-1230-1400.geojson" },
      { name: "9/2 14:00–16:30", start: "2025-09-02T14:00:00+09:00", end: "2025-09-02T16:30:00+09:00", src: "data/92-1400-1630.geojson" },
      { name: "9/2 16:30–19:00", start: "2025-09-02T16:30:00+09:00", end: "2025-09-02T19:00:00+09:00", src: "data/92-1630-1900.geojson" },
      { name: "9/2 19:00–19:30", start: "2025-09-02T19:00:00+09:00", end: "2025-09-02T19:30:00+09:00", src: "data/92-1900-1930.geojson" },
      { name: "9/2 19:30–22:00", start: "2025-09-02T19:30:00+09:00", end: "2025-09-02T22:00:00+09:00", src: "data/92-1930-2200.geojson" },
    ],
  },
];

/* ================= メイン ================= */
let map, dashMarker, dashInfo, routePolyline;
let lastFixMs = 0, pollTimer = null;

// 規制描画用
let currentDayId = DAYS[0].id;
const layers = new Map(); // key: slot.start → [Polyline...]
const loadedCache = new Map(); // src -> [{path:[lat,lng], note?}...]

// Google Maps APIのcallback
window.initMap = function () {
  map = new google.maps.Map(document.getElementById("map"), {
    center: MAP_CENTER,
    zoom: MAP_ZOOM,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    gestureHandling: "greedy",
    styles: MAP_STYLE,
  });

  /* 山車マーカー */
  dashMarker = new google.maps.Marker({
    map,
    position: MAP_CENTER,
    icon: {
      url: CONFIG.DASHI_ICON,
      size: new google.maps.Size(48, 48),
      scaledSize: new google.maps.Size(48, 48),
      anchor: new google.maps.Point(24, 38),
    },
    zIndex: 2000,
    title: "桜町区山車",
  });

  dashInfo = new google.maps.InfoWindow({ content: makeDashiBody("判定中") });
  dashMarker.addListener("click", () => {
    dashInfo.setContent(makeDashiBody(currentStatusText()));
    dashInfo.open(map, dashMarker);
    setInfoBar(dashInfo, formatLastFixBar());
  });

  map.addListener("click", () => dashInfo.close());

  /* 現在地ポーリング */
  startPolling();

  /* 規制UI構築 */
  setupRegulationUI();

  /* カテゴリーマーカー設置 */
  addCategoryMarkers(INFO_POINTS, ICONS.info, 1500);
  addCategoryMarkers(WC_POINTS,   ICONS.wc,   1200);
  addCategoryMarkers(PARK_POINTS, ICONS.park, 1200);

  // 初期：現在時刻に合うスロット自動表示
  autoShow(new Date());
};

/* ========== 山車の位置ポーリング ========== */
function startPolling() {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(fetchPosition, CONFIG.POLL_MS);
  fetchPosition();
}
async function fetchPosition() {
  try {
    const url = `${CONFIG.SERVER_BASE}/api/positions?deviceId=${CONFIG.DEVICE_ID}&latest=true`;
    const res = await fetch(url, { cache: "no-store", headers: { Authorization: `Bearer ${CONFIG.PUBLIC_BEARER}` } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || !data.length) return;

    const p = data[data.length - 1];
    const pos = { lat: p.latitude, lng: p.longitude };
    lastFixMs = new Date(p.fixTime || p.deviceTime || p.serverTime || Date.now()).getTime();

    dashMarker.setPosition(pos);

    // 簡易軌跡
    if (!routePolyline) {
      routePolyline = new google.maps.Polyline({ map, strokeColor: "#1a73e8", strokeOpacity: 0.85, strokeWeight: 3 });
    }
    const path = routePolyline.getPath();
    const last = path.getLength() ? path.getAt(path.getLength() - 1) : null;
    if (!last || last.lat() !== pos.lat || last.lng() !== pos.lng) path.push(pos);

    if (dashInfo && dashInfo.getMap()) {
      dashInfo.setContent(makeDashiBody(currentStatusText()));
      setInfoBar(dashInfo, formatLastFixBar());
    }
  } catch (e) {
    console.warn(e);
  }
}
function currentStatusText() {
  const now = Date.now();
  return now - lastFixMs > Math.max(20000, CONFIG.POLL_MS * 4) ? "停止中" : "更新中";
}
function formatLastFixBar() {
  if (!lastFixMs) return "";
  const dt = new Date(lastFixMs);
  const s = dt.toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
  return `最終更新: ${s}`;
}
function makeDashiBody(status) {
  const pos = dashMarker.getPosition();
  const lat = pos.lat(), lng = pos.lng();
  const routeUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  // ← 画像を「最終更新」の下に挿入
  return `
    <div class="iw">
      <div class="title">桜町区山車</div>
      <div>最終更新：${formatLastFixBar().replace("最終更新: ","")}</div>
      <img class="photo" src="${CONFIG.DASHI_PHOTO}" alt="桜町区山車 画像">
      <div>ステータス：${status}</div>
      <button class="btn" onclick="window.open('${routeUrl}','_blank')">山車までのルート案内</button>
    </div>
  `;
}
function setInfoBar(iw, text) {
  google.maps.event.addListenerOnce(iw, "domready", () => {
    const root = document.querySelector(".gm-style-iw");
    if (!root) return;
    const scroll = root.querySelector(".gm-style-iw-d");
    if (!scroll) return;
    let barEl = root.querySelector(".iw-bar");
    if (text && text.trim()) {
      if (!barEl) {
        barEl = document.createElement("div");
        barEl.className = "iw-bar";
        root.appendChild(barEl);
      }
      barEl.textContent = text.trim();
      scroll.classList.add("iw-with-bar");
    } else {
      if (barEl) barEl.remove();
      scroll.classList.remove("iw-with-bar");
    }
  });
}

/* ========== カテゴリーマーカー描画 ========== */
function addCategoryMarkers(list, iconUrl, zIndex = 1000) {
  const iw = new google.maps.InfoWindow();
  const icon = {
    url: iconUrl,
    size: new google.maps.Size(36, 36),
    scaledSize: new google.maps.Size(36, 36),
    anchor: new google.maps.Point(18, 30),
  };
  list.forEach((p) => {
    const m = new google.maps.Marker({
      map,
      position: { lat: p.lat, lng: p.lng },
      icon,
      zIndex,
      title: cleanTitle(p.title),
    });
    m.addListener("click", () => {
      const title = cleanTitle(p.title);
      const photoHtml = p.photo ? `<img class="photo" src="${p.photo}" alt="${title}">` : "";
      const body = escapeHtml(String(p.desc || "")).replace(/\n/g, "<br>");
      iw.setContent(`
        <div class="iw">
          <div class="title">${escapeHtml(title)}</div>
          ${photoHtml}
          <div>${body}</div>
        </div>
      `);
      iw.open(map, m);
      setInfoBar(iw, ""); // インフォはバーなし
    });
  });
}

/* ========== 交通規制レイヤーUI ========== */
function setupRegulationUI() {
  const openBtn = document.getElementById("openBtn");
  const drawer = document.getElementById("drawer");
  openBtn.addEventListener("click", () => {
    drawer.style.display = drawer.style.display === "none" ? "block" : "none";
  });

  // 日付タブ
  const dayTabs = document.getElementById("dayTabs");
  dayTabs.innerHTML = "";
  DAYS.forEach((d) => {
    const b = document.createElement("button");
    b.textContent = d.label;
    b.className = "btn";
    b.style.flex = "1";
    if (d.id === currentDayId) b.classList.add("active");
    b.addEventListener("click", () => {
      currentDayId = d.id;
      [...dayTabs.children].forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      if (document.getElementById("manualPane").style.display !== "none") buildManualList();
      autoShow(new Date());
    });
    dayTabs.appendChild(b);
  });

  // 自動/手動
  const tabAuto = document.getElementById("tabAuto");
  const tabManual = document.getElementById("tabManual");
  tabAuto.addEventListener("click", () => {
    tabAuto.classList.add("active");
    tabManual.classList.remove("active");
    document.getElementById("autoPane").style.display = "grid";
    document.getElementById("manualPane").style.display = "none";
    autoShow(new Date());
  });
  tabManual.addEventListener("click", () => {
    tabManual.classList.add("active");
    tabAuto.classList.remove("active");
    document.getElementById("autoPane").style.display = "none";
    document.getElementById("manualPane").style.display = "grid";
    buildManualList();
  });

  // 自動モード UI
  const useNow = document.getElementById("useNow");
  const when = document.getElementById("when");
  const refresh = document.getElementById("refresh");
  const d = new Date();
  when.value = toLocalInputValue(d);
  when.disabled = true;
  useNow.addEventListener("change", () => (when.disabled = useNow.checked));
  refresh.addEventListener("click", () => {
    const t = useNow.checked ? new Date() : new Date(when.value);
    autoShow(t);
  });
}

function toLocalInputValue(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// 手動リスト
function buildManualList() {
  const box = document.getElementById("slotList");
  box.innerHTML = "";
  const day = DAYS.find((d) => d.id === currentDayId);
  day.slots.forEach((s, idx) => {
    const id = `chk_${currentDayId}_${idx}`;
    const div = document.createElement("label");
    div.className = "tag";
    div.innerHTML = `<input type="checkbox" id="${id}" style="margin-right:6px">${s.name}`;
    box.appendChild(div);
    const chk = div.querySelector("input");
    chk.addEventListener("change", async (e) => {
      if (e.target.checked) {
        await showSlot(s);
        div.classList.add("active");
      } else {
        hideSlot(s);
        div.classList.remove("active");
      }
      updateStatus();
    });
  });
}

// 自動表示
async function autoShow(now) {
  const status = document.getElementById("status");
  hideAll();
  const day = DAYS.find((d) => d.id === currentDayId);
  const act = [];
  for (const s of day.slots) {
    const st = new Date(s.start), en = new Date(s.end);
    if (now >= st && now <= en) {
      await showSlot(s);
      act.push(s.name);
    }
  }
  status.textContent =
    "表示時刻：" +
    new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Tokyo" }).format(now) +
    " ／ 表示中：" + act.length + "件";
}

// GeoJSON 読み→ポリライン三層描画
async function showSlot(slot) {
  if (layers.has(slot.start)) return;
  const feats = await loadGeojsonPaths(slot.src);
  const polys = [];
  for (const f of feats) {
    const path = f.path.map(([lat, lng]) => ({ lat, lng }));
    const glow   = new google.maps.Polyline({ path, ...STROKE.glow,   map });
    const casing = new google.maps.Polyline({ path, ...STROKE.casing, map });
    const main   = new google.maps.Polyline({ path, ...STROKE.main,   map });
    polys.push(glow, casing, main);
  }
  layers.set(slot.start, polys);
}
function hideSlot(slot) {
  const arr = layers.get(slot.start);
  if (!arr) return;
  arr.forEach((pl) => pl.setMap(null));
  layers.delete(slot.start);
}
function hideAll() {
  for (const arr of layers.values()) arr.forEach((pl) => pl.setMap(null));
  layers.clear();
}
function updateStatus() {
  const status = document.getElementById("status");
  status.textContent = "表示中スロット：" + layers.size + "件";
}

async function loadGeojsonPaths(src) {
  if (loadedCache.has(src)) return loadedCache.get(src);
  const res = await fetch(src, { cache: "no-store" });
  const gj = await res.json();
  const out = [];
  const toLatLngList = (coords) => coords.map((c) => [c[1], c[0]]); // [lng,lat] → [lat,lng]
  for (const feat of gj.features || []) {
    const g = feat.geometry || {};
    const t = g.type;
    const p = feat.properties || {};
    const note = p.name || p.description || "";
    if (t === "LineString") {
      out.push({ path: toLatLngList(g.coordinates), note });
    } else if (t === "MultiLineString") {
      for (const line of g.coordinates) out.push({ path: toLatLngList(line), note });
    } else if (t === "Polygon") {
      out.push({ path: toLatLngList(g.coordinates[0]), note }); // 外周のみ
    } else if (t === "MultiPolygon") {
      for (const poly of g.coordinates) out.push({ path: toLatLngList(poly[0]), note });
    }
  }
  loadedCache.set(src, out);
  return out;
}

/* ===== ユーティリティ ===== */
function escapeHtml(s){
  return String(s ?? "").replace(/[&<>"']/g, c=>({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[c]));
}
