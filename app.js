/* ===============================
 *  Dashi-Navi App
 * =============================== */

const SOURCES = {
  GEOJSON: {
    RUN_AREA:  'https://gezasakuramachi-crypto.github.io/dashi-navi/data/run-area.geojson',
    VIEWPORT:  'https://gezasakuramachi-crypto.github.io/dashi-navi/data/map-viewport.geojson',
  },
};

let map, infoWindow;
let layers = {
  info: null,
  toilet: null,
  parking: null,
  runArea: null,
};
let markers = {
  dashi: null,
};
let mapRestrictionBounds = null;

/** iPhone のバー高さで 100vh がズレるのを防ぐ（CSS は 100dvh を使用） */
function fixIOSVh() {
  // いまは 100dvh を使っているため JS 側の補正は不要。将来用に残す。
}

/** 初期化：ページ読込時に必ず呼ばれる（HTML の callback） */
window.initMap = async function initMap(){
  // 初期中心（暫定）
  const center = { lat: 35.9638, lng: 140.6392 };

  map = new google.maps.Map(document.getElementById('map'), {
    center,
    zoom: 16,
    mapTypeControl: false,
    fullscreenControl: false,
    streetViewControl: false,
    clickableIcons: true,
    gestureHandling: 'greedy',
  });

  infoWindow = new google.maps.InfoWindow({ maxWidth: 300 });

  // 地図が動作可能になったらマスクを外す
  map.addListener('idle', () => {
    document.getElementById('map-mask')?.classList.add('hidden');
  });

  // 表示可能な最大エリア制限をロード
  await applyViewportRestriction();

  // 走行エリア（外枠のみ青・塗り無し）を常時表示
  await drawRunArea();

  // 山車マーカー（仮：中心に配置）。あなたの位置トークン取得処理で更新する。
  setUpDashiMarker(center);

  // 左レールと下メニューのイベント
  bindUI();

  // 初期ズーム：ご指定「もう1段階拡大」
  map.setZoom(Math.min(map.getZoom() + 1, 20));
};

/* ---------- 走行エリア（外枠のみ青） ---------- */
async function drawRunArea(){
  try{
    const res = await fetch(SOURCES.GEOJSON.RUN_AREA);
    const gj  = await res.json();

    // GeoJSON からポリライン/ポリゴンを作成
    // 線だけ出したいので、Polygon も stroke のみ・fill なしに
    layers.runArea = map.data;
    layers.runArea.setStyle({
      strokeColor: '#1976d2',
      strokeOpacity: 1,
      strokeWeight: 3,
      fillOpacity: 0
    });
    layers.runArea.addGeoJson(gj);
  }catch(e){
    console.warn('run-area geojson 読み込み失敗', e);
  }
}

/* ---------- 最大表示エリアの制限 ---------- */
async function applyViewportRestriction(){
  try{
    const res = await fetch(SOURCES.GEOJSON.VIEWPORT);
    const gj  = await res.json();

    // GeoJSON (Polygon または MultiPolygon) から Bounds を作る
    const bounds = new google.maps.LatLngBounds();
    const addCoord = (coord) => bounds.extend(new google.maps.LatLng(coord[1], coord[0]));
    const walk = (geom) => {
      if(!geom) return;
      if(geom.type === 'Polygon'){
        geom.coordinates.flat(1).forEach(addCoord);
      }else if(geom.type === 'MultiPolygon'){
        geom.coordinates.flat(2).forEach(addCoord);
      }else if(geom.type === 'Feature'){
        walk(geom.geometry);
      }else if(geom.type === 'FeatureCollection'){
        geom.features.forEach(f => walk(f));
      }
    };
    walk(gj);

    map.fitBounds(bounds);
    mapRestrictionBounds = bounds;

    // 制限（外は見えない・ズームアウトできない）
    map.setOptions({
      restriction: {
        latLngBounds: bounds,
        strictBounds: true
      },
      minZoom: map.getZoom() - 1  // fitBounds より外へズームアウト不可に寄せる
    });

    // ユーザーがドラッグで境界外に出ようとしたら跳ね返す
    map.addListener('dragend', () => {
      if(!mapRestrictionBounds.contains(map.getCenter())){
        map.panTo(clampToBounds(map.getCenter(), mapRestrictionBounds));
      }
    });

  }catch(e){
    console.warn('viewport geojson 読み込み失敗', e);
  }
}

/* 点を Bounds 内にクランプ */
function clampToBounds(latlng, bounds){
  const lat = Math.min(Math.max(latlng.lat(), bounds.getSouthWest().lat()), bounds.getNorthEast().lat());
  const lng = Math.min(Math.max(latlng.lng(), bounds.getSouthWest().lng()), bounds.getNorthEast().lng());
  return new google.maps.LatLng(lat, lng);
}

/* ---------- 山車マーカーと情報ウインドウ ---------- */
function setUpDashiMarker(pos){
  if(markers.dashi){
    markers.dashi.setMap(null);
  }
  markers.dashi = new google.maps.Marker({
    position: pos,
    map,
    icon: {
      url: 'mark/sakura.png',
      scaledSize: new google.maps.Size(40,40)
    },
    title: '桜町区'
  });

  markers.dashi.addListener('click', () => {
    openDashiInfo(markers.dashi.getPosition());
  });
}

function isStale(lastUpdatedMs){
  // 「90秒以上届かなければ停止中」
  const now = Date.now();
  return (now - lastUpdatedMs) >= 90 * 1000;
}

function openDashiInfo(latlng){
  // 実際の更新時刻はあなたの位置トークンの応答から差し込んでください
  // ここでは仮に「停止中」にしておく
  const lastMs = Date.now() - 120000; // 仮: 2分前
  const status = isStale(lastMs) ? '停止中' : '更新中';

  const routeUrl = `https://www.google.com/maps/dir/?api=1&destination=${latlng.lat()},${latlng.lng()}&travelmode=walking`;

  // 経路図リンク：日付ごとに自動分岐
  const routeMapUrl = pickRouteMapUrlByDate(new Date());

  const html = `
    <div class="mini-infowin">
      <div class="row" style="font-weight:700;font-size:18px;">桜町区</div>
      <div class="row" style="color:#6b7280;">${status}</div>
      <div class="row">
        <a class="pill" href="${routeUrl}" target="_blank" rel="noopener">
          <span><span class="dot"></span>経路表示</span>
          <span>開く ›</span>
        </a>
      </div>
      <div class="row">
        <a class="pill" href="${routeMapUrl}" target="_blank" rel="noopener">
          <span><span class="dot" style="background:#d83a3a"></span>経路図</span>
          <span>開く ›</span>
        </a>
      </div>
    </div>
  `;
  infoWindow.setContent(html);
  infoWindow.setPosition(latlng);
  infoWindow.open(map);

  // 画面外タップで閉じる
  const closeOnTap = map.addListener('click', () => {
    infoWindow.close();
    google.maps.event.removeListener(closeOnTap);
  });
}

function pickRouteMapUrlByDate(d){
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  // 8/31, 9/1, 9/2 の分岐（URL はユーザー提供済み）
  if (m === 8 && day <= 31){
    return 'https://sites.google.com/view/sakuramachiku/%E4%BB%A4%E5%92%8C%E5%B9%B4%E7%A5%9E%E5%B9%B8%E7%A5%AD/8%E6%9C%8831%E6%97%A5%E5%89%8D%E5%A4%9C%E7%A5%AD%E7%B5%8C%E8%B7%AF%E5%9B%B3';
  }
  if (m === 9 && day === 1){
    return 'https://sites.google.com/view/sakuramachiku/%E4%BB%A4%E5%92%8C%E5%B9%B4%E7%A5%9E%E5%B9%B8%E7%A5%AD/9%E6%9C%881%E6%97%A5-%E7%A5%9E%E5%B9%B8%E7%A5%AD%E7%B5%8C%E8%B7%AF%E5%9B%B3';
  }
  // 既定：9/2
  return 'https://sites.google.com/view/sakuramachiku/%E4%BB%A4%E5%92%8C%E5%B9%B4%E7%A5%9E%E5%B9%B8%E7%A5%AD/9%E6%9C%882%E6%97%A5-%E7%A5%9E%E5%B9%B8%E7%A5%AD%E7%B5%8C%E8%B7%AF%E5%9B%B3';
}

/* ---------- UI バインド ---------- */
function bindUI(){
  // 右上 交通規制 FAB → 既存の交通規制 UI を開く（ここではフックだけ）
  document.getElementById('trafficFab').addEventListener('click', () => {
    // app 内の既存関数を呼んでパネルを開く想定
    openTrafficPanel();
  });

  // 左レール：レイヤ可視切替（ここではダミーのトグル）
  document.getElementById('btnInfo').addEventListener('click', ()=>toggleLayer('info'));
  document.getElementById('btnToilet').addEventListener('click',()=>toggleLayer('toilet'));
  document.getElementById('btnParking').addEventListener('click',()=>toggleLayer('parking'));

  // 下メニュー
  document.getElementById('mDashi').addEventListener('click', ()=>{
    // 山車の位置にズーム＆情報
    if(markers.dashi){
      map.panTo(markers.dashi.getPosition());
      map.setZoom(Math.max(map.getZoom(), 18));
      openDashiInfo(markers.dashi.getPosition());
    }
  });
  document.getElementById('mTraffic').addEventListener('click', ()=>openTrafficPanel());
  document.getElementById('mLocate').addEventListener('click', locateMe);
  document.getElementById('mHelp').addEventListener('click', ()=>alert('ヘルプは準備中です'));
}

/* 交通規制パネルを開くダミー（実装済みの関数に差し替えてOK） */
function openTrafficPanel(){
  // ここに既存の交通規制 UI を呼び出す処理を接続してください
  // 例: TrafficUI.open();
  console.log('交通規制パネルを開く');
}

/* レイヤ可視切替のダミー */
function toggleLayer(name){
  // あなたの既存レイヤ管理に合わせてください
  console.log('toggle layer:', name);
}

/* 現在地に移動 */
function locateMe(){
  if(!navigator.geolocation){
    alert('位置情報が利用できません');
    return;
  }
  navigator.geolocation.getCurrentPosition((pos)=>{
    const ll = {lat: pos.coords.latitude, lng: pos.coords.longitude};
    map.panTo(ll);
    map.setZoom(Math.max(map.getZoom(), 17));
  }, (err)=>{
    console.warn(err);
    alert('現在地を取得できませんでした');
  }, { enableHighAccuracy:true, timeout:10000, maximumAge:5000 });
}
