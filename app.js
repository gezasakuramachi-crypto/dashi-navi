/* =========================================================================
   dashi-navi app.js
   今回の変更点：
   1) 右上バッジの2行表示と日時指定時の表示更新
   2) 下段メニュー「交通規制」ボタンで規制パネルの開閉トグル
   ※既存の地図・レイヤ・規制UI生成の処理はできるだけそのまま残しています
   ========================================================================= */

let map;
let trafficPanelOpen = false;

// 右上バッジDOM参照
const $regBadge     = () => document.getElementById('regBadge');
const $regBadgeL1   = () => document.getElementById('regBadgeL1');
const $regBadgeL2   = () => document.getElementById('regBadgeL2');

// 規制パネルDOM
const $trafficPanel = () => document.getElementById('trafficPanel');

// 日時指定の現在値（null=自動更新）
let currentRegulationLabel = null; // 例 "9/1 15:00-"

/** 右上バッジの表示を更新する */
function updateRegulationBadge() {
  $regBadgeL1().textContent = '交通規制';
  $regBadgeL2().textContent = currentRegulationLabel ?? '自動更新';
}

/** 規制パネルを開く/閉じる */
function setTrafficPanel(open) {
  trafficPanelOpen = !!open;
  $trafficPanel().style.display = trafficPanelOpen ? 'block' : 'none';
  $regBadge().setAttribute('aria-expanded', String(trafficPanelOpen));
}

/** 規制パネルのトグル（下段メニュー用） */
function toggleTrafficPanel() {
  setTrafficPanel(!trafficPanelOpen);
}

/** 外部（既存の日時選択UI）から呼ぶためのAPI：
 *  日時を指定したらこの関数を呼んでください。
 *  label には "9/1 15:00-" のような文字列を渡す。
 *  自動更新に戻す場合は null を渡す。
 */
window.applyRegulationDatetimeLabel = function (label /* string|null */) {
  currentRegulationLabel = (label && String(label).trim()) || null;
  updateRegulationBadge();
};

/* =========================
   初期化（Google Maps）
   ========================= */
window.initMap = function initMap() {
  // 既存の初期位置・オプションをそのままお使いください
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 35.965, lng: 140.647 }, // 例：鹿嶋周辺。お手元の値で上書き可
    zoom: 15,
    mapTypeControl: false,
    fullscreenControl: false,
    streetViewControl: false,
    clickableIcons: true,
    gestureHandling: 'greedy',
    disableDefaultUI: true,
    backgroundColor: '#000'
  });

  // --- 既存：レイヤ・KML・各種ボタンの初期化を続けてください ---
  // initLayers();
  // initTrafficUI();
  // etc...

  // バッジ初期表示
  updateRegulationBadge();

  // 右上バッジクリックでパネル開閉（従来仕様があるならそれを優先）
  $regBadge().addEventListener('click', () => toggleTrafficPanel());

  // 下段メニュー：山車は地図のみジャンプ（情報ウインドウは出さない想定。既存処理があればそちらを呼ぶ）
  document.getElementById('nav-dashi').addEventListener('click', () => {
    // 既存の「山車位置へ移動」関数をお持ちなら呼び出してください
    // 例：flyToDashi();  // 情報ウインドウは表示しない
    if (typeof flyToDashi === 'function') flyToDashi(/* {openInfo:false} */);
    // 万一パネルが開いていたら閉じる
    setTrafficPanel(false);
  });

  // 下段メニュー：交通規制 → 規制パネルのトグル
  document.getElementById('nav-traffic').addEventListener('click', () => {
    toggleTrafficPanel();
  });

  // 下段メニュー：現在地（既存の現在地表示関数があればそれを呼ぶ）
  document.getElementById('nav-mypos').addEventListener('click', () => {
    if (typeof jumpToMyLocation === 'function') {
      jumpToMyLocation();
    } else {
      // 簡易実装（ブラウザ現在地）
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(pos => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        map.panTo(p);
        map.setZoom(Math.max(map.getZoom(), 16));
        // 既存の現在地マーカーがあればそれを使う。なければ一時的に点を描くなど。
      });
    }
    setTrafficPanel(false);
  });

  // 下段：ヘルプ
  document.getElementById('nav-help').addEventListener('click', () => {
    // 既存のヘルプ表示へ
    if (typeof openHelp === 'function') openHelp();
    setTrafficPanel(false);
  });

  // 規制パネルの中身（既存UI）をここに描画するならこのタイミングで
  // renderTrafficPanelUI(document.getElementById('trafficPanelBody'));
};

/* ===========================================================
   既存コードと橋渡し：
   日時選択UIが「決定」されたタイミングで、
   window.applyRegulationDatetimeLabel('9/1 15:00-') を呼んでください。
   自動更新に戻すときは window.applyRegulationDatetimeLabel(null) を呼ぶ。
   =========================================================== */
