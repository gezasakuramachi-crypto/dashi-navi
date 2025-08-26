/* ================= 基本設定 ================= */
const CONFIG = {
  SERVER_BASE: "https://traccar-railway.fly.dev",
  DEVICE_ID: 1,
  PUBLIC_BEARER:
    "RzBFAiAaeMvmv32ZrmskwLBY7hx0jHxCezE-NGOh_K2-QFuHgQIhAOY_es0TTwL-GX4pbel4G6wxKQcYjJd1EgtRzGKhSlQ7eyJ1Ijo2LCJlIjoiMjAyNS0wOC0yN1QxNTowMDowMC4wMDArMDA6MDAifQ",
  POLL_MS: 5000,

  DASHI_ICON:
    "https://www.dropbox.com/scl/fi/echpcekhl6f13c9df5uzh/sakura.png?rlkey=e93ng3fdwbdlkvr07zkvw9pph&raw=1",

  ICONS: {
    info: "https://gezasakuramachi-crypto.github.io/dashi-navi/mark/info.png",
    wc:   "https://gezasakuramachi-crypto.github.io/dashi-navi/mark/wc.png",
    park: "https://gezasakuramachi-crypto.github.io/dashi-navi/mark/parking.png",
  },

  POI_ICON_PX: 18
};

/* ================= 地図の初期中心 ================= */
const MAP_CENTER = { lat: 35.966, lng: 140.628 };
const MAP_ZOOM   = 15;

/* ================= 規制線スタイル（赤枠＋20%塗り） ================= */
const STROKE = {
  main: {
    strokeColor: "#ff0000",
    strokeOpacity: 1,
    strokeWeight: 2,
    fillColor: "#ff0000",
    fillOpacity: 0.2,
    zIndex: 3002
  },
};

/* ================= POIデータ ================= */
const INFO_POINTS = [
  {
    title: "年番引継ぎ会場",
    lat: 35.9658889, lng: 140.6268333,
    photo: "https://gezasakuramachi-crypto.github.io/dashi-navi/mark/nen-hiki.png",
    desc: "9月2日18:15～\n山車の運行を執り仕切るのが「山車年番」です。\n今年の年番が、次年度年番町内に\nお伺いをたて引継ぐことを「年番引継」といいます。"
  },
  { title: "にぎわい広場", lat: 35.9664167, lng: 140.6277778, photo: "", desc: "飲食販売屋台あり。\nトイレ・休憩スペースもあります。" },
  {
    title: "総踊りのの字廻し会場",
    lat: 35.9679444, lng: 140.6300278,
    photo: "https://gezasakuramachi-crypto.github.io/dashi-navi/mark/souodori2.png",
    desc: "9月1日18:00～\n町内の山車が勢ぞろいして、\n全町内が年番区の演奏にあわせて\n総踊りをします。\nその後は各町内による、\nのの字廻しが披露されます。"
  },
  {
    title: "一斉踊り会場",
    lat: 35.9670556, lng: 140.6306944, photo: "",
    desc: "9月2日13:30～\n五ケ町が終結し、各町内が\n順番に踊りを踊っていきます。\nその後年番区を先頭に\n役曳きをして全町内を曳きまわします。"
  },
  {
    title: "大町通り山車集合",
    lat: 35.9679722, lng: 140.6286944, photo: "",
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

const layers = new Map();
const loadedCache = new Map();

const markers = { info:[], wc:[], park:[] };
let poiInfo = null;

let myLocMarker = null, myLocCircle = null;

/* ================= 初期化 ================= */
window.initMap = function(){
  map = new google.maps.Map(document.getElementById("map"), {
    center: MAP_CENTER, zoom: MAP_ZOOM,
    mapTypeControl:false, streetViewControl:false, fullscreenControl:true,
    gestureHandling:"greedy"
  });

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
  dashInfo = new google.maps.InfoWindow({ content: makeDashiBody("更新待機中") });
  dashMarker.addListener("click", ()=>{
    dashInfo.setContent(makeDashiBody(currentStatusText()));
    dashInfo.open(map, dashMarker);
  });

  map.addListener("click", ()=>{
    dashInfo.close();
    if(poiInfo) poiInfo.close();
    const drawer=document.getElementById("drawer");
    if(drawer) drawer.style.display="none";
  });

  setupLeftPanel();
  setupRegulationUI();
  startPolling();
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

    if(!firstFitDone){
      fitRadius(pos, 300);
      firstFitDone = true;
    }

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
  return (now-lastFixMs>Math.max(20000,CONFIG.POLL_MS*4))?"一時停止中":"更新中";
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

  openBtn.addEventListener("click", ()=>{
    drawer.style.display = drawer.style.display==='none' ? 'block':'none';
  });

  tabAuto.addEventListener("click", ()=>{
    [tabAuto,tabD1,tabD2].forEach(t=>t.classList.remove("active"));
    tabAuto.classList.add("active");
    slotList.innerHTML="";
    autoShow(new Date());
  });

  tabD1.addEventListener("click", ()=>{
    [tabAuto,tabD1,tabD2].forEach(t=>t.classList.remove("active"));
    tabD1.classList.add("active");
    buildTimeButtons("d1");
  });

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
      [...slotList.children].forEach(x=>x.classList.remove("active"));
      b.classList.add("active");
      hideAll();
      await showSlot(s);
    });
    slotList.appendChild(b);
  });
}

async function autoShow(now){
  hideAll();
  const all=[...DAYS[0].slots, ...DAYS[1].slots];
  const hit = all.find(s => now>=new Date(s.start) && now<=new Date(s.end));
  if(hit) await showSlot(hit);
}

/* ================= 規制 GeoJSON ================= */
async function showSlot(slot){
  if(layers.has(slot.key)) return;
  const feats = await loadGeojsonPaths(slot.src);
  const polys=[];
  for(const f of feats){
    const path=f.path.map(([lat,lng])=>({lat,lng}));
    const polygon = new google.maps.Polygon({ path, ...STROKE.main, map });
    polys.push(polygon);
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

/* ================= 左パネル ================= */
function setupLeftPanel(){
  const btnFocus = document.getElementById("btnFocusDashi");
  btnFocus.addEventListener("click", ()=>{
    if(!dashMarker) return;
    const pos = dashMarker.getPosition();
    if(!pos) return;
    fitRadius({lat:pos.lat(), lng:pos.lng()}, 300);
  });

  createCategoryMarkers("info", INFO_POINTS, CONFIG.ICONS.info, true);
  createCategoryMarkers("wc",   WC_POINTS,   CONFIG.ICONS.wc,   true);
  createCategoryMarkers("park", PARK_POINTS, CONFIG.ICONS.park, true);

  const btnInfo = document.getElementById("btnInfo");
  const btnWC   = document.getElementById("btnWC");
  const btnPark = document.getElement
