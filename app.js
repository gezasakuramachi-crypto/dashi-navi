/* ==========================================================================

  鹿島神宮 神幸祭 山車ナビ  app.js
  - ご指定の変更点をすべて実装
    ① 右上「交通規制」ヘッダー：初期は「自動更新」。日時指定時はそのラベル表示
    ② 下段「山車」…山車位置に移動するだけ（情報ウインドウは出さない）
    ③ 下段「交通規制」…右上メニューをトグル開閉（再タップで閉じる）
    ④ 下段「現在地」…青い現在地ドット＋精度円を表示、再タップで現在地へ移動
    ⑤ ヘッダーのタイトル画像…縦は下段アイコン程度（index.html側CSSで制御）
    ⑥ iPhoneの黒余白…特別対応しない（安全マージン＆高さは厳密化済み）

  - 既存データ/レイヤーとの互換性をなるべく維持するための注意
    * 交通規制レイヤー等、既存の読み込みロジックが別にある場合はそのまま併用OK
    * 本ファイル側ではレイヤーのON/OFFトグルのフックのみを用意
    * 「日時指定」UIは右上 #trafficPanel 内に置いてください。
      → 手動指定を行ったら、下記のカスタムイベントを投げるとヘッダーが切り替わります：
         document.dispatchEvent(new CustomEvent('traffic:selectionChanged', {
           detail: { label: '9/1 15:00〜' }   // 手動指定ラベル
         }));
       自動更新へ戻す場合：
         document.dispatchEvent(new CustomEvent('traffic:selectionChanged')); // detailなし

=========================================================================== */

(() => {
  "use strict";

  // --------- DOM参照 ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const elMap          = $("#map");
  const elTrafficHeader= $("#trafficHeader");
  const elTrafficSub   = $("#trafficSub");
  const elTrafficPanel = $("#trafficPanel");
  const elLeftRail     = $("#leftRail");

  const btnInfo        = $("#btnInfo");
  const btnToilet      = $("#btnToilet");
  const btnParking     = $("#btnParking");

  const navDashi       = $("#navDashi");
  const navTraffic     = $("#navTraffic");
  const navLocate      = $("#navLocate");
  const navHelp        = $("#navHelp");

  const helpOverlay    = $("#helpOverlay");
  const helpClose      = $("#helpClose");

  const toast          = $("#toast");

  // --------- マップ / マーカー ----------
  /** @type {google.maps.Map} */
  let map = null;

  // 山車（位置情報）のマーカーと情報ウインドウ
  /** @type {google.maps.Marker|null} */
  let dashiMarker = null;
  /** @type {google.maps.InfoWindow|null} */
  let dashiInfo = null;

  // 現在地表示
  /** @type {google.maps.Marker|null} */
  let meMarker = null;
  /** @type {google.maps.Circle|null} */
  let meAccuracy = null;
  let geoWatchId = null;

  // 交通規制ヘッダーの状態
  const trafficHeaderState = {
    mode: "auto",   // "auto" | "manual"
    label: ""       // 例 "9/1 15:00〜"
  };

  // 山車位置の最終更新時刻（ms）。90秒以上更新が無ければ「停止中」、さもなくば「更新中」
  let dashiLastTs = 0;

  // 山車の初期座標（鹿島神宮周辺：必要に応じて調整）
  const DEFAULT_CENTER = { lat: 35.9660, lng: 140.6420 };
  const DEFAULT_ZOOM   = 16;

  // 経路図URL（ご指定の3本）
  const ROUTE_MAP_URLS = {
    "08-31": "https://sites.google.com/view/sakuramachiku/%E4%BB%A4%E5%92%8C%E5%B9%B4%E7%A5%9E%E5%B9%B8%E7%A5%AD/8%E6%9C%8831%E6%97%A5%E5%89%8D%E5%A4%9C%E7%A5%AD%E7%B5%8C%E8%B7%AF%E5%9B%B3",
    "09-01": "https://sites.google.com/view/sakuramachiku/%E4%BB%A4%E5%92%8C%E5%B9%B4%E7%A5%9E%E5%B9%B8%E7%A5%AD/9%E6%9C%881%E6%97%A5-%E7%A5%9E%E5%B9%B8%E7%A5%AD%E7%B5%8C%E8%B7%AF%E5%9B%B3",
    "09-02": "https://sites.google.com/view/sakuramachiku/%E4%BB%A4%E5%92%8C%E5%B9%B4%E7%A5%9E%E5%B9%B8%E7%A5%AD/9%E6%9C%882%E6%97%A5-%E7%A5%9E%E5%B9%B8%E7%A5%AD%E7%B5%8C%E8%B7%AF%E5%9B%B3"
  };

  // 交通規制のレイヤー参照（既存読み込みがある場合にフック）
  const layers = {
    info:  null, // ここに既存のインフォ用レイヤーを割り当ててもOK（KML, DataLayer 等）
    toilet:null,
    parking:null
  };

  // --------- 初期化（Google Maps callback） ----------
  window.initMap = function initMap(){
    // Map生成
    map = new google.maps.Map(elMap, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      clickableIcons: true,
      gestureHandling: "greedy",
      disableDefaultUI: false
    });

    // 山車マーカー
    dashiMarker = new google.maps.Marker({
      position: DEFAULT_CENTER,
      map,
      title: "桜町区",
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#c2185b",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2
      },
      zIndex: 10
    });

    dashiInfo = new google.maps.InfoWindow({ content: buildDashiInfoContent() });

    // 山車マーカータップ時のみ情報ウインドウを開く（ボトムの「山車」では開かない）
    dashiMarker.addListener("click", () => {
      dashiInfo.setContent( buildDashiInfoContent() );
      dashiInfo.open({ anchor: dashiMarker, map, shouldFocus: false });
    });

    // ====== イベントハンドラ ======
    // 左レール（インフォ/トイレ/パーキング）…クリックでON/OFF（フックのみ）
    btnInfo?.addEventListener("click", () => toggleLayer("info"));
    btnToilet?.addEventListener("click", () => toggleLayer("toilet"));
    btnParking?.addEventListener("click", () => toggleLayer("parking"));

    // 下段：山車 → 山車の位置へ移動（情報ウインドウは出さない）
    navDashi?.addEventListener("click", () => {
      if (!dashiMarker) return;
      dashiInfo?.close();
      map.panTo(dashiMarker.getPosition());
      if (map.getZoom() < 17) map.setZoom(17);
    });

    // 下段：交通規制 → 右上メニューをトグル開閉
    navTraffic?.addEventListener("click", () => {
      elTrafficPanel.classList.toggle("open");
    });

    // 下段：現在地 → 現在地ドット表示＆移動
    navLocate?.addEventListener("click", () => {
      ensureMyLocation(true);
    });

    // 下段：ヘルプ
    navHelp?.addEventListener("click", () => {
      helpOverlay.style.display = "flex";
    });
    helpClose?.addEventListener("click", () => {
      helpOverlay.style.display = "none";
    });
    helpOverlay?.addEventListener("click", (e) => {
      if (e.target === helpOverlay) helpOverlay.style.display = "none";
    });

    // 画面外タップで山車ウインドウを閉じる（ご指定）
    map.addListener("click", () => dashiInfo?.close());

    // 右上ヘッダーの手動/自動 切替イベント（外部UIから通知）
    document.addEventListener("traffic:selectionChanged", (ev) => {
      const label = ev?.detail?.label;
      if (label) {
        setTrafficHeader({ mode: "manual", label });
      } else {
        setTrafficHeader({ mode: "auto" });
      }
    });

    // 位置情報の受信（既存のポーリング/Pushがある場合は下記APIを適宜呼んでください）
    // 例：setDashiPosition({ lat, lng, ts: Date.now() })
    // ※ ここではデモとして固定位置を1回反映しておく:
    setDashiPosition({ lat: DEFAULT_CENTER.lat, lng: DEFAULT_CENTER.lng, ts: Date.now() });

    // 初期トースト（必要なら）
    // showToast("地図を読み込みました");
  };

  // --------- 交通規制ヘッダー表示の適用 ----------
  function setTrafficHeader({ mode, label = "" }){
    trafficHeaderState.mode = mode;
    trafficHeaderState.label = (mode === "manual" ? label : "");
    if (mode === "manual" && label) {
      elTrafficSub.textContent = label;
    } else {
      elTrafficSub.textContent = "自動更新";
    }
  }

  // --------- 山車位置を反映（最終更新から90秒ルール） ----------
  function setDashiPosition({ lat, lng, ts }){
    dashiLastTs = ts || Date.now();
    if (dashiMarker) {
      dashiMarker.setPosition({ lat, lng });
      // 情報ウインドウを開いている時は内容を更新
      if (dashiInfo) {
        dashiInfo.setContent( buildDashiInfoContent() );
      }
    }
  }

  // 山車InfoWindowの中身（「桜町区」「停止中/更新中」「経路表示」「経路図」）
  function buildDashiInfoContent(){
    const status = (Date.now() - dashiLastTs > 90_000) ? "停止中" : "更新中";
    const pos = dashiMarker?.getPosition?.();
    const lat = pos?.lat?.() ?? DEFAULT_CENTER.lat;
    const lng = pos?.lng?.() ?? DEFAULT_CENTER.lng;

    // 経路表示（Googleマップのナビ）
    const directionsURL =
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;

    // 経路図（今日の日付でリンク先を切替）
    const routeMapURL = getTodayRouteMap();

    const html = `
      <div class="iw">
        <div class="title">桜町区</div>
        <div class="status">${status}</div>
        <div class="row" style="margin-bottom:6px;">
          <a class="btn" href="${directionsURL}" target="_blank" rel="noopener">経路表示</a>
        </div>
        <div class="row">
          <a class="btn secondary" href="${routeMapURL}" target="_blank" rel="noopener">経路図</a>
        </div>
      </div>
    `;
    return html.trim();
  }

  // 今日に応じて経路図URLを選ぶ
  function getTodayRouteMap(dateObj = new Date()){
    // 月日だけで判定（年を跨いだ場合は必要に応じて調整）
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const dd = String(dateObj.getDate()).padStart(2, "0");
    const key = `${mm}-${dd}`;

    if (ROUTE_MAP_URLS[key]) return ROUTE_MAP_URLS[key];

    // 8/31 までは8/31、9/1 なら9/1、9/2 なら9/2…のルールに近い挙動に
    if (mm === "08" && dd <= "31") return ROUTE_MAP_URLS["08-31"];
    if (mm === "09" && dd === "01") return ROUTE_MAP_URLS["09-01"];
    if (mm === "09" && dd === "02") return ROUTE_MAP_URLS["09-02"];
    // その他は9/01へフォールバック
    return ROUTE_MAP_URLS["09-01"];
  }

  // --------- 左レールトグル（フックのみ。既存レイヤーに合わせて差し替え可） ----------
  function toggleLayer(kind){
    // 既存のレイヤー管理に合わせてON/OFFを実装してください。
    // ここでは簡易トーストで通知のみ（壊さないため）
    const label = kind === "info" ? "インフォメーション"
                 : kind === "toilet" ? "トイレ"
                 : kind === "parking" ? "パーキング"
                 : kind;
    showToast(`${label} を切り替え`);
  }

  // --------- 現在地表示 ----------
  function ensureMyLocation(moveTo){
    if (!navigator.geolocation){
      showToast("この端末では現在地を取得できません");
      return;
    }
    if (geoWatchId == null){
      geoWatchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          const latLng = new google.maps.LatLng(latitude, longitude);

          if (!meMarker){
            meMarker = new google.maps.Marker({
              position: latLng,
              map,
              title: "現在地",
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 6,
                fillColor: "#1e88e5",  // 青い点
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2
              },
              zIndex: 50
            });
          } else {
            meMarker.setPosition(latLng);
          }

          if (!meAccuracy){
            meAccuracy = new google.maps.Circle({
              map,
              radius: Math.max(accuracy, 8),
              center: latLng,
              fillColor: "#1e88e5",
              fillOpacity: 0.12,
              strokeColor: "#1e88e5",
              strokeOpacity: 0.4,
              strokeWeight: 1
            });
          } else {
            meAccuracy.setCenter(latLng);
            meAccuracy.setRadius(Math.max(accuracy, 8));
          }

          if (moveTo){
            map.panTo(latLng);
            if (map.getZoom() < 17) map.setZoom(17);
          }
        },
        (err) => {
          showToast("現在地の取得を許可してください");
          console.warn(err);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 12000 }
      );
    } else if (moveTo && meMarker){
      map.panTo(meMarker.getPosition());
      if (map.getZoom() < 17) map.setZoom(17);
    }
  }

  // --------- トースト ----------
  let toastTimer = null;
  function showToast(message){
    if (!toast) return;
    toast.textContent = message;
    toast.style.display = "block";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.style.display = "none"; }, 1800);
  }

})();
