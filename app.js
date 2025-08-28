/* =========================================================
   鹿嶋のご神幸 山車現在地共有 - App Main
   - 走行エリアの青枠（塗りつぶしなし）
   - マップ表示制限（strictBounds）
   - 山車マーカーのインフォウィンドウ（状態/経路表示/経路図）
   - 左スタック（インフォ/トイレ/P）表示切替
   - 右上＆下段の交通規制UI（細幅パネル）
   ========================================================= */

let map;
let infoWindow;
let dashiMarker;
let viewportBounds;  // map-viewport.geojson から生成
let runAreaLayer;    // 走行エリア（青線）

// 疑似データ：山車位置＆更新時刻（本番は実データをポーリングで更新してください）
let dashiState = {
  position: { lat: 35.96565, lng: 140.6407 },
  lastUpdated: Date.now() - 120000, // 例：120秒前（=> 停止中）※実運用ではサーバー時刻で更新
};

// 交通規制スロット（例）— 本番はGeoJSON/KML読み込み側に連携してください。
const TRAFFIC_SLOTS = {
  "8/31": ["19:00-", "20:45-"],
  "9/1":  ["10:30-", "15:00-", "16:00-", "19:30-", "20:45-"],
  "9/2":  ["13:00-"]
};

// UI要素キャッシュ
const els = {};
function cacheEls(){
  els.trafficToggle = document.getElementById('trafficToggle');
  els.trafficPanel  = document.getElementById('trafficPanel');
  els.tpSlots       = document.getElementById('tpSlots');

  els.btnInfo   = document.getElementById('btnInfo');
  els.btnToilet = document.getElementById('btnToilet');
  els.btnParking= document.getElementById('btnParking');

  els.navDashi  = document.getElementById('navDashi');
  els.navTraffic= document.getElementById('navTraffic');
  els.navLocate = document.getElementById('navLocate');
  els.navHelp   = document.getElementById('navHelp');
}

/* ===================== Map Init ===================== */
window.initMap = async function initMap(){
  cacheEls();

  // 初期マップ（暫定中心）※ロード前の青背景回避のため高さはCSSで確保済み
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 35.965, lng: 140.641 },
    zoom: 15,
    mapTypeControl: false,
    fullscreenControl: false,
    streetViewControl: false,
    clickableIcons: true,
    gestureHandling: "greedy",
  });

  infoWindow = new google.maps.InfoWindow();

  // 表示制限と走行エリアのロード
  await Promise.all([
    applyViewportRestriction(),
    drawRunArea()
  ]);

  // ビューポートにフィットした後、1段階だけズームイン
  if (viewportBounds){
    map.fitBounds(viewportBounds);
    map.addListener('idle', () => {
      // 一度だけ適用
      if (!map.__zoomedOnce) {
        map.__zoomedOnce = true;
        map.setZoom(map.getZoom() + 1);
      }
    });
  }

  // 山車マーカー
  placeDashiMarker();

  // 左スタック・下部ナビ・交通規制UI
  wireLeftStack();
  wireBottomNav();
  wireTrafficUI();

  // マップ外タップで InfoWindow を閉じる
  map.addListener("click", () => infoWindow.close());
};

/* ===================== Viewport Restriction ===================== */
async function applyViewportRestriction(){
  try{
    const res = await fetch('data/map-viewport.geojson', { cache: 'no-store' });
    const gj  = await res.json();

    // GeoJSON から bounds を算出（Polygon / MultiPolygon をサポート）
    const bounds = new google.maps.LatLngBounds();
    const pushCoord = c => bounds.extend(new google.maps.LatLng(c[1], c[0]));

    const eachPoly = (coords) => {
      // coords: [ [ [lng,lat], [lng,lat], ... ] , ... (holes) ]
      coords[0].forEach(pushCoord); // 外輪だけで bounds 取得
    };

    gj.features.forEach(f => {
      const g = f.geometry;
      if (g.type === 'Polygon') eachPoly(g.coordinates);
      else if (g.type === 'MultiPolygon') g.coordinates.forEach(eachPoly);
    });

    viewportBounds = bounds;
    map.setOptions({
      restriction: { latLngBounds: bounds, strictBounds: true },
      minZoom: 12
    });
  }catch(e){
    console.warn('map-viewport.geojson の読込に失敗:', e);
  }
}

/* ===================== Run Area (blue stroke) ===================== */
async function drawRunArea(){
  try{
    const res = await fetch('data/run-area.geojson', { cache: 'no-store' });
    const gj  = await res.json();
    if (runAreaLayer) runAreaLayer.setMap(null);
    runAreaLayer = map.data;
    runAreaLayer.addGeoJson(gj);

    runAreaLayer.setStyle({
      strokeColor: '#1976d2',
      strokeWeight: 3,
      strokeOpacity: 1,
      fillOpacity: 0.0
    });
  }catch(e){
    console.warn('run-area.geojson の読込に失敗:', e);
  }
}

/* ===================== Dashi Marker & Info ===================== */
function placeDashiMarker(){
  if (dashiMarker) dashiMarker.setMap(null);

  dashiMarker = new google.maps.Marker({
    position: dashiState.position,
    map,
    icon: {
      url: 'mark/sakura.png',
      scaledSize: new google.maps.Size(40, 40)
    },
    title: '桜町区',
    zIndex: 10
  });

  dashiMarker.addListener('click', () => openDashiInfo());

  // 下メニューの「山車」でフォーカス＆Infowindowを開く
  els.navDashi.addEventListener('click', () => {
    map.panTo(dashiMarker.getPosition());
    map.setZoom(Math.max(map.getZoom(), 17));
    openDashiInfo();
  });
}

function openDashiInfo(){
  const now = Date.now();
  const status = (now - dashiState.lastUpdated <= 90000) ? '更新中' : '停止中';

  const routeUrl = `https://www.google.com/maps/dir/?api=1&destination=${dashiMarker.getPosition().lat()},${dashiMarker.getPosition().lng()}&travelmode=walking`;

  // 経路図の自動切替（8/31 → 9/1 → 9/2）
  const today = new Date();
  const m = today.getMonth() + 1;
  const d = today.getDate();
  let routePage = '';
  if (m === 8 && d <= 31) {
    routePage = 'https://sites.google.com/view/sakuramachiku/%E4%BB%A4%E5%92%8C%E5%B9%B4%E7%A5%9E%E5%B9%B8%E7%A5%AD/8%E6%9C%8831%E6%97%A5%E5%89%8D%E5%A4%9C%E7%A5%AD%E7%B5%8C%E8%B7%AF%E5%9B%B3';
  } else if (m === 9 && d === 1) {
    routePage = 'https://sites.google.com/view/sakuramachiku/%E4%BB%A4%E5%92%8C%E5%B9%B4%E7%A5%9E%E5%B9%B8%E7%A5%AD/9%E6%9C%881%E6%97%A5-%E7%A5%9E%E5%B9%B8%E7%A5%AD%E7%B5%8C%E8%B7%AF%E5%9B%B3';
  } else if (m === 9 && d >= 2) {
    routePage = 'https://sites.google.com/view/sakuramachiku/%E4%BB%A4%E5%92%8C%E5%B9%B4%E7%A5%9E%E5%B9%B8%E7%A5%AD/9%E6%9C%882%E6%97%A5-%E7%A5%9E%E5%B9%B8%E7%A5%AD%E7%B5%8C%E8%B7%AF%E5%9B%B3';
  } else {
    // デフォルトは 9/1 ページに
    routePage = 'https://sites.google.com/view/sakuramachiku/%E4%BB%A4%E5%92%8C%E5%B9%B4%E7%A5%9E%E5%B9%B8%E7%A5%AD/9%E6%9C%881%E6%97%A5-%E7%A5%9E%E5%B9%B8%E7%A5%AD%E7%B5%8C%E8%B7%AF%E5%9B%B3';
  }

  const html = `
    <div style="min-width:220px; max-width:260px;">
      <div style="font-size:18px; font-weight:700; margin-bottom:6px;">桜町区</div>
      <div style="font-size:14px; color:#555; margin-bottom:10px;">${status}</div>

      <a href="${routeUrl}" target="_blank" rel="noopener" style="
        display:flex; align-items:center; gap:8px;
        text-decoration:none; font-weight:700; color:#1967d2;
        background:#fff; border:1px solid #e5e8ef; padding:10px 12px;
        border-radius:12px; margin-bottom:8px;">
        <span style="display:inline-block; width:9px; height:9px; background:#2a73e8; border-radius:50%;"></span>
        経路表示
      </a>

      <a href="${routePage}" target="_blank" rel="noopener" style="
        display:flex; align-items:center; gap:8px;
        text-decoration:none; font-weight:700; color:#1967d2;
        background:#fff; border:1px solid #e5e8ef; padding:10px 12px;
        border-radius:12px;">
        <span style="display:inline-block; width:9px; height:9px; background:#e53935; border-radius:50%;"></span>
        経路図
      </a>
    </div>
  `;

  infoWindow.setContent(html);
  infoWindow.open({ map, anchor: dashiMarker, shouldFocus: false });
}

/* ===================== Left Stack (layer toggles) ===================== */
function wireLeftStack(){
  // デモ：インフォ/トイレ/Pは「見た目のON/OFF」だけトグル。
  // 実データのMarker群がある場合は、配列.forEach(m => m.setMap(on?map:null)) に差し替えてください。
  const toggleBtn = (btn) => {
    btn.classList.toggle('off');
    // ここで対象レイヤーの表示切替を行う
  };
  els.btnInfo.addEventListener('click', () => toggleBtn(els.btnInfo));
  els.btnToilet.addEventListener('click', () => toggleBtn(els.btnToilet));
  els.btnParking.addEventListener('click', () => toggleBtn(els.btnParking));
}

/* ===================== Bottom Nav ===================== */
function wireBottomNav(){
  // 交通規制（右上パネルのトグルと同じ動作）
  els.navTraffic.addEventListener('click', toggleTrafficPanel);

  // 現在地
  els.navLocate.addEventListener('click', () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      map.panTo(p);
      map.setZoom(Math.max(17, map.getZoom()));
      new google.maps.Marker({
        map, position: p,
        icon: { url:'mark/my_location.png', scaledSize: new google.maps.Size(28,28) },
        zIndex: 12
      });
    });
  });

  // ヘルプ
  els.navHelp.addEventListener('click', () => {
    alert('ヘルプ：使い方の説明をここに表示（後で差し替え可能）');
  });
}

/* ===================== Traffic UI ===================== */
function wireTrafficUI(){
  // 右上トグル
  els.trafficToggle.addEventListener('click', toggleTrafficPanel);

  // 日付ボタン動的に active を付ける
  [...els.trafficPanel.querySelectorAll('.tp-btn')].forEach(btn => {
    btn.addEventListener('click', () => {
      els.trafficPanel.querySelectorAll('.tp-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTrafficSlots(btn.dataset.date);
      // 右上丸ボタンのラベルも日時指定中は「9/1 15:00-」のように書き換えたい場合は、
      // renderTrafficSlots 内で選択時に els.trafficToggle.textContent = '9/1 15:00-' などに変更してください。
    });
  });
}

function toggleTrafficPanel(){
  const showing = els.trafficPanel.classList.toggle('show');
  if (showing) {
    // 初期は当日を自動選択（なければ 9/1）
    const today = new Date();
    const m = today.getMonth() + 1;
    const d = today.getDate();
    let key = (m === 8 && d === 31) ? '8/31' : (m === 9 && (d === 1 || d === 2)) ? `9/${d}` : '9/1';
    const target = [...els.trafficPanel.querySelectorAll('.tp-btn')].find(b => b.dataset.date === key) || els.trafficPanel.querySelector('.tp-btn');
    target.click();
  }
}

function renderTrafficSlots(dateKey){
  const slots = TRAFFIC_SLOTS[dateKey] || [];
  els.tpSlots.innerHTML = '';
  slots.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'tp-btn';
    btn.textContent = t;
    btn.addEventListener('click', () => {
      // ここで実際の規制レイヤー切替処理を呼び出す
      els.tpSlots.querySelectorAll('.tp-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // 右上ボタンの表示を日時にする
      try { els.trafficToggle.textContent = `${dateKey} ${t}`; } catch {}
    });
    els.tpSlots.appendChild(btn);
  });
}
