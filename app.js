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

/* === 規制スタイル === */
const STYLE = {
  line:   { strokeColor:"#ff0000", strokeOpacity:1, strokeWeight:1.0, zIndex:3002 },
  polygon:{ strokeColor:"#ff0000", strokeOpacity:1, strokeWeight:1.0,
            fillColor:"#ff99cc", fillOpacity:0.35, zIndex:3002 }
};

/* === 走行エリア === */
const RUNAREA_STYLE = { strokeColor:"#1e88e5", strokeOpacity:0.95, strokeWeight:2,
                        fillOpacity:0, zIndex:2900 };
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

/* === 交通規制データ === */
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

/* === 経路図URL === */
const ROUTE_URLS = {
  "0831":"https://sites.google.com/view/sakuramachiku/令和年神幸祭/8月31日前夜祭経路図",
  "0901":"https://sites.google.com/view/sakuramachiku/令和年神幸祭/9月1日-神幸祭経路図",
  "0902":"https://sites.google.com/view/sakuramachiku/令和年神幸祭/9月2日-神幸祭経路図",
};

function getRouteMapUrlByDateJST() {
  const params = new URLSearchParams(location.search);
  const override = params.get("route");
  if (override && ROUTE_URLS[override]) return ROUTE_URLS[override];
  const jstNow = new Date(new Date().toLocaleString("en-US",{timeZone:"Asia/Tokyo"}));
  const m = jstNow.getMonth() + 1, d = jstNow.getDate();
  if (m < 8 || (m===8 && d<=31)) return ROUTE_URLS["0831"];
  if (m===9 && d===1) return ROUTE_URLS["0901"];
  if (m===9 && d===2) return ROUTE_URLS["0902"];
  return ROUTE_URLS["0901"];
}

/* ========= グローバル変数 ========= */
let map, dashiMarker, infoWindow;
let infoMarkers=[], wcMarkers=[], parkMarkers=[];
let trafficOverlays=[], runAreaOverlays=[];
let latestPositionTime=null;
let currentTrafficLabel="";

/* ========= ユーティリティ ========= */
async function fetchLatestPosition(){
  const url=`${CONFIG.SERVER_BASE}/api/positions?deviceId=${CONFIG.DEVICE_ID}&limit=1`;
  const res=await fetch(url,{headers:{Authorization:`Bearer ${CONFIG.PUBLIC_BEARER}`}});
  if(!res.ok) throw new Error("位置取得失敗");
  const arr=await res.json(); return arr&&arr[0];
}
function makeMarker({lat,lng}, iconUrl, title, sizePX=24){
  return new google.maps.Marker({
    position:{lat,lng}, map, title,
    icon:{url:iconUrl, scaledSize:new google.maps.Size(sizePX,sizePX)},
    zIndex:2500,
  });
}
function setMarkersVisible(list, visible){ list.forEach(m=>m.setMap(visible?map:null)); }

/* ========= InfoWindow ========= */
function buildDashiInfoContent(position, updateDate){
  const now=new Date();
  const ageSec=updateDate?Math.floor((now.getTime()-updateDate.getTime())/1000):null;
  const running=(ageSec!==null && ageSec<=90);
  const statusText=running?"更新中":"停止中";
  const dirUrl=`https://www.google.com/maps/dir/?api=1&destination=${position.lat},${position.lng}&travelmode=walking`;
  const routeMapUrl=getRouteMapUrlByDateJST();
  return `
    <div class="iw iw-narrow">
      <div class="title">桜町区</div>
      <div class="status">${statusText}</div>
      <div><a class="btn" href="${dirUrl}" target="_blank" rel="noopener">経路表示</a></div>
      <div><a class="btn" href="${routeMapUrl}" target="_blank" rel="noopener">経路図</a></div>
    </div>`;
}
function buildPoiInfoContent(p){
  const photo=p.photo?`<div style="margin:4px 0;"><img src="${p.photo}" alt="" style="max-width:100%;border-radius:6px;"></div>`:"";
  const desc=p.desc?`<div style="white-space:pre-wrap;">${p.desc}</div>`:"";
  return `<div class="iw iw-narrow"><div class="title">${p.title||"場所"}</div>${photo}${desc}</div>`;
}

/* ========= 地図初期化 ========= */
async function initMap(){
  map=new google.maps.Map(document.getElementById("map"),{
    center:MAP_CENTER, zoom:MAP_ZOOM,
    mapTypeControl:false, fullscreenControl:true, streetViewControl:false,
    clickableIcons:true, gestureHandling:"greedy"
  });
  infoWindow=new google.maps.InfoWindow();
  map.addListener("click",()=>{infoWindow.close();});

  // 走行エリア
  runAreaOverlays=await addGeoJsonAsOverlays(RUNAREA_SRC,RUNAREA_STYLE);

  // POI
  const makePoi=(arr,icon,size=CONFIG.POI_ICON_PX)=>
    arr.map(p=>{
      const m=makeMarker({lat:p.lat,lng:p.lng},icon,p.title,size);
      m.addListener("click",()=>{infoWindow.setContent(buildPoiInfoContent(p)); infoWindow.open({anchor:m,map});});
      return m;
    });
  infoMarkers=makePoi(INFO_POINTS,CONFIG.ICONS.info);
  wcMarkers  =makePoi(WC_POINTS,CONFIG.ICONS.wc);
  parkMarkers=makePoi(PARK_POINTS,CONFIG.ICONS.park);

  // 山車
  const pos=await fetchLatestPosition().catch(()=>null);
  if(pos){
    const p={lat:pos.latitude,lng:pos.longitude};
    latestPositionTime=new Date(pos.deviceTime||pos.fixTime||pos.serverTime||Date.now());
    dashiMarker=new google.maps.Marker({
      position:p, map, title:"桜町区", zIndex:3000,
      icon:{url:CONFIG.ICONS.sakura, scaledSize:new google.maps.Size(28,28)}
    });
    const openDashiIW=()=>{
      const iwHtml=buildDashiInfoContent({lat:dashiMarker.getPosition().lat(),lng:dashiMarker.getPosition().lng()},latestPositionTime);
      infoWindow.setContent(iwHtml); infoWindow.open({anchor:dashiMarker,map});
    };
    dashiMarker.addListener("click",openDashiIW);
    document.getElementById("bDashi").addEventListener("click",()=>{map.panTo(dashiMarker.getPosition()); openDashiIW();});
    setInterval(async()=>{const np=await fetchLatestPosition().catch(()=>null); if(np){const npPos={lat:np.latitude,lng:np.longitude}; latestPositionTime=new Date(np.deviceTime||np.fixTime||np.serverTime||Date.now()); dashiMarker.setPosition(npPos);}}, CONFIG.POLL_MS);
  }

  // 右上ピル＋下段交通規制トグル
  const pill=document.getElementById("regPill");
  const drawer=document.getElementById("regDrawer");
  const closeBtn=document.getElementById("regClose");
  function toggleDrawer(){ if(!drawer) return; drawer.style.display=(drawer.style.display==="block"?"none":"block"); }
  pill.addEventListener("click",toggleDrawer);
  closeBtn.addEventListener("click",()=>drawer.style.display="none");
  document.addEventListener("click",e=>{if(drawer && drawer.style.display==="block" && !drawer.contains(e.target) && e.target!==pill){drawer.style.display="none";}});

  // 下ボタン：交通規制トグル
  document.getElementById("bTraffic").addEventListener("click",e=>{e.preventDefault();toggleDrawer();},{passive:false});

  // 下ボタン：現在地（青丸トグル）
  document.getElementById("bMyLoc").addEventListener("click",()=>{
    if(!navigator.geolocation) return;
    if(window.myLocMarker){ window.myLocMarker.setMap(null); window.myLocMarker=null; return; }
    navigator.geolocation.getCurrentPosition(pos=>{
      const p={lat:pos.coords.latitude,lng:pos.coords.longitude};
      map.panTo(p); map.setZoom(16);
      window.myLocMarker=new google.maps.Marker({
        position:p, map, title:"現在地",
        icon:{path:google.maps.SymbolPath.CIRCLE, scale:6, fillColor:"#4285f4", fillOpacity:1, strokeColor:"#fff", strokeWeight:2},
        zIndex:4000
      });
    });
  });

  // ヘルプ
  document.getElementById("bHelp").addEventListener("click",()=>document.getElementById("helpModal").style.display="flex");
  document.getElementById("helpClose").addEventListener("click",()=>document.getElementById("helpModal").style.display="none");
  document.getElementById("helpModal").addEventListener("click",e=>{if(e.target.id==="helpModal") e.currentTarget.style.display="none";});
}

/* Google Maps callback */
window.initMap=initMap;
