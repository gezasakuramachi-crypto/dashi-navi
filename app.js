/* ================= 設定 ================= */
const CONFIG = {
  SERVER_BASE: "https://traccar-railway.fly.dev",
  DEVICE_ID: 1,
  PUBLIC_BEARER:
    "RzBFAiAaeMvmv32ZrmskwLBY7hx0jHxCezE-NGOh_K2-QFuHgQIhAOY_es0TTwL-GX4pbel4G6wxKQcYjJd1EgtRzGKhSlQ7eyJ1Ijo2LCJlIjoiMjAyNS0wOC0yN1QxNTowMDowMC4wMDArMDA6MDAifQ",
  POLL_MS: 5000,
  DASHI_ICON: "https://www.dropbox.com/scl/fi/echpcekhl6f13c9df5uzh/sakura.png?rlkey=e93ng3fdwbdlkvr07zkvw9pph&raw=1",
  DASHI_PHOTO: "https://gezasakuramachi-crypto.github.io/dashi-navi/mark/sakura-konohana_R.png",
  ICONS: {
    info: "https://gezasakuramachi-crypto.github.io/dashi-navi/mark/info.png",
    wc:   "https://gezasakuramachi-crypto.github.io/dashi-navi/mark/wc.png",
    park: "https://gezasakuramachi-crypto.github.io/dashi-navi/mark/parking.png",
  },
};

// 地図外観（ライト＆POI少なめ）
const MAP_CENTER = { lat: 35.966, lng: 140.628 };
const MAP_ZOOM   = 15;
const MAP_STYLE  = [
  {featureType:"poi", stylers:[{visibility:"off"}]},
  {featureType:"transit", stylers:[{visibility:"off"}]},
  {featureType:"road", elementType:"labels.icon", stylers:[{visibility:"off"}]},
];

// 規制の強調（三層）
const STROKE = {
  casing: { strokeColor:"#ffffff", strokeOpacity:1,    strokeWeight:10, zIndex: 3001 },
  main:   { strokeColor:"#6bc06b", strokeOpacity:0.95, strokeWeight:6,  zIndex: 3002 },
  glow:   { strokeColor:"#6bc06b", strokeOpacity:0.25, strokeWeight:14, zIndex: 3000 },
};

/* ================= データ ================= */
const INFO_POINTS = [
  {
    title: "年番引継ぎ会場",
    lat: 35.9658889, lng: 140.6268333,
    photo: "https://gezasakuramachi-crypto.github.io/dashi-navi/mark/nen-hiki.png",
    desc: "9月2日18:15～\n山車の運行を執り仕切るのが「山車年番」です。\n今年の年番が、次年度年番町内に\nお伺いをたて引継ぐことを「年番引継」といいます。",
  },
  {
    title: "にぎわい広場",
    lat: 35.9664167, lng: 140.6277778,
    photo: "",
    desc: "飲食販売屋台あり。\nトイレ・休憩スペースもあります。",
  },
  {
    title: "総踊りのの字廻し会場",
    lat: 35.9679444, lng: 140.6300278,
    photo: "https://gezasakuramachi-crypto.github.io/dashi-navi/mark/souodori2.png",
    desc: "9月1日18:00～\n町内の山車が勢ぞろいして、\n全町内が年番区の演奏にあわせて\n総踊りをします。\nその後は各町内による、\nのの字廻しが披露されます。",
  },
  {
    title: "一斉踊り会場",
    lat: 35.9670556, lng: 140.6306944,
    photo: "",
    desc: "9月2日13:30～\n五ケ町が終結し、各町内が\n順番に踊りを踊っていきます。\nその後年番区を先頭に\n役曳きをして全町内を曳きまわします。",
  },
  {
    title: "大町通り山車集合",
    lat: 35.9679722, lng: 140.6286944,
    photo: "",
    desc: "9/1 15:10-16:00\n9/2 15:00-15:30\n五ヶ町の山車が大町通り\nに並びます",
  },
];
const WC_POINTS = [
  { title: "鹿島神宮公衆トイレ",          lat: 35.9679444, lng: 140.6305833 },
  { title: "にぎわい広場 トイレ",          lat: 35.9664167, lng: 140.6278611 },
  { title: "鹿嶋市宮中地区駐車場 トイレ",  lat: 35.9665000, lng: 140.6318056 },
  { title: "道祖神児童公園 公衆トイレ",    lat: 35.9639444, lng: 140.6292778 },
  { title: "観光案内所 公衆トイレ",        lat: 35.9672778, lng: 140.6266944 },
];
const PARK_POINTS = [
  { title: "鹿嶋市宮中地区駐車場",         lat: 35.9665833, lng: 140.6320000 },
  { title: "鹿嶋市営鹿島神宮駅西駐車場",   lat: 35.9700000, lng: 140.6238333 },
];

/* 交通規制スロット（時間ボタンは時間のみ表示） */
const DAYS = [
  {
    id: "d1", label: "9/1(月)",
    slots: [
      { shortLabel:"10:30-", key:"91-1030-1500", start:"2025-09-01T10:30:00+09:00", end:"2025-09-01T15:00:00+09:00", src:"data/91-1030-1500map.geojson" },
      { shortLabel:"15:00-", key:"91-1500-1600", start:"2025-09-01T15:00:00+09:00", end:"2025-09-01T16:00:00+09:00", src:"data/91-1500-1600.geojson" },
      { shortLabel:"16:00-", key:"91-1600-1930", start:"2025-09-01T16:00:00+09:00", end:"2025-09-01T19:30:00+09:00", src:"data/91-1600-1930.geojson" },
      { shortLabel:"19:30-", key:"91-1930-2045", start:"2025-09-01T19:30:00+09:00", end:"2025-09-01T20:45:00+09:00", src:"data/91-1930-2045.geojson" },
      { shortLabel:"20:45-", key:"91-2045-2200", start:"2025-09-01T20:45:00+09:00", end:"2025-09-01T22:00:00+09:00", src:"data/91-2045-2200.geojson" },
    ],
  },
  {
    id: "d2", label: "9/2(火)",
    slots: [
      { shortLabel:"11:00-", key:"92-1100-1230", start:"2025-09-02T11:00:00+09:00", end:"2025-09-02T12:30:00+09:00", src:"data/92-1100-1230.geojson" },
      { shortLabel:"12:30-", key:"92-1230-1400", start:"2025-09-02T12:30:00+09:00", end:"2025-09-02T14:00:00+09:00", src:"data/92-1230-1400.geojson" },
      { shortLabel:"14:00-", key:"92-1400-1630", start:"2025-09-02T14:00:00+09:00", end:"2025-09-02T16:30:00+09:00", src:"data/92-1400-1630.geojson" },
      { shortLabel:"16:30-", key:"92-1630-1900", start:"2025-09-02T16:30:00+09:00", end:"2025-09-02T19:00:00+09:00", src:"data/92-1630-1900.geojson" },
      { shortLabel:"19:00-", key:"92-1900-1930", start:"2025-09-02T19:00:00+09:00", end:"2025-09-02T19:30:00+09:00", src:"data/92-1900-1930.geojson" },
      { shortLabel:"19:30-", key:"92-1930-2200", start:"2025-09-02T19:30:00+09:00", end:"2025-09-02T22:00:00+09:00", src:"data/92-1930-2200.geojson" },
    ],
  },
];

/* ================= 状態/UI参照 ================= */
let map, dashMarker, routePolyline;
let lastFixMs = 0, pollTimer=null, firstFitDone=false;

const layers      = new Map();      // key -> [Polyline...]
const loadedCache = new Map();      // src -> parsed

let openBtn, collapsedHint, collapsedBtn, drawer, tabAutoEl, tabD1El, tabD2El, slotArea, slotToggle, slotList;
let currentMode = "auto";           // "auto" | "manual"
let currentDayId = null;            // "d1" | "d2"
let selectedSlotKey = null;

/* ============ モーダル（山車情報） ============ */
const backdropEl = document.getElementById("backdrop");
const modalEl    = document.getElementById("modal");
const modalClose = document.getElementById("modalClose");
const modalBody  = document.getElementById("modalContent");

function openModal(html){
  modalBody.innerHTML = html;
  backdropEl.style.display = "block";
  modalEl.style.display = "block";
}
function closeModal(){
  modalEl.style.display = "none";
  backdropEl.style.display = "none";
}
modalClose.addEventListener("click", closeModal);
backdropEl.addEventListener("click", closeModal);

/* ============ 初期化 ============ */
window.initMap = function () {
  map = new google.maps.Map(document.getElementById("map"), {
    center: MAP_CENTER, zoom: MAP_ZOOM,
    styles: MAP_STYLE,
    mapTypeControl:false, streetViewControl:false, fullscreenControl:true,
    gestureHandling:"greedy",
  });

  // 山車マーカー
  dashMarker = new google.maps.Marker({
    map, position: MAP_CENTER,
    icon:{
      url:CONFIG.DASHI_ICON,
      size:new google.maps.Size(48,48),
      scaledSize:new google.maps.Size(48,48),
      anchor:new google.maps.Point(24,38)
    },
    zIndex:4000, title:"桜町区山車"
  });
  dashMarker.addListener("click", () => {
    const html = makeDashiModalBody(currentStatusText());
    openModal(html);
  });

  // 地図クリック：モーダルや Info は閉じるが、表示中の規制は維持
  map.addListener("click", () => {
    closeModal();
    drawer.style.display = "none";
    collapsedHint.style.display = "block"; // サマリー見せる
  });

  // 位置更新
  startPolling();

  // UI構築
  setupRegulationUI();

  // POIマーカー
  addCategoryMarkers(INFO_POINTS, CONFIG.ICONS.info, 2500);
  addCategoryMarkers(WC_POINTS,   CONFIG.ICONS.wc,   2200);
  addCategoryMarkers(PARK_POINTS, CONFIG.ICONS.park, 2100);

  // 現在地ボタン
  addMyLocationControls();

  // 自動で該当スロット表示
  autoShow(new Date());
};

/* ============ 山車モーダル本文 ============ */
function makeDashiModalBody(status){
  const s = formatLastFixText() || "—";
  const pos = dashMarker.getPosition();
  const routeUrl = `https://www.google.com/maps/dir/?api=1&destination=${pos.lat()},${pos.lng()}`;
  return `
    <div class="title">桜町区山車</div>
    <div class="meta">最終更新：${s}</div>
    <img src="${CONFIG.DASHI_PHOTO}" alt="桜町区山車">
    <div class="meta">ステータス：${status}</div>
    <button class="btn" onclick="window.open('${routeUrl}','_blank')">山車までのルート案内</button>
  `;
}

/* ============ 位置ポーリング ============ */
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

    if(!firstFitDone){
      fitRadius(pos, 300); // 初回300mで表示
      firstFitDone = true;
    }

    if(!routePolyline){
      routePolyline=new google.maps.Polyline({map,strokeColor:"#1a73e8",strokeOpacity:.85,strokeWeight:3,zIndex:3500});
    }
    const path=routePolyline.getPath();
    const last=path.getLength()?path.getAt(path.getLength()-1):null;
    if(!last||last.lat()!==pos.lat||last.lng()!==pos.lng) path.push(pos);
  }catch(e){ console.warn(e); }
}
function currentStatusText(){
  const now=Date.now();
  return (now-lastFixMs>Math.max(20000,CONFIG.POLL_MS*4))?"停止中":"更新中";
}
function formatLastFixText(){
  if(!lastFixMs) return "";
  const dt = new Date(lastFixMs);
  return dt.toLocaleString("ja-JP",{month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"});
}

/* ============ 交通規制 UI ============ */
function setupRegulationUI(){
  openBtn       = document.getElementById("openBtn");
  collapsedHint = document.getElementById("collapsedHint");
  collapsedBtn  = document.getElementById("collapsedBtn");
  drawer        = document.getElementById("drawer");
  tabAutoEl     = document.getElementById("tabAuto");
  tabD1El       = document.getElementById("tabD1");
  tabD2El       = document.getElementById("tabD2");
  slotArea      = document.getElementById("slotArea");
  slotToggle    = document.getElementById("slotToggle");
  slotList      = document.getElementById("slotList");

  // 開く
  const openDrawer = () => {
    drawer.style.display = "block";
    collapsedHint.style.display = "none";
  };
  // 閉じる（規制表示は維持）
  const closeDrawer = () => {
    drawer.style.display = "none";
    collapsedHint.style.display = "block";
    // サマリー表記
    collapsedBtn.textContent = (currentMode === "auto") ? "自動更新" : "日時指定";
  };

  openBtn.addEventListener("click", () => {
    (drawer.style.display === "none") ? openDrawer() : closeDrawer();
  });
  collapsedBtn.addEventListener("click", openDrawer);

  // タブ：自動
  tabAutoEl.addEventListener("click", ()=>{
    currentMode="auto"; currentDayId=null; selectedSlotKey=null;
    setActiveTabs({auto:true,d1:false,d2:false});
    slotArea.style.display = "none";
    hideAll();
    autoShow(new Date());
  });

  // タブ：日付（時間帯選択を出せるように）
  tabD1El.addEventListener("click", ()=>selectDay("d1"));
  tabD2El.addEventListener("click", ()=>selectDay("d2"));

  // 時間帯選択の折りたたみ
  slotToggle.addEventListener("click", ()=>{
    slotList.style.display = (slotList.style.display==="none") ? "grid" : "none";
  });
}

function setActiveTabs({auto=false,d1=false,d2=false}){
  tabAutoEl.classList.toggle("active", auto);
  tabD1El.classList.toggle("active", d1);
  tabD2El.classList.toggle("active", d2);
}

function selectDay(dayId){
  currentMode="manual";
  currentDayId = dayId;
  selectedSlotKey = null;
  setActiveTabs({auto:false,d1:dayId==="d1",d2:dayId==="d2"});

  // 折りたたみエリア出す
  slotArea.style.display = "block";
  slotList.style.display = "none"; // 初回は閉じた状態
  // ボタン作り直し
  buildTimeButtons(dayId);
  // いったん消して、手動は時間選択待ち
  hideAll();
}

function buildTimeButtons(dayId){
  const day = DAYS.find(d=>d.id===dayId);
  slotList.innerHTML = "";
  day.slots.forEach(s=>{
    const b=document.createElement("button");
    b.className="slotbtn";
    b.textContent=s.shortLabel; // 時間だけ
    b.addEventListener("click", async ()=>{
      // 強調
      [...slotList.children].forEach(ch=>ch.classList.remove("active"));
      b.classList.add("active");
      selectedSlotKey = s.key;

      hideAll();
      await showSlot(s);
    });
    slotList.appendChild(b);
  });
}

// 自動表示（該当1本のみ）
async function autoShow(now){
  hideAll();
  const all=[...DAYS[0].slots, ...DAYS[1].slots];
  const hit = all.find(s => now>=new Date(s.start) && now<=new Date(s.end));
  if(hit) await showSlot(hit);
}

/* ============ GeoJSON → 線を描く（単独表示） ============ */
async function showSlot(slot){
  if(layers.has(slot.key)) return;
  const feats = await loadGeojsonPaths(slot.src);
  const polys=[];
  for(const f of feats){
    const path=f.path.map(([lat,lng])=>({lat,lng}));
    const glow   = new google.maps.Polyline({ path, ...STROKE.glow,   map });
    const casing = new google.maps.Polyline({ path, ...STROKE.casing, map });
    const main   = new google.maps.Polyline({ path, ...STROKE.main,   map });
    polys.push(glow,casing,main);
  }
  layers.set(slot.key, polys);
}
function hideAll(){
  for(const arr of layers.values()) arr.forEach(pl=>pl.setMap(null));
  layers.clear();
}
async function loadGeojsonPaths(src){
  if(loadedCache.has(src)) return loadedCache.get(src);
  const res = await fetch(src,{cache:"no-store"});
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

/* ============ POIマーカー（クリックでモーダル） ============ */
function addCategoryMarkers(list, iconUrl, zIndex=1000){
  const baseIcon = {
    url: iconUrl,
    size: new google.maps.Size(36,36),
    scaledSize: new google.maps.Size(36,36),
    anchor: new google.maps.Point(18,30),
  };
  list.forEach(p=>{
    const m=new google.maps.Marker({
      map, position:{lat:p.lat,lng:p.lng}, icon:baseIcon, zIndex, title:p.title, optimized:true
    });
    m.addListener("click", ()=>{
      const photo = p.photo ? `<img src="${p.photo}" alt="${p.title}">` : "";
      const desc  = escapeHtml(String(p.desc||"")).replace(/\n/g,"<br>");
      openModal(`
        <div class="title">${escapeHtml(p.title)}</div>
        ${photo}
        <div class="meta">${desc}</div>
      `);
    });
  });
}

/* ============ 現在地 / 追尾 ============ */
let myMarker=null, myAccCircle=null, watchId=null;
function addMyLocationControls(){
  const wrap=document.createElement("div"); wrap.className="ctlbar";
  const mk=(label)=>{ const b=document.createElement("button"); b.textContent=label; return b; };
  const btnLocate=mk("現在地"), btnFollow=mk("追尾ON");
  btnLocate.onclick=locateOnce;
  btnFollow.onclick=()=>toggleFollow(btnFollow);
  wrap.appendChild(btnLocate); wrap.appendChild(btnFollow);
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(wrap);
}
function locateOnce(){
  if(!navigator.geolocation){ alert("このブラウザは位置情報に対応していません。"); return; }
  navigator.geolocation.getCurrentPosition((pos)=>{
    const {latitude,longitude,accuracy}=pos.coords; const ll={lat:latitude,lng:longitude};
    showMyLocation(ll,accuracy); fitRadius(ll,300);
  },(e)=>alert("現在地を取得できませんでした: "+e.message),{enableHighAccuracy:true,timeout:10000,maximumAge:0});
}
function toggleFollow(btn){
  if(!navigator.geolocation){ alert("このブラウザは位置情報に対応していません。"); return; }
  if(watchId!=null){ navigator.geolocation.clearWatch(watchId); watchId=null; btn.textContent="追尾ON"; return; }
  watchId=navigator.geolocation.watchPosition((pos)=>{
    const {latitude,longitude,accuracy}=pos.coords; const ll={lat:latitude,lng:longitude};
    showMyLocation(ll,accuracy); map.panTo(ll);
  },(e)=>{ alert("追尾できませんでした: "+e.message); if(watchId!=null){navigator.geolocation.clearWatch(watchId);watchId=null;btn.textContent="追尾ON";}}, {enableHighAccuracy:true,timeout:15000,maximumAge:0});
  btn.textContent="追尾OFF";
}
function showMyLocation(ll,acc=30){
  if(!myMarker){
    myMarker=new google.maps.Marker({
      map, position:ll, zIndex:4500,
      icon:{path:google.maps.SymbolPath.CIRCLE, scale:6, fillColor:"#1a73e8", fillOpacity:1, strokeColor:"#fff", strokeWeight:2},
      title:"あなたの現在地"
    });
  }else{ myMarker.setPosition(ll); }
  if(!myAccCircle){
    myAccCircle=new google.maps.Circle({
      map, center:ll, radius:Math.max(acc,15),
      fillColor:"#1a73e8", fillOpacity:.15, strokeColor:"#1a73e8", strokeOpacity:.4, strokeWeight:1, zIndex:4400
    });
  }else{
    myAccCircle.setCenter(ll); myAccCircle.setRadius(Math.max(acc,15));
  }
}

/* ============ Util ============ */
function escapeHtml(s){
  return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
}
function fitRadius(center, meters){
  const dLat = meters / 111320;
  const dLng = meters / (111320 * Math.cos(center.lat * Math.PI/180));
  const sw = { lat:center.lat-dLat, lng:center.lng-dLng };
  const ne = { lat:center.lat+dLat, lng:center.lng+dLng };
  map.fitBounds(new google.maps.LatLngBounds(sw,ne));
}
