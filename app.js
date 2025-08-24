/* ================= 基本設定 ================= */
const CONFIG = {
  // Traccar（読み取り専用トークン）
  SERVER_BASE: "https://traccar-railway.fly.dev",
  DEVICE_ID: 1,
  PUBLIC_BEARER:
    "RzBFAiAaeMvmv32ZrmskwLBY7hx0jHxCezE-NGOh_K2-QFuHgQIhAOY_es0TTwL-GX4pbel4G6wxKQcYjJd1EgtRzGKhSlQ7eyJ1Ijo2LCJlIjoiMjAyNS0wOC0yN1QxNTowMDowMC4wMDArMDA6MDAifQ",
  POLL_MS: 5000,

  // 山車アイコン（地図上のマーカー & 左のフォーカスボタンと同一）
  DASHI_ICON:
    "https://www.dropbox.com/scl/fi/echpcekhl6f13c9df5uzh/sakura.png?rlkey=e93ng3fdwbdlkvr07zkvw9pph&raw=1",

  // カテゴリアイコン（地図上のマーカー画像）
  ICONS: {
    info: "https://gezasakuramachi-crypto.github.io/dashi-navi/mark/info.png",
    wc:   "https://gezasakuramachi-crypto.github.io/dashi-navi/mark/wc.png",
    park: "https://gezasakuramachi-crypto.github.io/dashi-navi/mark/parking.png",
  },

  // 地図上に置くPOIマーカーのサイズ（px）
  POI_ICON_PX: 24
};

/* ================= 地図の初期中心 ================= */
const MAP_CENTER = { lat: 35.966, lng: 140.628 };
const MAP_ZOOM   = 15;

/* ================= 規制線スタイル（赤・薄め） ================= */
const STROKE = {
  casing: { strokeColor: "#ffffff", strokeOpacity: 0.0, strokeWeight: 0,  zIndex: 3001 },
  main:   { strokeColor: "#ff0000", strokeOpacity: 0.20, strokeWeight: 6, zIndex: 3002 },
  glow:   { strokeColor: "#ff0000", strokeOpacity: 0.10, strokeWeight: 12, zIndex: 3000 },
};

/* ================= POI（インフォ／WC／駐車場） ================= */
const INFO_POINTS = [
  {
    title: "年番引継ぎ会場",
    lat: 35.9658889, lng: 140.6268333,
    photo: "https://gezasakuramachi-crypto.github.io/dashi-navi/mark/nen-hiki.png",
    desc: "9月2日18:15～\n山車の運行を執り仕切るのが「山車年番」です。\n今年の年番が、次年度年番町内に\nお伺いをたて引継ぐことを「年番引継」といいます。"
  },
  {
    title: "にぎわい広場",
    lat: 35.9664167, lng: 140.6277778,
    photo: "",
    desc: "飲食販売屋台あり。\nトイレ・休憩スペースもあります。"
  },
  {
    title: "総踊りのの字廻し会場",
    lat: 35.9679444, lng: 140.6300278,
    photo: "https://gezasakuramachi-crypto.github.io/dashi-navi/mark/souodori2.png",
    desc: "9月1日18:00～\n町内の山車が勢ぞろいして、\n全町内が年番区の演奏にあわせて\n総踊りをします。\nその後は各町内による、\nのの字廻しが披露されます。"
  },
  {
    title: "一斉踊り会場",
    lat: 35.9670556, lng: 140.6306944,
    photo: "",
    desc: "9月2日13:30～\n五ケ町が終結し、各町内が\n順番に踊りを踊っていきます。\nその後年番区を先頭に\n役曳きをして全町内を曳きまわします。"
  },
  {
    title: "大町通り山車集合",
    lat: 35.9679722, lng: 140.6286944,
    photo: "",
    desc: "9/1 15:10-16:00\n9/2 15:00-15:30\n五ヶ町の山車が大町通り\nに並びます"
  },
];

const WC_POINTS = [
  { title: "鹿島神宮公衆トイレ",          lat: 35.9679444, lng: 140.6305833 },
  { title: "にぎわい広場 トイレ",          lat: 35.9664167, lng: 140.6278611 },
  { title: "鹿嶋市宮中地区駐車場 トイレ",  lat: 35.9665,    lng: 140.6318056 },
  { title: "道祖神児童公園 公衆トイレ",    lat: 35.9639444, lng: 140.6292778 },
  { title: "観光案内所 公衆トイレ",        lat: 35.9672778, lng: 140.6266944 },
];

const PARK_POINTS = [
  { title: "鹿嶋市宮中地区駐車場",         lat: 35.9665833, lng: 140.632 },
  { title: "鹿嶋市営鹿島神宮駅西駐車場",   lat: 35.97,      lng: 140.6238333 },
];

/* ================= 交通規制スロット ================= */
const DAYS = [
  {
    id: "d1", label: "9/1(月)",
    slots: [
      { shortLabel: "10:30-", key: "91-1030-1500", start: "2025-09-01T10:30:00+09:00", end: "2025-09-01T15:00:00+09:00", src: "data/91-1030-1500map.geojson" },
      { shortLabel: "15:00-", key: "91-1500-1600", start: "2025-09-01T15:00:00+09:00", end: "2025-09-01T16:00:00+09:00", src: "data/91-1500-1600.geojson" },
      { shortLabel: "16:00-", key: "91-1600-1930", start: "2025-09-01T16:00:00+09:00", end: "2025-09-01T19:30:00+09:00", src: "data/91-1600-1930.geojson" },
      { shortLabel: "19:30-", key: "91-1930-2045", start: "2025-09-01T19:30:00+09:00", end: "2025-09-01T20:45:00+09:00", src: "data/91-1930-2045.geojson" },
      { shortLabel: "20:45-", key: "91-2045-2200", start: "2025-09-01T20:45:00+09:00", end: "2025-09-01T22:00:00+09:00", src: "data/91-2045-2200.geojson" },
    ],
  },
  {
    id: "d2", label: "9/2(火)",
    slots: [
      { shortLabel: "11:00-", key: "92-1100-1230", start: "2025-09-02T11:00:00+09:00", end: "2025-09-02T12:30:00+09:00", src: "data/92-1100-1230.geojson" },
      { shortLabel: "12:30-", key: "92-1230-1400", start: "2025-09-02T12:30:00+09:00", end: "2025-09-02T14:00:00+09:00", src: "data/92-1230-1400.geojson" },
      { shortLabel: "14:00-", key: "92-1400-1630", start: "2025-09-02T14:00:00+09:00", end: "2025-09-02T16:30:00+09:00", src: "data/92-1400-1630.geojson" },
      { shortLabel: "16:30-", key: "92-1630-1900", start: "2025-09-02T16:30:00+09:00", end: "2025-09-02T19:00:00+09:00", src: "data/92-1630-1900.geojson" },
      { shortLabel: "19:00-", key: "92-1900-1930", start: "2025-09-02T19:00:00+09:00", end: "2025-09-02T19:30:00+09:00", src: "data/92-1900-1930.geojson" },
      { shortLabel: "19:30-", key: "92-1930-2200", start: "2025-09-02T19:30:00+09:00", end: "2025-09-02T22:00:00+09:00", src: "data/92-1930-2200.geojson" },
    ],
  },
];

/* ================= 地図・状態 ================= */
let map, dashMarker, dashInfo, routePolyline;
let lastFixMs = 0, pollTimer = null, firstFitDone = false;

// 交通規制レイヤー
const layers = new Map();       // key -> [Polyline...]
const loadedCache = new Map();  // src -> parsed cache

// POIマーカーとInfoWindow
const markers = { info:[], wc:[], park:[] };
let poiInfo = null;

// 現在地（単発）表示用
let myLocMarker = null, myLocCircle = null;

/* ================= 初期化 ================= */
window.initMap = function(){
  map = new google.maps.Map(document.getElementById("map"), {
    center: MAP_CENTER, zoom: MAP_ZOOM,
    mapTypeControl:false, streetViewControl:false, fullscreenControl:true,
    gestureHandling:"greedy"
  });

  // 山車マーカー
  dashMarker = new google.maps.Marker({
    map, position: MAP_CENTER,
    icon:{
      url:CONFIG.DASHI_ICON,
      size:new google.maps.Size(40,40),
      scaledSize:new google.maps.Size(40,40),
      anchor:new google.maps.Point(20,30)
    },
    zIndex:4000, title:"桜町区山車"
  });
  dashInfo = new google.maps.InfoWindow({ content: makeDashiBody("判定中") });
  dashMarker.addListener("click", ()=>{
    dashInfo.setContent(makeDashiBody(currentStatusText()));
    dashInfo.open(map, dashMarker);
  });

  // 地図クリック：情報パネル＆InfoWindowを閉じる（規制表示は維持）
  map.addListener("click", ()=>{
    dashInfo.close();
    if(poiInfo) poiInfo.close();
    const drawer=document.getElementById("drawer");
    if(drawer) drawer.style.display="none";
  });

  // 現在地ボタン（左下・Map Control）
  addMyLocationControl();

  // 現在位置ポーリング
  startPolling();

  // 交通規制UI
  setupRegulationUI();

  // 左パネル：山車フォーカス＋カテゴリトグル
  setupLeftPanel();

  // 初期：現在時刻に合う規制を1本表示
  autoShow(new Date());
};

/* ================= 山車位置のポーリング ================= */
function startPolling(){
  if(pollTimer) clearInterval(pollTimer);
  pollTimer=setInterval(fetchPosition, CONFIG.POLL_MS);
  fetchPosition();
}

async function fetchPosition(){
  try{
    const url=`${CONFIG.SERVER_BASE}/api/positions?deviceId=${CONFIG.DEVICE_ID}&latest=true`;
    const res=await fetch(url,{cache:"no-store", headers:{Authorization:`Bearer ${CONFIG.PUBLIC_BEARER}`}});
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const data=await res.json();
    if(!Array.isArray(data)||!data.length) return;

    const p=data[data.length-1];
    const pos={lat:p.latitude,lng:p.longitude};
    lastFixMs=new Date(p.fixTime||p.deviceTime||p.serverTime||Date.now()).getTime();

    dashMarker.setPosition(pos);

    // 初回のみ半径300mにフィット
    if(!firstFitDone){
      fitRadius(pos, 300);
      firstFitDone = true;
    }

    // 簡易軌跡
    if(!routePolyline){
      routePolyline=new google.maps.Polyline({map,strokeColor:"#1a73e8",strokeOpacity:.85,strokeWeight:3});
    }
    const path=routePolyline.getPath();
    const last=path.getLength()?path.getAt(path.getLength()-1):null;
    if(!last||last.lat()!==pos.lat||last.lng()!==pos.lng) path.push(pos);
  }catch(e){
    console.warn(e);
  }
}

function currentStatusText(){
  const now=Date.now();
  return (now-lastFixMs>Math.max(20000,CONFIG.POLL_MS*4))?"停止中":"更新中";
}

function makeDashiBody(status){
  const pos = dashMarker.getPosition();
  const lat = pos ? pos.lat() : MAP_CENTER.lat;
  const lng = pos ? pos.lng() : MAP_CENTER.lng;
  const routeUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  return `
    <div class="iw">
      <div class="title">桜町区山車</div>
      <div>ステータス：${status}</div>
      <button class="btn" onclick="window.open('${routeUrl}','_blank')">Googleマップで経路案内</button>
    </div>
  `;
}

/* ================= 交通規制 UI ================= */
function setupRegulationUI(){
  const openBtn=document.getElementById("openBtn");
  const drawer=document.getElementById("drawer");
  const tabAuto=document.getElementById("tabAuto");
  const tabD1=document.getElementById("tabD1");
  const tabD2=document.getElementById("tabD2");
  const slotList=document.getElementById("slotList");

  // パネル開閉
  openBtn.addEventListener("click", ()=>{
    drawer.style.display = drawer.style.display==='none' ? 'block':'none';
  });

  // 自動
  tabAuto.addEventListener("click", ()=>{
    [tabAuto,tabD1,tabD2].forEach(t=>t.classList.remove("active"));
    tabAuto.classList.add("active");
    slotList.innerHTML="";
    autoShow(new Date());
  });

  // 9/1
  tabD1.addEventListener("click", ()=>{
    [tabAuto,tabD1,tabD2].forEach(t=>t.classList.remove("active"));
    tabD1.classList.add("active");
    buildTimeButtons("d1");
  });

  // 9/2
  tabD2.addEventListener("click", ()=>{
    [tabAuto,tabD1,tabD2].forEach(t=>t.classList.remove("active"));
    tabD2.classList.add("active");
    buildTimeButtons("d2");
  });

  drawer.style.display = "none";
}

function buildTimeButtons(dayId){
  const slotList=document.getElementById("slotList");
  slotList.innerHTML="";
  const day = DAYS.find(d=>d.id===dayId);
  day.slots.forEach(s=>{
    const b=document.createElement("button");
    b.className="slotbtn";
    b.textContent=s.shortLabel;
    b.addEventListener("click", async ()=>{
      // 選択表示の更新
      [...slotList.children].forEach(x=>x.classList.remove("active"));
      b.classList.add("active");
      // 規制レイヤを差し替え
      hideAll();
      await showSlot(s);
    });
    slotList.appendChild(b);
  });
}

// 現在時刻に一致するスロットだけ表示
async function autoShow(now){
  hideAll();
  const all=[...DAYS[0].slots, ...DAYS[1].slots];
  const hit = all.find(s => now>=new Date(s.start) && now<=new Date(s.end));
  if(hit) await showSlot(hit);
}

/* ================= 規制 GeoJSON 読み込み＆描画 ================= */
async function showSlot(slot){
  if(layers.has(slot.key)) return;
  const feats = await loadGeojsonPaths(slot.src);
  const polys=[];
  for(const f of feats){
    const path=f.path.map(([lat,lng])=>({lat,lng}));
    // 透明感優先：主線のみ（必要に応じてcasing/glowを追加可）
    const main   = new google.maps.Polyline({ path, ...STROKE.main, map });
    polys.push(main);
  }
  layers.set(slot.key, polys);
}

function hideAll(){
  for(const arr of layers.values()) arr.forEach(pl=>pl.setMap(null));
  layers.clear();
}

async function loadGeojsonPaths(src){
  if(loadedCache.has(src)) return loadedCache.get(src);
  const res = await fetch(src, {cache:'no-store'});
  const gj  = await res.json();
  const out=[];
  const toLatLngList = (coords)=>coords.map(c=>[c[1],c[0]]);
  for(const feat of (gj.features||[])){
    const g=feat.geometry||{}; const t=g.type;
    if(t==='LineString'){
      out.push({path: toLatLngList(g.coordinates)});
    }else if(t==='MultiLineString'){
      for(const line of g.coordinates) out.push({path: toLatLngList(line)});
    }else if(t==='Polygon'){
      out.push({path: toLatLngList(g.coordinates[0])});
    }else if(t==='MultiPolygon'){
      for(const poly of g.coordinates) out.push({path: toLatLngList(poly[0])});
    }
  }
  loadedCache.set(src,out);
  return out;
}

/* ================= 左パネル：山車フォーカス & カテゴリON/OFF ================= */
function setupLeftPanel(){
  // 山車へフォーカス
  const btnFocus = document.getElementById("btnFocusDashi");
  btnFocus.addEventListener("click", ()=>{
    if(!dashMarker) return;
    const pos = dashMarker.getPosition();
    if(!pos) return;
    fitRadius({lat:pos.lat(), lng:pos.lng()}, 300);
  });

  // カテゴリトグル生成
  createCategoryMarkers("info", INFO_POINTS, CONFIG.ICONS.info, true);
  createCategoryMarkers("wc",   WC_POINTS,   CONFIG.ICONS.wc,   true);
  createCategoryMarkers("park", PARK_POINTS, CONFIG.ICONS.park, true);

  // クリックでON/OFF（OFFは白黒＝CSS .inactive）
  const btnInfo = document.getElementById("btnInfo");
  const btnWC   = document.getElementById("btnWC");
  const btnPark = document.getElementById("btnPark");

  btnInfo.addEventListener("click", ()=>{
    const inactive = btnInfo.classList.toggle("inactive");
    toggleCategory("info", !inactive);
  });
  btnWC.addEventListener("click", ()=>{
    const inactive = btnWC.classList.toggle("inactive");
    toggleCategory("wc", !inactive);
  });
  btnPark.addEventListener("click", ()=>{
    const inactive = btnPark.classList.toggle("inactive");
    toggleCategory("park", !inactive);
  });
}

function createCategoryMarkers(key, list, iconUrl, show){
  // 既存を除去
  if(markers[key]?.length){
    markers[key].forEach(m=>m.setMap(null));
    markers[key] = [];
  }else{
    markers[key] = [];
  }

  const px = CONFIG.POI_ICON_PX;
  const icon = {
    url: iconUrl,
    size: new google.maps.Size(px,px),
    scaledSize: new google.maps.Size(px,px),
    anchor: new google.maps.Point(px/2, Math.round(px*0.8)),
  };
  if (!poiInfo) poiInfo = new google.maps.InfoWindow();

  list.forEach(p=>{
    const m = new google.maps.Marker({
      position:{lat:p.lat,lng:p.lng}, icon, title:p.title,
      zIndex: key==="info" ? 2500 : key==="wc" ? 2200 : 2100
    });
    m.addListener("click", ()=>{
      const photo = p.photo ? `<div style="margin:6px 0"><img src="${p.photo}" alt="${escapeHtml(p.title)}" style="max-width:240px;height:auto"></div>` : "";
      const desc  = p.desc ? `<div>${escapeHtml(p.desc).replace(/\n/g,"<br>")}</div>` : "";
      poiInfo.setContent(`
        <div class="iw">
          <div class="title">${escapeHtml(p.title)}</div>
          ${photo}${desc}
        </div>
      `);
      poiInfo.open({ map, anchor:m, shouldFocus:false });
    });
    if(show) m.setMap(map);
    markers[key].push(m);
  });
}

function toggleCategory(key, on){
  (markers[key] || []).forEach(m=>m.setMap(on?map:null));
}

/* ================= 現在地ボタン（単発） ================= */
function addMyLocationControl(){
  const div = document.createElement("div");
  div.className = "loc-btn";
  // シンプルな現在地アイコン（SVG）
  div.innerHTML = `
    <svg class="loc-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3" fill="#4285f4"></circle>
      <circle cx="12" cy="12" r="8" fill="none" stroke="#4285f4" stroke-width="2"></circle>
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#4285f4" stroke-width="2" stroke-linecap="round"></path>
    </svg>`;
  div.title = "現在地へ移動";

  div.addEventListener("click", ()=>{
    if(!navigator.geolocation){
      alert("お使いのブラウザは現在地取得に対応していません。");
      return;
    }
    navigator.geolocation.getCurrentPosition((pos)=>{
      const {latitude, longitude, accuracy} = pos.coords;
      const ll = {lat: latitude, lng: longitude};

      // マーカーと精度円を作成/更新
      if(!myLocMarker){
        myLocMarker = new google.maps.Marker({
          position: ll, map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 6, fillColor: "#4285f4", fillOpacity: 1,
            strokeColor: "#fff", strokeWeight: 2
          },
          zIndex: 4500, title: "現在地"
        });
      } else {
        myLocMarker.setPosition(ll);
        myLocMarker.setMap(map);
      }

      if(!myLocCircle){
        myLocCircle = new google.maps.Circle({
          center: ll, map,
          radius: Math.max(accuracy, 60), // ざっくり60m以上
          fillColor: "#4285f4", fillOpacity: 0.15,
          strokeColor: "#4285f4", strokeOpacity: 0.5, strokeWeight: 1,
          zIndex: 4400
        });
      } else {
        myLocCircle.setCenter(ll);
        myLocCircle.setRadius(Math.max(accuracy, 60));
        myLocCircle.setMap(map);
      }

      // 表示調整：半径300mでフィット（または精度円でfitBoundsでもOK）
      fitRadius(ll, 300);
    }, (err)=>{
      console.warn(err);
      alert("現在地を取得できませんでした。位置情報の許可設定をご確認ください。");
    }, { enableHighAccuracy:true, timeout:8000, maximumAge:0 });
  });

  // Map Control として左下へ（GoogleマップのUIと同じ挙動で配置）
  map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(div);
}

/* ================= Util ================= */
function escapeHtml(s){
  return String(s ?? "").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;","&gt;":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
}

// 半径（m）でフィット
function fitRadius(center, meters){
  const dLat = meters / 111320;
  const dLng = meters / (111320 * Math.cos(center.lat * Math.PI/180));
  const sw = { lat:center.lat-dLat, lng:center.lng-dLng };
  const ne = { lat:center.lat+dLat, lng:center.lng+dLng };
  map.fitBounds(new google.maps.LatLngBounds(sw,ne));
}
