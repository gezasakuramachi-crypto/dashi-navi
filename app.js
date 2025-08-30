/* ========= 基本設定 ========= */
const CONFIG = {
  SERVER_BASE: "https://traccar-railway.fly.dev",
  DEVICE_ID: 1,
  PUBLIC_BEARER:
    "RzBFAiEAgbx61XQasV2upPQVJbBqrLh-xXi3-itlpVvbfW8XyGQCIEltaFXtQnEqVcz0W1Ajxc202t3DYetBvT4LIi1_B5B_eyJ1Ijo3LCJlIjoiMjAyNS0wOS0wM1QxNTowMDowMC4wMDArMDA6MDAifQ",
  POLL_MS: 5000,

  ICONS: {
    sakura: "https://gezasakuramachi-crypto.github.io/dashi-navi/mark/sakura.png",
    info:   "https://gezasakuramachi-crypto.github.io/dashi-navi/mark/info.png",
    wc:     "https://gezasakuramachi-crypto.github.io/dashi-navi/mark/wc.png",
    park:   "https://gezasakuramachi-crypto.github.io/dashi-navi/mark/parking.png",
  },

  POI_ICON_PX: 20
};

const MAP_CENTER = { lat: 35.966, lng: 140.628 };
const MAP_ZOOM   = 15;

/* 配信外：固定表示座標（35°57'50.5"N 140°37'53.3"E） */
const OFF_MARK_POS = { lat: 35.9640278, lng: 140.6314722 };

/* === 規制スタイル === */
const STYLE = {
  line:   { strokeColor:"#ff0000", strokeOpacity:1, strokeWeight:1.0, zIndex:3002 },
  polygon:{ strokeColor:"#ff0000", strokeOpacity:1, strokeWeight:1.0, fillColor:"#ff99cc", fillOpacity:0.35, zIndex:3002 }
};

/* === 走行エリア（外周青線・塗り無し） === */
const RUNAREA_STYLE = { strokeColor:"#1e88e5", strokeOpacity:0.95, strokeWeight:2, fillOpacity:0, zIndex:2900 };
const RUNAREA_SRC   = "https://gezasakuramachi-crypto.github.io/dashi-navi/data/run-area.geojson";

/* === 地図選択エリア === */
const MAP_VIEWPORT_SRC = "https://gezasakuramachi-crypto.github.io/dashi-navi/data/map-viewport.geojson";

/* === POI === */
const INFO_POINTS = [
  { title:"年番引継ぎ会場", lat:35.9658889, lng:140.6268333,
    photo:"https://gezasakuramachi-crypto.github.io/dashi-navi/mark/nen-hiki.png",
    desc:"9月2日18:15～\n山車の運行を執り仕切るのが「山車年番」です。\n今年の年番が、次年度年番町内に\nお伺いをたて引継ぐことを「年番引継」といいます。"},
  { title:"にぎわい広場", lat:35.9664167, lng:140.6277778, photo:"", desc:"飲食販売屋台あり。\nトイレ・休憩スペースもあります。" },
  { title:"総踊りのの字廻し会場", lat:35.9679444, lng:140.6300278,
    photo:"https://gezasakuramachi-crypto.github.io/dashi-navi/mark/souodori2.png",
    desc:"9月1日18:00～\n町内の山車が勢ぞろいして、\n全町内が年番区の演奏にあわせて\n総踊りをします。\nその後は各町内による、\nのの字廻しが披露されます。" },
  { title:"一斉踊り会場", lat:35.9670556, lng:140.6306944, photo:"", desc:"9月2日13:30～\n五ケ町が終結し、各町内が\n順番に踊りを踊っていきます。\nその後年番区を先頭に\n役曳きをして全町内を曳きまわします。" },
  { title:"大町通り山車集合", lat:35.9679722, lng:140.6286944, photo:"", desc:"9/1 15:10-16:00\n9/2 15:00-15:30\n五ヶ町の山車が大町通り\nに並びます" },
];
const WC_POINTS = [
  { title:"鹿島神宮公衆トイレ", lat:35.9679444, lng:140.6305833 },
  { title:"にぎわい広場 トイレ", lat:35.9664167, lng:140.6278611 },
  { title:"鹿嶋市宮中地区駐車場 トイレ", lat:35.9665, lng:140.6318056 },
  { title:"道祖神児童公園 公衆トイレ", lat:35.9639444, lng:140.6292778 },
  { title:"観光案内所 公衆トイレ", lat:35.9672778, lng:140.6266944 },
];
const PARK_POINTS = [
  { title:"鹿嶋市宮中地区駐車場", lat:35.9665833, lng:140.632 },
  { title:"鹿嶋市営鹿島神宮駅西駐車場", lat:35.97, lng:140.6238333 },
];

/* === 交通規制 === */
const DAYS = [
  { id:"d1", label:"9/1", slots:[
    { shortLabel:"10:30-", key:"91-1030-1500", src:"https://gezasakuramachi-crypto.github.io/dashi-navi/data/91-1030-1500.geojson" },
    { shortLabel:"15:00-", key:"91-1500-1600", src:"https://gezasakuramachi-crypto.github.io/dashi-navi/data/91-1500-1600.geojson" },
    { shortLabel:"16:00-", key:"91-1600-1930", src:"https://gezasakuramachi-crypto.github.io/dashi-navi/data/91-1600-1930.geojson" },
    { shortLabel:"19:30-", key:"91-1930-2045", src:"https://gezasakuramachi-crypto.github.io/dashi-navi/data/91-1930-2045.geojson" },
    { shortLabel:"20:45-", key:"91-2045-2200", src:"https://gezasakuramachi-crypto.github.io/dashi-navi/data/91-2045-2200.geojson" },
  ]},
  { id:"d2", label:"9/2", slots:[
    { shortLabel:"11:00-", key:"92-1100-1230", src:"https://gezasakuramachi-crypto.github.io/dashi-navi/data/92-1100-1230.geojson" },
    { shortLabel:"12:30-", key:"92-1230-1400", src:"https://gezasakuramachi-crypto.github.io/dashi-navi/data/92-1230-1400.geojson" },
    { shortLabel:"14:00-", key:"92-1400-1630", src:"https://gezasakuramachi-crypto.github.io/dashi-navi/data/92-1400-1630.geojson" },
    { shortLabel:"16:30-", key:"92-1630-1900", src:"https://gezasakuramachi-crypto.github.io/dashi-navi/data/92-1630-1900.geojson" },
    { shortLabel:"19:00-", key:"92-1900-1930", src:"https://gezasakuramachi-crypto.github.io/dashi-navi/data/92-1900-1930.geojson" },
    { shortLabel:"19:30-", key:"92-1930-2200", src:"https://gezasakuramachi-crypto.github.io/dashi-navi/data/92-1930-2200.geojson" },
  ]},
];

/* === 経路図URL（JST判定） === */
const ROUTE_URLS = {
  "0831":"https://sites.google.com/view/sakuramachiku/%E4%BB%A4%E5%92%8C%E5%B9%B4%E7%A5%9E%E5%B9%B8%E7%A5%AD/8%E6%9C%8831%E6%97%A5%E5%89%8D%E5%A4%9C%E7%A5%AD%E7%B5%8C%E8%B7%AF%E5%9B%B3",
  "0901":"https://sites.google.com/view/sakuramachiku/%E4%BB%A4%E5%92%8C%E5%B9%B4%E7%A5%9E%E5%B9%B8%E7%A5%AD/9%E6%9C%881%E6%97%A5-%E7%A5%9E%E5%B9%B8%E7%A5%AD%E7%B5%8C%E8%B7%AF%E5%9B%B3",
  "0902":"https://sites.google.com/view/sakuramachiku/%E4%BB%A4%E5%92%8C%E5%B9%B4%E7%A5%9E%E5%B9%B8%E7%A5%AD/9%E6%9C%882%E6%97%A5-%E7%A5%9E%E5%B9%B8%E7%A5%AD%E7%B5%8C%E8%B7%AF%E5%9B%B3",
};
function getRouteMapUrlByDateJST() {
  const params = new URLSearchParams(location.search);
  const override = params.get("route");
  if (override && ROUTE_URLS[override]) return ROUTE_URLS[override];
  const jstNow = nowJST();
  const m = jstNow.getMonth() + 1, d = jstNow.getDate();
  if (m < 8 || (m === 8 && d <= 31)) return ROUTE_URLS["0831"];
  if (m === 9 && d === 1)  return ROUTE_URLS["0901"];
  if (m === 9 && d === 2)  return ROUTE_URLS["0902"];
  return ROUTE_URLS["0901"];
}

/* ========= 変数 ========= */
let map, dashiMarker, infoWindow;
let infoMarkers = [], wcMarkers = [], parkMarkers = [];
let trafficOverlays = [];   // 規制表示
let runAreaOverlays = [];   // 走行エリア表示
let latestPositionTime = null;
let currentTrafficLabel = "";
let pollTimer = null;
let liveScheduler = null;
let isLive = false;

/* ========= JSTユーティリティ ========= */
function nowJST() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
}
function withinOnDay(jst, m, d, sh, sm, eh, em) {
  const mm = jst.getMonth() + 1, dd = jst.getDate();
  if (mm !== m || dd !== d) return false;
  const t  = jst.getHours() * 60 + jst.getMinutes();
  const s  = sh * 60 + sm;
  const e  = eh * 60 + em;
  return t >= s && t < e;
}
function isWithinLiveWindowJST(jst = nowJST()) {
  return (
    withinOnDay(jst, 8, 31, 18, 0, 22, 0) ||
    withinOnDay(jst, 9,  1, 10, 0, 22, 0) ||
    withinOnDay(jst, 9,  2, 11,30, 22, 0)
  );
}

/* ========= API ========= */
async function fetchLatestPosition() {
  const url = `${CONFIG.SERVER_BASE}/api/positions?deviceId=${CONFIG.DEVICE_ID}&limit=1`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${CONFIG.PUBLIC_BEARER}` } });
  if (!res.ok) throw new Error("位置取得失敗");
  const arr = await res.json();
  return arr && arr[0];
}

/* ========= 共通 ========= */
function makeMarker({ lat, lng }, iconUrl, title, sizePX = 24) {
  return new google.maps.Marker({
    position: { lat, lng },
    map,
    title,
    icon: { url: iconUrl, scaledSize: new google.maps.Size(sizePX, sizePX) },
    zIndex: 3000,
  });
}
function setMarkersVisible(list, visible) {
  list.forEach(m => m.setMap(visible ? map : null));
}

/* ========= GeoJSON → Overlay ========= */
async function addGeoJsonAsOverlays(url, style) {
  const res = await fetch(url);
  if (!res.ok) return [];
  const gj = await res.json();
  const added = [];
  for (const f of (gj.features || [])) {
    const g = f.geometry; if (!g) continue;
    const st = style || {};
    if (g.type === "LineString") {
      const path = g.coordinates.map(([lng, lat]) => ({ lat, lng }));
      const polyline = new google.maps.Polyline({ path, ...STYLE.line, ...st });
      polyline.setMap(map); added.push(polyline);
    } else if (g.type === "Polygon") {
      const paths = g.coordinates.map(r => r.map(([lng, lat]) => ({ lat, lng })));
      const polygon = new google.maps.Polygon({ paths, ...STYLE.polygon, ...st });
      polygon.setMap(map); added.push(polygon);
    } else if (g.type === "MultiLineString") {
      g.coordinates.forEach(ls => {
        const path = ls.map(([lng, lat]) => ({ lat, lng }));
        const pl = new google.maps.Polyline({ path, ...STYLE.line, ...st });
        pl.setMap(map); added.push(pl);
      });
    } else if (g.type === "MultiPolygon") {
      g.coordinates.forEach(pg => {
        const paths = pg.map(r => r.map(([lng, lat]) => ({ lat, lng })));
        const po = new google.maps.Polygon({ paths, ...STYLE.polygon, ...st });
        po.setMap(map); added.push(po);
      });
    }
  }
  return added;
}
async function showTrafficBySrc(src) {
  trafficOverlays.forEach(o => o.setMap(null));
  trafficOverlays = [];
  if (!src) return;
  trafficOverlays = await addGeoJsonAsOverlays(src, {});
}

/* ========= 山車専用ウインドウ（DOMオーバーレイ） ========= */
class DashiOverlay extends google.maps.OverlayView {
  constructor() {
    super();
    this.div = document.getElementById("dashiWindow");
    this.position = null;  // google.maps.LatLng
  }
  onAdd() {}
  onRemove() {}
  draw() {
    if (!this.position) return;
    const proj = this.getProjection();
    if (!proj) return;
    const p = proj.fromLatLngToDivPixel(this.position);
    this.div.style.left = `${p.x}px`;
    this.div.style.top  = `${p.y}px`;
  }
  setPosition(latLng) {
    this.position = latLng;
    this.draw();
  }
  show() { this.div.style.display = "block"; this.div.setAttribute("aria-hidden","false"); }
  hide() { this.div.style.display = "none";  this.div.setAttribute("aria-hidden","true"); }
}
let dashiOverlay = null;
function openDashiWindowAt(latLng, running) {
  if (!dashiOverlay) return;
  // 文言・リンク更新
  document.getElementById("dashiStatus").textContent = running ? "更新中" : "停止中";
  const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${latLng.lat()},${latLng.lng()}&travelmode=walking`;
  const routeUrl = getRouteMapUrlByDateJST();
  document.getElementById("dashiDir").href = dirUrl;
  document.getElementById("dashiRoute").href = routeUrl;

  dashiOverlay.setPosition(latLng);
  dashiOverlay.show();
}

/* ========= 初期化 ========= */
async function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: MAP_CENTER,
    zoom: MAP_ZOOM,
    mapTypeControl: false,
    fullscreenControl: true,
    streetViewControl: false,
    clickableIcons: true,
    gestureHandling: "greedy",
  });

  infoWindow = new google.maps.InfoWindow();

  // ★ 山車専用ウインドウのオーバーレイを作成
  dashiOverlay = new DashiOverlay();
  dashiOverlay.setMap(map);
  map.addListener("click", ()=>{ dashiOverlay.hide(); infoWindow.close(); });

  /* 表示範囲制限＋fit */
  try {
    const res = await fetch(MAP_VIEWPORT_SRC);
    if (res.ok) {
      const gj = await res.json();
      const coords = [];
      (gj.features||[]).forEach(f=>{
        const g=f.geometry; if(!g) return;
        const push=([lng,lat])=>coords.push({lat,lng});
        if(g.type==="Polygon") g.coordinates.flat().forEach(push);
        if(g.type==="LineString") g.coordinates.forEach(push);
        if(g.type==="MultiPolygon") g.coordinates.flat(2).forEach(push);
        if(g.type==="MultiLineString") g.coordinates.flat().forEach(push);
      });
      if(coords.length){
        const bounds = new google.maps.LatLngBounds();
        coords.forEach(c=>bounds.extend(c));
        map.fitBounds(bounds);
        google.maps.event.addListenerOnce(map, "idle", ()=>{
          const z = map.getZoom() ?? 15;
          map.setZoom(Math.min(z + 2, 20));
        });
        map.setOptions({ restriction:{ latLngBounds: bounds, strictBounds:true }});
      }
    }
  } catch(e){ console.warn(e); }

  /* 走行エリア */
  runAreaOverlays = await addGeoJsonAsOverlays(RUNAREA_SRC, RUNAREA_STYLE);

  /* POI */
  const makePoi = (arr, icon, size=CONFIG.POI_ICON_PX) =>
    arr.map(p => {
      const m = makeMarker({lat:p.lat,lng:p.lng}, icon, p.title, size);
      m.addListener("click", ()=>{
        dashiOverlay.hide(); // 山車ウインドウは閉じる
        infoWindow.setContent(`
          <div class="iw iw-narrow">
            <div class="title">${p.title || "場所"}</div>
            ${p.photo ? `<div style="margin:4px 0;"><img src="${p.photo}" alt="" style="max-width:100%;border-radius:6px;"></div>` : ""}
            ${p.desc ? `<div style="white-space:pre-wrap;">${p.desc}</div>` : ""}
          </div>
        `);
        infoWindow.open({ anchor: m, map });
      });
      return m;
    });
  infoMarkers = makePoi(INFO_POINTS, CONFIG.ICONS.info);
  wcMarkers   = makePoi(WC_POINTS,   CONFIG.ICONS.wc);
  parkMarkers = makePoi(PARK_POINTS, CONFIG.ICONS.park);

  /* 左：表示トグル */
  let infoOn=true, wcOn=true, parkOn=true;
  const $ = id => document.getElementById(id);
  $("btnInfo").addEventListener("click", ()=>{ infoOn=!infoOn; setMarkersVisible(infoMarkers,infoOn); $("btnInfo").classList.toggle("inactive",!infoOn); });
  $("btnWC").addEventListener("click",   ()=>{ wcOn=!wcOn;   setMarkersVisible(wcMarkers,wcOn);   $("btnWC").classList.toggle("inactive",!wcOn);   });
  $("btnPark").addEventListener("click", ()=>{ parkOn=!parkOn; setMarkersVisible(parkMarkers,parkOn); $("btnPark").classList.toggle("inactive",!parkOn); });

  /* 交通規制UI */
  const pill   = $("regPill");
  const drawer = $("regDrawer");
  const close  = $("regClose");
  const tabAuto= $("tabAuto");
  const tabD1  = $("tabD1");
  const tabD2  = $("tabD2");
  const slotList = $("slotList");
  function openDrawer(){ drawer.style.display="block"; }
  function closeDrawer(){ drawer.style.display="none"; }
  pill.addEventListener("click", openDrawer);
  close.addEventListener("click", closeDrawer);
  document.addEventListener("click", (e)=>{
    if(!drawer.contains(e.target) && e.target!==pill && !pill.contains(e.target)){ closeDrawer(); }
  });
  async function autoUpdateTraffic(){
    currentTrafficLabel = "";
    pill.textContent = "交通規制";
    const jst = nowJST();
    const m=jst.getMonth()+1, d=jst.getDate();
    if(m===9 && d===1){ await showTrafficBySrc(DAYS[0].slots[0].src); }
    else if(m===9 && d===2){ await showTrafficBySrc(DAYS[1].slots[0].src); }
    else { await showTrafficBySrc(null); }
    slotList.innerHTML = "";
  }
  tabAuto.addEventListener("click", async ()=>{ tabAuto.classList.add("active"); tabD1.classList.remove("active"); tabD2.classList.remove("active"); await autoUpdateTraffic(); });
  tabD1.addEventListener("click", ()=>{ tabD1.classList.add("active"); tabAuto.classList.remove("active"); tabD2.classList.remove("active"); buildSlotButtons(DAYS[0]); });
  tabD2.addEventListener("click", ()=>{ tabD2.classList.add("active"); tabAuto.classList.remove("active"); tabD1.classList.remove("active"); buildSlotButtons(DAYS[1]); });
  await autoUpdateTraffic();

  /* 下ボタン */
  const toggleDrawer = (e)=>{ e.preventDefault(); const isOpen = drawer.style.display === "block"; if (isOpen) closeDrawer(); else openDrawer(); };
  $("bTraffic").addEventListener("click", toggleDrawer, {passive:false});
  $("bTraffic").addEventListener("touchstart", toggleDrawer, {passive:false});

  // 現在地（青点＋誤差円）
  $("bMyLoc").addEventListener("click", ()=>{
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos)=>{
      const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      const acc = Math.max(5, pos.coords.accuracy || 0);
      map.panTo(p);
      if ((map.getZoom() ?? 0) < 16) map.setZoom(16);
      if (window.myLocMarker) window.myLocMarker.setMap(null);
      if (window.myLocCircle) window.myLocCircle.setMap(null);
      window.myLocMarker = new google.maps.Marker({
        position: p, map, title: "現在地",
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 6, fillColor: "#4285f4", fillOpacity: 1, strokeColor: "#ffffff", strokeWeight: 2 },
        zIndex: 4000
      });
      window.myLocCircle = new google.maps.Circle({
        strokeColor: "#4285f4", strokeOpacity: 0.5, strokeWeight: 1,
        fillColor: "#4285f4", fillOpacity: 0.15, map, center: p, radius: acc, zIndex: 3500
      });
    }, console.warn, { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 });
  });

  // ヘルプ
  $("bHelp").addEventListener("click", ()=>{ document.getElementById("helpModal").style.display = "flex"; });
  document.getElementById("helpClose").addEventListener("click", ()=>{ document.getElementById("helpModal").style.display = "none"; });
  document.getElementById("helpModal").addEventListener("click",(e)=>{ if (e.target.id === "helpModal") e.currentTarget.style.display = "none"; });

  /* ====== 配信スケジューラ：配信時間のみ位置反映／配信外は固定座標 ====== */
  const startLive = async ()=>{
    if (isLive) return;
    isLive = true;

    const pos = await fetchLatestPosition().catch(()=>null);
    if (!dashiMarker) {
      dashiMarker = new google.maps.Marker({
        position: OFF_MARK_POS, map, title:"桜町区",
        icon: { url: CONFIG.ICONS.sakura, scaledSize: new google.maps.Size(40,40) },
        zIndex: 3000
      });
    }
    google.maps.event.clearInstanceListeners(dashiMarker);

    if (pos) {
      const p = { lat: pos.latitude, lng: pos.longitude };
      latestPositionTime = new Date(pos.deviceTime || pos.fixTime || pos.serverTime || Date.now());
      dashiMarker.setPosition(p);
    }

    // 山車マークタップ → 専用ウインドウ（幅70）
    dashiMarker.addListener("click", ()=>{
      const ll = dashiMarker.getPosition();
      const now = new Date();
      const running = latestPositionTime ? ((now - latestPositionTime)/1000 <= 90) : false;
      openDashiWindowAt(ll, running);
    });

    clearInterval(pollTimer);
    pollTimer = setInterval(async ()=>{
      if (!isLive) return;
      const np = await fetchLatestPosition().catch(()=>null);
      if(np && dashiMarker){
        dashiMarker.setPosition({lat:np.latitude,lng:np.longitude});
        latestPositionTime = new Date(np.deviceTime || np.fixTime || np.serverTime || Date.now());
      }
    }, CONFIG.POLL_MS);

    // 下段「山車」：配信中は位置へパン（ウインドウは開かない）
    document.getElementById("bDashi").onclick = ()=>{
      if (dashiMarker) {
        map.panTo(dashiMarker.getPosition());
        if ((map.getZoom() ?? 0) < 16) map.setZoom(16);
      }
    };
  };

  const stopLive = ()=>{
    // 早期returnなし：配信外でも必ずマーカーを表示するため
    isLive = false;

    clearInterval(pollTimer); pollTimer = null;

    if (!dashiMarker) {
      dashiMarker = new google.maps.Marker({
        position: OFF_MARK_POS, map, title:"桜町区",
        icon: { url: CONFIG.ICONS.sakura, scaledSize: new google.maps.Size(40,40) },
        zIndex: 3000
      });
    } else {
      dashiMarker.setMap(map);
      dashiMarker.setPosition(OFF_MARK_POS);
    }

    google.maps.event.clearInstanceListeners(dashiMarker);
    dashiMarker.addListener("click", ()=>{
      const ll = dashiMarker.getPosition();
      openDashiWindowAt(ll, /*running=*/false);
    });

    // 下段「山車」：固定座標へパン（ウインドウは開かない）
    document.getElementById("bDashi").onclick = ()=>{
      map.panTo(OFF_MARK_POS);
      if ((map.getZoom() ?? 0) < 16) map.setZoom(16);
    };
  };

  // 初期判定 & 周期チェック（30秒ごと）
  const applyByNow = ()=>{
    if (isWithinLiveWindowJST()) startLive(); else stopLive();
  };
  applyByNow();
  clearInterval(liveScheduler);
  liveScheduler = setInterval(applyByNow, 30000);
}

/* Google Maps callback */
window.initMap = initMap;

/* ===== スロットボタン生成（交通規制） ===== */
function buildSlotButtons(day) {
  const cont = document.getElementById("slotList");
  cont.innerHTML = "";
  day.slots.forEach(slot => {
    const btn = document.createElement("button");
    btn.className = "slotbtn";
    btn.textContent = slot.shortLabel;
    btn.addEventListener("click", () => {
      showTrafficBySrc(slot.src);
      currentTrafficLabel = `${day.label} ${slot.shortLabel}`;
      [...cont.children].forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("regPill").textContent = currentTrafficLabel;
    });
    cont.appendChild(btn);
  });
}
