/* ================= 設定 ================= */
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
};

// 中心とズーム
const MAP_CENTER = { lat: 35.966, lng: 140.628 };
const MAP_ZOOM = 15;

// 規制表示スタイル（赤・透過）
const STROKE = {
  casing: { strokeColor: "#ffffff", strokeOpacity: 0, strokeWeight: 0 },
  main:   { strokeColor: "#ff0000", strokeOpacity: 0.4, strokeWeight: 10, zIndex: 3002 },
  glow:   { strokeColor: "#ff0000", strokeOpacity: 0, strokeWeight: 0 },
};

// 日程と時間帯（必要分のみ）
const DAYS = [
  {
    id: "d1", label: "9/1(月)",
    slots: [
      { name:"9/1 10:30-", src:"data/91-1030-1500map.geojson" },
      { name:"9/1 15:00-", src:"data/91-1500-1600.geojson" },
      { name:"9/1 16:00-", src:"data/91-1600-1930.geojson" },
      { name:"9/1 19:30-", src:"data/91-1930-2045.geojson" },
      { name:"9/1 20:45-", src:"data/91-2045-2200.geojson" },
    ]
  },
  {
    id: "d2", label: "9/2(火)",
    slots: [
      { name:"9/2 11:00-", src:"data/92-1100-1230.geojson" },
      { name:"9/2 12:30-", src:"data/92-1230-1400.geojson" },
      { name:"9/2 14:00-", src:"data/92-1400-1630.geojson" },
      { name:"9/2 16:30-", src:"data/92-1630-1900.geojson" },
      { name:"9/2 19:00-", src:"data/92-1900-1930.geojson" },
      { name:"9/2 19:30-", src:"data/92-1930-2200.geojson" },
    ]
  }
];

let map, dashMarker, dashInfo, routePolyline;
let lastFixMs = 0, pollTimer=null;
let currentDayId = "d1";
const layers = new Map();
const loadedCache = new Map();

// マーカー格納
const markers = { info:[], wc:[], park:[] };

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
      url:CONFIG.DASHI_ICON, size:new google.maps.Size(40,40),
      scaledSize:new google.maps.Size(40,40), anchor:new google.maps.Point(20,30)
    },
    zIndex:2000, title:"桜町区山車"
  });
  dashInfo = new google.maps.InfoWindow({ content: makeDashiBody("判定中") });
  dashMarker.addListener("click", ()=>{
    dashInfo.setContent(makeDashiBody(currentStatusText()));
    dashInfo.open(map, dashMarker);
  });

  // 山車位置更新
  startPolling();

  // 規制UI
  setupRegulationUI();

  // カテゴリ切替
  setupCategoryToggles();

  // 初期表示：自動
  autoShow(new Date());
};

/* ================= 山車位置 ================= */
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
    if(!routePolyline){
      routePolyline=new google.maps.Polyline({map,strokeColor:"#1a73e8",strokeOpacity:.85,strokeWeight:3});
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
function makeDashiBody(status){
  return `
    <div class="iw">
      <div class="title">桜町区山車</div>
      <div>ステータス：${status}</div>
    </div>
  `;
}

/* ================= 規制UI ================= */
function setupRegulationUI(){
  const openBtn=document.getElementById("openBtn");
  const drawer=document.getElementById("drawer");
  openBtn.addEventListener("click", ()=>{
    drawer.style.display = drawer.style.display==='none' ? 'block':'none';
  });

  const tabAuto=document.getElementById("tabAuto");
  const tabD1=document.getElementById("tabD1");
  const tabD2=document.getElementById("tabD2");
  const slotList=document.getElementById("slotList");

  tabAuto.addEventListener("click", ()=>{
    [tabAuto,tabD1,tabD2].forEach(t=>t.classList.remove("active"));
    tabAuto.classList.add("active");
    slotList.innerHTML="";
    autoShow(new Date());
  });
  tabD1.addEventListener("click", ()=>{
    [tabAuto,tabD1,tabD2].forEach(t=>t.classList.remove("active"));
    tabD1.classList.add("active");
    buildSlotList("d1");
  });
  tabD2.addEventListener("click", ()=>{
    [tabAuto,tabD1,tabD2].forEach(t=>t.classList.remove("active"));
    tabD2.classList.add("active");
    buildSlotList("d2");
  });
}
function buildSlotList(dayId){
  currentDayId=dayId;
  const slotList=document.getElementById("slotList");
  slotList.innerHTML="";
  const day=DAYS.find(d=>d.id===dayId);
  day.slots.forEach((s,idx)=>{
    const b=document.createElement("div");
    b.textContent=s.name;
    b.className="slotbtn";
    b.addEventListener("click",async()=>{
      [...slotList.children].forEach(x=>x.classList.remove("active"));
      b.classList.add("active");
      hideAll(); await showSlot(s);
    });
    slotList.appendChild(b);
  });
}
async function autoShow(now){
  hideAll();
  for(const d of DAYS){
    for(const s of d.slots){
      if(now>=new Date(s.start||"2000-01-01") && now<=new Date(s.end||"2100-01-01")){
        await showSlot(s);
      }
    }
  }
}
async function showSlot(slot){
  if(layers.has(slot.src)) return;
  const feats=await loadGeojsonPaths(slot.src);
  const polys=[];
  for(const f of feats){
    const path=f.path.map(([lat,lng])=>({lat,lng}));
    const main=new google.maps.Polyline({ path, ...STROKE.main, map });
    polys.push(main);
  }
  layers.set(slot.src,polys);
}
function hideAll(){
  for(const arr of layers.values()) arr.forEach(pl=>pl.setMap(null));
  layers.clear();
}
async function loadGeojsonPaths(src){
  if(loadedCache.has(src)) return loadedCache.get(src);
  const res=await fetch(src); const gj=await res.json(); const out=[];
  function toLatLngList(coords){ return coords.map(c=>[c[1],c[0]]); }
  for(const feat of (gj.features||[])){
    const g=feat.geometry||{}; if(g.type==="LineString"){ out.push({path:toLatLngList(g.coordinates)}); }
    else if(g.type==="MultiLineString"){ for(const line of g.coordinates) out.push({path:toLatLngList(line)}); }
  }
  loadedCache.set(src,out); return out;
}

/* ================= カテゴリ切替 ================= */
function setupCategoryToggles(){
  buildCategoryMarkers("info",true);
  buildCategoryMarkers("wc",true);
  buildCategoryMarkers("park",true);

  const btnInfo=document.getElementById("btnInfo");
  const btnWC=document.getElementById("btnWC");
  const btnPark=document.getElementById("btnPark");

  btnInfo.addEventListener("click",()=>{
    const inactive=btnInfo.classList.toggle("inactive");
    toggleCategory("info", !inactive);
  });
  btnWC.addEventListener("click",()=>{
    const inactive=btnWC.classList.toggle("inactive");
    toggleCategory("wc", !inactive);
  });
  btnPark.addEventListener("click",()=>{
    const inactive=btnPark.classList.toggle("inactive");
    toggleCategory("park", !inactive);
  });
}

function buildCategoryMarkers(type,show){
  const list={
    info:[
      {pos:{lat:35.9658889,lng:140.6268334}, title:"年番引継ぎ会場", desc:"9月2日18:15～ 山車の運行を執り仕切るのが「山車年番」です。今年の年番が次年度年番町内にお伺いをたて引継ぐことを「年番引継」と
