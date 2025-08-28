/* app.js - dashi-navi 改良版
 * - 真っ黒問題解消（Flexレイアウト）
 * - 左アイコン：インフォ/トイレ/駐車場 のみ
 * - 下段フッター：アイコン＋ラベル（山車/交通規制/現在地/ヘルプ）
 * - 右上「交通規制」 → 幅スリムなパネル
 * - 走行エリア(run-area.geojson)：青枠のみ・塗りつぶしなし
 * - 最大表示エリア(map-viewport.geojson)：外に出ないよう MaxBounds
 * - 初期表示は MaxBounds から さらに 1段階ズームイン
 */

let map, dataLayerViewport, dataLayerRunArea;
let infoLayer = null, wcLayer = null, parkLayer = null; // 既存レイヤーがない場合はnullのままでも安全に
let dashiMarker = null;
let dashiInfoWindow = null;
let lastDashiTs = null; // 最終更新時刻（ミリ秒）
const SCRIM = () => document.getElementById('scrim');

// GeoJSON の場所（ユーザ様がご用意）
const GEO = {
  viewport: 'data/map-viewport.geojson',   // 最大表示範囲
  runArea:  'data/run-area.geojson',       // 山車曳き廻しエリア（青枠・塗りなし）
};

// 交通規制定数（サンプル）
const TRAFFIC = {
  '9/1': ['10:30-', '15:00-', '16:00-', '19:30-', '20:45-'],
  '9/2': ['11:30-', '16:30-', '19:00-', '19:30-', '22:00-']
};

// 経路図URL（ユーザ様指定）
const ROUTE_MAP_URL = (date) => {
  // 8/31, 9/1, 9/2 のURL分岐
  if (date.getMonth() === 7 && date.getDate() === 31) {
    return 'https://sites.google.com/view/sakuramachiku/%E4%BB%A4%E5%92%8C%E5%B9%B4%E7%A5%9E%E5%B9%B8%E7%A5%AD/8%E6%9C%8831%E6%97%A5%E5%89%8D%E5%A4%9C%E7%A5%AD%E7%B5%8C%E8%B7%AF%E5%9B%B3';
  }
  if (date.getMonth() === 8 && date.getDate() === 1) {
    return 'https://sites.google.com/view/sakuramachiku/%E4%BB%A4%E5%92%8C%E5%B9%B4%E7%A5%9E%E5%B9%B8%E7%A5%AD/9%E6%9C%881%E6%97%A5-%E7%A5%9E%E5%B9%B8%E7%A5%AD%E7%B5%8C%E8%B7%AF%E5%9B%B3';
  }
  // 9/2
  return 'https://sites.google.com/view/sakuramachiku/%E4%BB%A4%E5%92%8C%E5%B9%B4%E7%A5%9E%E5%B9%B8%E7%A5%AD/9%E6%9C%882%E6%97%A5-%E7%A5%9E%E5%B9%B8%E7%A5%AD%E7%B5%8C%E8%B7%AF%E5%9B%B3';
};

// =====================
// 初期化
// =====================
window.initMap = async function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    mapId: 'dashi-map',
    center: { lat: 35.966, lng: 140.644 },
    zoom: 15,
    streetViewControl: false,
    fullscreenControl: false,
    mapTypeControl: false,
    gestureHandling: 'greedy',
    clickableIcons: true,
  });

  // 最大表示範囲（外へ出ない）
  await loadMaxViewport();

  // 走行エリア：青枠のみ
  await loadRunArea();

  // 山車マーカー（位置はダミー。実機ではトラッカーの座標を反映）
  dashiMarker = new google.maps.Marker({
    position: { lat: 35.966, lng: 140.64 },
    map,
    icon: {
      url: 'mark/sakura.png',
      scaledSize: new google.maps.Size(44,44)
    },
    title: '桜町区',
    zIndex: 50
  });

  // 情報ウィンドウ（コンパクト）
  dashiInfoWindow = new google.maps.InfoWindow({
    content: buildDashiCard('停止中') // 初期は停止中
  });

  dashiMarker.addListener('click', () => {
    dashiInfoWindow.setContent(buildDashiCard(getDashiState()));
    dashiInfoWindow.open({ anchor: dashiMarker, map });
    showScrim();
  });

  // ====== UIイベント ======
  // 右上：交通規制
  document.getElementById('btnReg').addEventListener('click', () => {
    toggleRegPanel();
  });

  // 左：表示切替（存在しない場合でも安全に）
  document.getElementById('toggleInfo').addEventListener('click', () => toggleLayer('info'));
  document.getElementById('toggleWc').addEventListener('click', () => toggleLayer('wc'));
  document.getElementById('togglePark').addEventListener('click', () => toggleLayer('park'));

  // 下段メニュー
  document.getElementById('menuDashi').addEventListener('click', () => {
    // 山車のカードを表示
    dashiInfoWindow.setContent(buildDashiCard(getDashiState()));
    dashiInfoWindow.open({ anchor: dashiMarker, map });
    showScrim();
    map.panTo(dashiMarker.getPosition());
  });
  document.getElementById('menuReg').addEventListener('click', () => toggleRegPanel(true));
  document.getElementById('menuLoc').addEventListener('click', () => locateMe());
  document.getElementById('menuHelp').addEventListener('click', () => {
    alert('ヘルプは準備中です。');
  });

  // 画面タップで各UIを閉じる
  document.getElementById('scrim').addEventListener('click', closeAllFloat);

  // 交通規制パネルのボタンクリック（デリゲーション）
  document.getElementById('regPanel').addEventListener('click', (ev) => {
    const b = ev.target.closest('.chip');
    if(!b) return;
    const day = b.getAttribute('data-day');
    renderTrafficSlots(day);
  });

  // 初期：当日を仮選択してスロット描画
  renderTrafficSlots('9/1');
};


// =====================
// GeoJSON ローダー
// =====================
async function loadMaxViewport(){
  dataLayerViewport = new google.maps.Data({ map:null });
  await new Promise((resolve) => {
    dataLayerViewport.loadGeoJson(GEO.viewport, null, () => resolve());
  });

  // Bounds算出
  const bounds = new google.maps.LatLngBounds();
  dataLayerViewport.forEach(f => {
    processGeometry(f.getGeometry(), (latLng) => bounds.extend(latLng));
  });

  // 初期表示：MaxBoundsに合わせてから さらに1段階ズームイン
  map.fitBounds(bounds);
  google.maps.event.addListenerOnce(map, 'idle', () => {
    map.setZoom(map.getZoom() + 1);
  });

  // MaxBounds拘束
  const maxBounds = bounds;
  map.addListener('dragend', () => clampToBounds(maxBounds));
  map.addListener('zoom_changed', () => clampToBounds(maxBounds));
}
function clampToBounds(bounds){
  const c = map.getCenter();
  if(bounds.contains(c)) return;
  // はみ出たら中心を戻す
  const clamped = new google.maps.LatLng(
    Math.min(Math.max(c.lat(), bounds.getSouthWest().lat()), bounds.getNorthEast().lat()),
    Math.min(Math.max(c.lng(), bounds.getSouthWest().lng()), bounds.getNorthEast().lng())
  );
  map.setCenter(clamped);
}

async function loadRunArea(){
  dataLayerRunArea = new google.maps.Data({ map });
  dataLayerRunArea.setStyle({
    strokeColor: '#2f7cf6',
    strokeWeight: 3,
    strokeOpacity: 1,
    fillOpacity: 0     // 塗りなし
  });
  await new Promise((resolve) => {
    dataLayerRunArea.loadGeoJson(GEO.runArea, null, () => resolve());
  });
}

// DataGeometry の各座標を処理
function processGeometry(geom, cb){
  const type = geom.getType();
  if(type === 'Point'){
    cb(geom.get());
  }else if(type === 'LineString' || type === 'LinearRing'){
    geom.getArray().forEach(ll => cb(ll));
  }else if(type === 'Polygon' || type === 'MultiLineString'){
    geom.getArray().forEach(g => processGeometry(g, cb));
  }else if(type === 'MultiPolygon'){
    geom.getArray().forEach(p => processGeometry(p, cb));
  }else if(type === 'GeometryCollection'){
    geom.getArray().forEach(g => processGeometry(g, cb));
  }
}


// =====================
// 山車カード
// =====================
function buildDashiCard(stateText){
  const wrap = document.createElement('div');
  wrap.className = 'dashi-card';
  wrap.innerHTML = `
    <div class="dashi-title">桜町区</div>
    <div class="dashi-state">${stateText}</div>
    <a class="pill" href="${buildGoogleNavUrl()}" target="_blank" rel="noopener">
      <span class="dot"></span>経路表示
    </a>
    <a class="pill" href="${ROUTE_MAP_URL(new Date())}" target="_blank" rel="noopener">
      <span class="dot" style="background:#ff5a5f"></span>経路図
    </a>
  `;
  return wrap;
}

function buildGoogleNavUrl(){
  // 現在地→山車まで（Googleマップアプリ/ブラウザで開く）
  const p = dashiMarker.getPosition();
  return `https://www.google.com/maps/dir/?api=1&destination=${p.lat()},${p.lng()}&travelmode=walking`;
}

function getDashiState(){
  if(!lastDashiTs) return '停止中';
  const diff = Date.now() - lastDashiTs;
  return diff > 90*1000 ? '停止中' : '更新中';
}

// =====================
// 交通規制 UI
// =====================
function toggleRegPanel(forceOpen){
  const panel = document.getElementById('regPanel');
  const open = forceOpen ?? !panel.classList.contains('open');
  panel.classList.toggle('open', open);
  if(open) showScrim(); else hideScrim();
}

function renderTrafficSlots(dayLabel){
  const wrap = document.getElementById('slotWrap');
  wrap.innerHTML = '';
  const slots = TRAFFIC[dayLabel] || [];
  slots.forEach(t => {
    const b = document.createElement('button');
    b.className = 'chip';
    b.textContent = t;
    b.addEventListener('click', () => {
      // ここで t（時刻帯）に応じたレイヤー表示に切り替える想定
      // 本実装ではダミー：クリックしたら閉じるのみ
      toggleRegPanel(false);
    });
    wrap.appendChild(b);
  });
}

// =====================
// 表示切替（安全な no-op 実装）
/* 実データのレイヤーが別途ある場合は、ここに ON/OFF を実装。
 * 今は存在しない可能性もあるため null 安全で動く仕組みにしている。
 */
function toggleLayer(kind){
  const target = ({
    info: infoLayer,
    wc:   wcLayer,
    park: parkLayer
  })[kind];
  if(!target){
    // データ未連携でも落ちないようにダミー通知
    console.log(`[toggleLayer] ${kind} layer not bound yet`);
    return;
  }
  const v = target.getMap() ? null : map;
  target.setMap(v);
}

// =====================
// 現在地
// =====================
function locateMe(){
  if(!navigator.geolocation){
    alert('位置情報が利用できません'); return;
  }
  navigator.geolocation.getCurrentPosition((pos)=>{
    const me = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    map.panTo(me);
    map.setZoom(Math.max(map.getZoom(), 17));
    new google.maps.Marker({
      position: me, map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 6, fillColor:'#3478f6', fillOpacity:1,
        strokeColor:'#fff', strokeWeight:2
      },
      zIndex: 100
    });
  }, ()=>{
    alert('現在地を取得できませんでした');
  }, { enableHighAccuracy:true, timeout:8000 });
}

// =====================
// 閉じる系
// =====================
function closeAllFloat(){
  // 交通規制パネル
  document.getElementById('regPanel').classList.remove('open');
  // InfoWindow
  if(dashiInfoWindow) dashiInfoWindow.close();
  hideScrim();
}
function showScrim(){ SCRIM().classList.add('show'); }
function hideScrim(){ SCRIM().classList.remove('show'); }
