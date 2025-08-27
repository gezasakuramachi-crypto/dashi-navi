/* ================= 基本設定 ================= */
const CONFIG = {
  SERVER_BASE: "https://traccar-railway.fly.dev",
  DEVICE_ID: 1,
  PUBLIC_BEARER:
    "RzBFAiAaeMvmv32ZrmskwLBY7hx0jHxCezE-NGOh_K2-QFuHgQIhAOY_es0TTwL-GX4pbel4G6wxKQcYjJd1EgtRzGKhSlQ7eyJ1Ijo2LCJlIjoiMjAyNS0wOC0yN1QxNTowMDowMC4wMDArMDA6MDAifQ",
  POLL_MS: 5000,

  ICONS: {
    info: "mark/info.png",
    wc:   "https://gezasakuramachi-crypto.github.io/dashi-navi/mark/wc.png",
    park: "https://gezasakuramachi-crypto.github.io/dashi-navi/mark/parking.png",
  },

  POI_ICON_PX: 18
};

/* ================= 地図の初期中心 ================= */
const MAP_CENTER = { lat: 35.966, lng: 140.628 };
const MAP_ZOOM   = 15;

/* ================= 規制スタイル（枠=赤 / 塗り=淡ピンク） ================= */
const STYLE = {
  line:   { strokeColor:"#ff0000", strokeOpacity:1, strokeWeight:0.5, zIndex:3002 },
  polygon:{ strokeColor:"#ff0000", strokeOpacity:1, strokeWeight:0.5, fillColor:"#ff99cc", fillOpacity:0.35, zIndex:3002 }
};

/* ================= 走行エリア（外周だけ青線：任意） ================= */
const RUNAREA_STYLE = { strokeColor:"#1e88e5", strokeOpacity:0.95, strokeWeight:2, zIndex:2900 };
const RUNAREA_SRC   = "data/run-area.geojson";

/* ================= POIデータ ================= */
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

/* ================= 交通規制スロット ================= */
const DAYS = [
  { id:"d1", label:"9/1(月)", slots:[
    { shortLabel:"10:30-", key:"91-1030-1500", start:"2025-09-01T10:30:00+09:00", end:"2025-09-01T15:00:00+09:00", src:"data/91-1030-1500map.geojson" },
    { shortLabel:"15:00-", key:"91-1500-1600", start:"2025-09-01T15:00:00+09:00", end:"2025-09-01T16:00:00+09:00", src:"data/91-1500-1600.geojson" },
    { shortLabel:"16:00-", key:"91-1600-1930", start:"2025-09-01T16:00:00+09:00", end:"2025-09-01T19:30:00+09:00", src:"data/91-1600-1930.geojson" },
    { shortLabel:"19:30-", key:"91-1930-2045", start:"2025-09-01T19:30:00+09:00", end:"2025-09-01T20:45:00+09:00", src:"data/91-1930-2045.geojson" },
    { shortLabel:"20:45-", key:"91-2045-2200", start:"2025-09-01T20:45:00+09:00", end:"2025-09-01T22:00:00+09:00", src:"data/91-2045-2200.geojson" },
  ]},
  { id:"d2", label:"9/2(火)", slots:[
    { shortLabel:"11:00-", key:"92-1100-1230", start:"2025-09-02T11:00:00+09:00", end:"2025-09-02T12:30:00+09:00", src:"data/92-1100-1230.geojson" },
    { shortLabel:"12:30-", key:"92-1230-1400", start:"2025-09-02T12:30:00+09:00", end:"2025-09-02T14:00:00+09:00", src:"data/92-1230-1400.geojson" },
    { shortLabel:"14:00-", key:"92-1400-1630", start:"2025-09-02T14:00:00+09:00", end:"2025-09-02T16:30:00+09:00", src:"data/92-1400-1630.geojson" },
    { shortLabel:"16:30-", key:"92-1630-1900", start:"2025-09-02T16:30:00+09:00", end:"2025-09-02T19:00:00+09:00", src:"data/92-1630-1900.geojson" },
    { shortLabel:"19:00-", key:"92-1900-1930", start:"2025-09-02T19:00:00+09:00", end:"2025-09-02T19:30:00+09:00", src:"data/92-1900-1930.geojson" },
    { shortLabel:"19:30-", key:"92-1930-2200", start:"2025-09-02T19:30:00+09:00", end:"2025-09-02T22:00:00+09:00", src:"data/92-1930-2200.geojson" },
  ]},
];

/* ================= 経路図URL（JSTで日付振り分け） ================= */
const ROUTE_URLS = {
  "8-31": "https://sites.google.com/view/sakuramachiku/%E4%BB%A4%E5%92%8C%E5%B9%B4%E7%A5%9E%E5%B9%B8%E7%A5%AD/8%E6%9C%8831%E6%97%A5%E5%89%8D%E5%A4%9C%E7%A5%AD%E7%B5%8C%E8%B7%AF%E5%9B%B3",
  "9-1" : "https://sites.google.com/view/sakuramachiku/%E4%BB%A4%E5%92%8C%E5%B9%B4%E7%A5%9E%E5%B9%B8%E7%A5%AD/9%E6%9C%881%E6%97%A5-%E7%A5%9E%E5%B9%B8%E7%A5%AD%E7%B5%8C%E8%B7%AF%E5%9B%B3",
  "9-2" : "https://sites.google.com/view/sakuramachiku/%E4%BB%A4%E5%92%8C%E5%B9%B4%E7%A5%9E%E5%B9%B8%E7%A5%AD/9%E6%9C%882%E6%97%A5-%E7%A5%9E%E5%B9%B8%E7%A5%AD%E7%B5%8C%E8%B7%AF%E5%9B%B3"
};

/* ================= 地図・状態 ================= */
let map, dashMarker, dashInfo, routePolyline;
let lastFixMs = 0, pollTimer = null, firstFitDone = false;

// 交通規制レイヤー（key -> [Overlay...]）
const layers = new Map();
// 読み込みキャッシュ（src -> [{ kind:'line'|'polygon', path:[[lat,lng],...]}]）
const loadedCache = new Map();

// POIマーカーとInfoWindow
const markers = { info:[], wc:[], park:[] };
let poiInfo = null;

// 現在地（単発）表示用
let myLocMarker = null, myLocCircle = null;

// 表示モード（"auto" | "manual"）
let REG_MODE = "auto";

/* ================= 初期化（Google Maps callback） ================= */
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
      url:"mark/sakura.png",
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

  // 画面外（地図）クリックで情報系を閉じる
  map.addListener("click", ()=>{
    dashInfo.close();
    if(poiInfo) poiInfo.close();
    closeRegDrawer();
  });

  // 左パネル（レイヤー）
  setupLeftLayers();

  // 交通規制UI（タブ/ボタン類のイベント+初期自動表示）
  setupRegulationUI();

  // ボトムアクション
  setupBottomActions();

  // 現在地ポーリング
  startPolling();

  // 初期：現在時刻に合う規制を1本表示（ドロワーは閉じたまま）
  autoShow(new Date());

  // 走行エリア（外周線のみ）— 任意
  drawRunAreaOutline().catch(console.warn);
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
  return (now-lastFixMs>Math.max(20000,CONFIG.POLL_MS*4))?"一時停止中":"更新中";
}

function makeDashiBody(status){
  const pos = dashMarker.getPosition();
  const lat = pos ? pos.lat() : MAP_CENTER.lat;
  const lng = pos ? pos.lng() : MAP_CENTER.lng;
  const routeUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  // JSTの日付で経路図URLを分岐
  const nowJST = new Date(new Date().toLocaleString("ja-JP", { timeZone:"Asia/Tokyo" }));
  const m = nowJST.getMonth()+1, d = nowJST.getDate();
  const key = `${m}-${d}`;
  const routePageUrl = ROUTE_URLS[key] || "";

  return `
    <div class="iw">
      <div class="title">桜町区山車</div>
      <div>ステータス：${status}</div>
      <button class="btn" onclick="window.open('${routeUrl}','_blank')">Googleマップで経路案内</button>
      ${routePageUrl ? `<button class="btn" style="margin-left:6px" onclick="window.open('${routePageUrl}','_blank')">経路図</button>` : ""}
    </div>
  `;
}

/* ================= 交通規制 UI ================= */
function setupRegulationUI(){
  const drawer   = document.getElementById("regDrawer");
  const btnClose = document.getElementById("regClose");
  const tabAuto  = document.getElementById("tabAuto");
  const tabD1    = document.getElementById("tabD1");
  const tabD2    = document.getElementById("tabD2");
  const slotList = document.getElementById("slotList");

  // タブ切り替え
  function activate(tab){
    [tabAuto,tabD1,tabD2].forEach(t=>t.classList.remove("active"));
    tab.classList.add("active");
  }

  tabAuto.addEventListener("click", ()=>{
    activate(tabAuto);
    REG_MODE = "auto";
    showRegStatus(false); // 自動のときは非表示
    slotList.innerHTML="";
    autoShow(new Date());
  });

  // シングルエクスパンド型：9/1, 9/2いずれか片方だけ展開
  tabD1.addEventListener("click", ()=>{
    activate(tabD1);
    buildTimeButtons("d1");
  });
  tabD2.addEventListener("click", ()=>{
    activate(tabD2);
    buildTimeButtons("d2");
  });

  // 閉じるボタン
  btnClose.addEventListener("click", closeRegDrawer);

  // 右端の補助“規制”ピル
  document.getElementById("regPill").addEventListener("click", toggleRegDrawer);

  // 初期は閉じておく
  drawer.style.display = "none";
  drawer.setAttribute("aria-hidden","true");
}

function openRegDrawer(){
  const el = document.getElementById("regDrawer");
  el.style.display = "block";
  el.setAttribute("aria-hidden","false");
  showRegStatus(false); // 開いたらバッジは隠す
}
function closeRegDrawer(){
  const el = document.getElementById("regDrawer");
  el.style.display = "none";
  el.setAttribute("aria-hidden","true");
  showRegStatus(REG_MODE === "manual"); // 手動なら閉じた時に出す
}
function toggleRegDrawer(){
  const el = document.getElementById("regDrawer");
  if (el.getAttribute("aria-hidden")==="true") openRegDrawer();
  else closeRegDrawer();
}

/* ================= 規制スロット表示 ================= */
function buildTimeButtons(dayId){
  const slotList=document.getElementById("slotList");
  slotList.innerHTML="";
  const day = DAYS.find(d=>d.id===dayId);
  day.slots.forEach(s=>{
    const b=document.createElement("button");
    b.className="slotbtn";
    b.textContent=s.shortLabel;
    b.addEventListener("click", async ()=>{
      if (b.disabled) return;                  // 連打ガード
      b.disabled = true; setTimeout(()=>b.disabled=false, 500);
      [...slotList.children].forEach(x=>x.classList.remove("active"));
      b.classList.add("active");
      REG_MODE = "manual";          // ← 手動に切替
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
  REG_MODE = "auto";       // 自動モードに戻す
  showRegStatus(false);    // インジケーター非表示
}

/* ================= 規制 GeoJSON（線/面どちらもOK） ================= */
async function showSlot(slot){
  if(layers.has(slot.key)) return;
  const feats = await loadGeojsonPaths(slot.src);
  const overlays=[];
  for(const f of feats){
    const path = f.path.map(([lat,lng])=>({lat,lng}));
    if (f.kind === "polygon") {
      const poly = new google.maps.Polygon({ path, ...STYLE.polygon, map });
      overlays.push(poly);
    } else {
      const line = new google.maps.Polyline({ path, ...STYLE.line, map });
      overlays.push(line);
    }
  }
  layers.set(slot.key, overlays);
}

function hideAll(){
  for(const arr of layers.values()) arr.forEach(ov=>ov.setMap(null));
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
      out.push({kind:'line', path: toLatLngList(g.coordinates)});
    }else if(t==='MultiLineString'){
      for(const line of g.coordinates) out.push({kind:'line', path: toLatLngList(line)});
    }else if(t==='Polygon'){
      out.push({kind:'polygon', path: toLatLngList(g.coordinates[0])});
    }else if(t==='MultiPolygon'){
      for(const poly of g.coordinates) out.push({kind:'polygon', path: toLatLngList(poly[0])});
    }
  }
  loadedCache.set(src,out);
  return out;
}

/* ================= 左：レイヤー（表示切替） ================= */
function setupLeftLayers(){
  // カテゴリマーカー初期化（ONで出す）
  createCategoryMarkers("info", INFO_POINTS, CONFIG.ICONS.info, true);
  createCategoryMarkers("wc",   WC_POINTS,   CONFIG.ICONS.wc,   true);
  createCategoryMarkers("park", PARK_POINTS, CONFIG.ICONS.park, true);

  const btnInfo = document.getElementById("btnInfo");
  const btnWC   = document.getElementById("btnWC");
  const btnPark = document.getElementById("btnPark");
  btnInfo.addEventListener("click", ()=>{ const off=btnInfo.classList.toggle("inactive"); toggleCategory("info", !off); });
  btnWC.addEventListener("click",   ()=>{ const off=btnWC.classList.toggle("inactive");   toggleCategory("wc",   !off); });
  btnPark.addEventListener("click", ()=>{ const off=btnPark.classList.toggle("inactive"); toggleCategory("park", !off); });

  // ミニツールチップ（長押しでラベル表示）
  ["btnInfo","btnWC","btnPark"].forEach(id=>{
    const el=document.getElementById(id);
    el.addEventListener("touchstart", ()=>{ el.title && showMiniTooltip(el.title); }, {passive:true});
  });
}

function createCategoryMarkers(key, list, iconUrl, show){
  if(markers[key]?.length){ markers[key].forEach(m=>m.setMap(null)); markers[key] = []; }
  else { markers[key] = []; }

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

/* ================= ボトム：アクション ================= */
function setupBottomActions(){
  // 山車へフォーカス
  document.getElementById("actionFocus").addEventListener("click", ()=>{
    if(!dashMarker) return;
    const pos = dashMarker.getPosition();
    if(!pos) return;
    fitRadius({lat:pos.lat(), lng:pos.lng()}, 300);
  });

  // 規制ドロワー開閉（ボトム＋右ピルの両方で開ける）
  document.getElementById("actionReg").addEventListener("click", toggleRegDrawer);

  // 現在地へ移動
  document.getElementById("actionMyLoc").addEventListener("click", ()=>{
    if(!navigator.geolocation){
      alert("お使いのブラウザは現在地取得に対応していません。");
      return;
    }
    navigator.geolocation.getCurrentPosition((pos)=>{
      const {latitude, longitude, accuracy} = pos.coords;
      const ll = {lat: latitude, lng: longitude};

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
      } else { myLocMarker.setPosition(ll); myLocMarker.setMap(map); }

      if(!myLocCircle){
        myLocCircle = new google.maps.Circle({
          center: ll, map,
          radius: Math.max(accuracy, 60),
          fillColor: "#4285f4", fillOpacity: 0.15,
          strokeColor: "#4285f4", strokeOpacity: 0.5, strokeWeight: 1,
          zIndex: 4400
        });
      } else {
        myLocCircle.setCenter(ll);
        myLocCircle.setRadius(Math.max(accuracy, 60));
        myLocCircle.setMap(map);
      }

      fitRadius(ll, 300);
    }, (err)=>{
      console.warn(err);
      alert("現在地を取得できませんでした。位置情報の許可設定をご確認ください。");
    }, { enableHighAccuracy:true, timeout:8000, maximumAge:0 });
  });

  // ヘルプ
  const helpModal = document.getElementById("helpModal");
  const helpClose = document.getElementById("helpClose");
  document.getElementById("actionHelp").addEventListener("click", ()=>{
    helpModal.style.display='flex'; helpModal.setAttribute('aria-hidden','false');
  });
  helpClose.addEventListener("click", ()=>{
    helpModal.style.display='none'; helpModal.setAttribute('aria-hidden','true');
  });
  helpModal.addEventListener("click", (e)=>{
    if(e.target===helpModal){ helpModal.style.display='none'; helpModal.setAttribute('aria-hidden','true'); }
  });
}

/* ================= インジケーター制御 ================= */
function showRegStatus(show){
  const el = document.getElementById("regStatus");
  el.style.display = show ? "inline-flex" : "none";
}

/* ================= 走行エリア外周線（塗り無し）を描画 ================= */
async function drawRunAreaOutline(){
  try{
    const res = await fetch(RUNAREA_SRC, { cache: "no-store" });
    if(!res.ok) return;
    const gj  = await res.json();

    const toLatLngList = (coords)=>coords.map(c=>({ lat: c[1], lng: c[0] }));

    for(const feat of (gj.features || [])){
      const g = feat.geometry || {};
      if(g.type === "Polygon"){
        const outer = g.coordinates?.[0];
        if(outer && outer.length >= 2){
          new google.maps.Polyline({ path: toLatLngList(outer), map, ...RUNAREA_STYLE });
        }
      }else if(g.type === "MultiPolygon"){
        for(const poly of (g.coordinates || [])){
          const outer = poly?.[0];
          if(outer && outer.length >= 2){
            new google.maps.Polyline({ path: toLatLngList(outer), map, ...RUNAREA_STYLE });
          }
        }
      }else if(g.type === "LineString"){
        new google.maps.Polyline({ path: toLatLngList(g.coordinates), map, ...RUNAREA_STYLE });
      }else if(g.type === "MultiLineString"){
        for(const line of (g.coordinates || [])){
          new google.maps.Polyline({ path: toLatLngList(line), map, ...RUNAREA_STYLE });
        }
      }
    }
  }catch(e){
    console.warn("走行エリアの読み込みに失敗:", e);
  }
}

/* ================= ちいさなUI補助 ================= */
let _tipTimer=null;
function showMiniTooltip(text){
  if(_tipTimer) clearTimeout(_tipTimer);
  const div = document.createElement("div");
  div.textContent=text;
  Object.assign(div.style,{
    position:"fixed", left:"54px", top:"calc(var(--headerH) + 24px)", zIndex:905,
    background:"rgba(0,0,0,.75)", color:"#fff", padding:"4px 8px", borderRadius:"8px",
    fontSize:"11px", pointerEvents:"none"
  });
  document.body.appendChild(div);
  _tipTimer=setTimeout(()=>{ div.remove(); _tipTimer=null; }, 1200);
}

/* ================= Util ================= */
function escapeHtml(s){
  return String(s ?? "").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;","&gt;":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
}
function fitRadius(center, meters){
  const dLat = meters / 111320;
  const dLng = meters / (111320 * Math.cos(center.lat * Math.PI/180));
  const sw = { lat:center.lat-dLat, lng:center.lng-dLng };
  const ne = { lat:center.lat+dLat, lng:center.lng+dLng };
  map.fitBounds(new google.maps.LatLngBounds(sw,ne));
}
