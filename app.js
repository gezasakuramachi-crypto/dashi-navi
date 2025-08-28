/* =========================================================
   神幸祭・山車ナビ  app.js
   - iOSでも“真っ黒”にならない初期化
   - UIハンドラ（左縦ボタン/下メニュー/右上ピル/経路FAB）
   - 山車 InfoWindow：停止中/更新中 を 90秒で判定
   - 交通規制などは既存実装を踏襲（必要最小に整理）
========================================================= */

let map;
let dashiMarker;            // 山車マーカー
let dashiInfoWindow;        // 山車情報ウインドウ
let lastBeaconTs = 0;       // 最終受信タイムスタンプ(ms)
let routeTarget = null;     // 経路用 目的地（山車位置）

// 画面要素
const $ = (sel)=>document.querySelector(sel);

function initMap(){
  try{
    // 初期中心（鹿島神宮周辺）
    const center = { lat: 35.9765, lng: 140.6385 };

    // ズームは 1段階寄せ（ご要望）
    map = new google.maps.Map($('#map'), {
      center, zoom: 16, mapTypeControl: false,
      fullscreenControl: false, streetViewControl: false,
      clickableIcons: true, gestureHandling: 'greedy',
      restriction: undefined,   // 後で最大域を設定
    });

    // 最大表示域（外へ行けないように）
    fetch('https://gezasakuramachi-crypto.github.io/dashi-navi/data/map-viewport.geojson')
      .then(r=>r.json())
      .then(geo=>{
        const bounds = new google.maps.LatLngBounds();
        geo.features.forEach(f=>{
          (f.geometry.coordinates[0]||[]).forEach(([lng,lat])=>{
            bounds.extend({lat, lng});
          });
        });
        map.fitBounds(bounds);
        // fit したあと、さらに1段階寄せ
        map.setZoom(Math.min(map.getZoom()+1, 20));
        map.setOptions({restriction:{latLngBounds:bounds, strictBounds:true}});
      }).catch(()=>{ /* 無視して続行 */ });

    // 山車の仮マーカー（実位置はトークンから取得して更新）
    dashiMarker = new google.maps.Marker({
      position: center,
      map,
      icon: {
        url: 'https://gezasakuramachi-crypto.github.io/dashi-navi/mark/sakura.png',
        scaledSize: new google.maps.Size(44,44)
      },
      title: '桜町区'
    });
    routeTarget = center;

    // 山車情報ウインドウ
    dashiInfoWindow = new google.maps.InfoWindow({ content: renderDashiInfo() });
    dashiMarker.addListener('click', ()=> {
      dashiInfoWindow.setContent(renderDashiInfo());
      dashiInfoWindow.open({ anchor: dashiMarker, map });
    });

    // 画面外タップでクローズ（モバイル操作しやすく）
    map.addListener('click', ()=> dashiInfoWindow.close());

    // 経路FAB
    $('#route-fab').addEventListener('click', openRoute);

    // 下メニュー：山車＝マーカーの吹き出しを開く
    $('#nav-dashi').addEventListener('click', ()=>{
      dashiInfoWindow.setContent(renderDashiInfo());
      dashiInfoWindow.open({ anchor: dashiMarker, map });
      map.panTo(dashiMarker.getPosition());
    });

    // 下メニュー：交通規制＝右上ピルと同じ挙動（ハンドラは既存表示を呼ぶ想定）
    const openTraffic = ()=>window.showTrafficPanel && window.showTrafficPanel();
    $('#nav-traffic').addEventListener('click', openTraffic);
    $('#traffic-pill').addEventListener('click', openTraffic);

    // 下メニュー：現在地
    $('#nav-locate').addEventListener('click', locateMe);

    // 左のトグル（情報/トイレ/駐車場）—既存のトグル関数があれば呼ぶ
    $('#btn-info').addEventListener('click', ()=>window.toggleInfo && window.toggleInfo());
    $('#btn-toilet').addEventListener('click', ()=>window.toggleToilet && window.toggleToilet());
    $('#btn-parking').addEventListener('click', ()=>window.toggleParking && window.toggleParking());

    // 走行エリア（青枠・塗りなし）
    fetch('https://gezasakuramachi-crypto.github.io/dashi-navi/data/run-area.geojson')
      .then(r=>r.json())
      .then(geo=>{
        geo.features.forEach(f=>{
          const path = (f.geometry.coordinates[0]||[]).map(([lng,lat])=>({lat,lng}));
          new google.maps.Polygon({
            map, paths: path,
            strokeColor:'#137bff', strokeOpacity:1, strokeWeight:2,
            fillOpacity:0
          });
        });
      }).catch(()=>{ /* 無視して続行 */ });

    // 位置トークンから現在位置を取得・反映（ダミー実装：適宜本番APIに置換）
    startBeaconPoll();

  }catch(err){
    console.error(err);
    const e = document.getElementById('map-error'); if(e) e.style.display='block';
  }
}

/* ===== 山車インフォの描画（停止中/更新中の判定を90秒） ===== */
function renderDashiInfo(){
  const now = Date.now();
  const isActive = (now - lastBeaconTs) <= 90*1000;
  const status = isActive ? '更新中' : '停止中';

  // 経路図（当日リンク）
  const routeMapUrl = getRouteMapUrlByToday();

  return `
    <div style="min-width:180px;max-width:220px">
      <div style="font-weight:700;font-size:16px;margin-bottom:4px">桜町区</div>
      <div style="color:#555;margin-bottom:8px">${status}</div>
      <div style="display:grid;gap:6px">
        <a href="#" id="__go_nav" style="display:block;border:1px solid #e5e7eb;border-radius:10px;padding:8px 12px;text-decoration:none;color:#0b8cff;background:#fff;">
          ● 経路表示
        </a>
        <a href="${routeMapUrl}" target="_blank" rel="noopener" style="display:block;border:1px solid #e5e7eb;border-radius:10px;padding:8px 12px;text-decoration:none;color:#111;background:#fff;">
          ● 経路図
        </a>
      </div>
    </div>
  `;
}

/* InfoWindow内の「経路表示」クリックを拾って Googleマップアプリへ */
document.addEventListener('click',(e)=>{
  const a = e.target.closest('#__go_nav');
  if(!a) return;
  e.preventDefault(); openRoute();
});

/* ====== 経路表示（Google Mapsへ遷移） ====== */
function openRoute(){
  if(!routeTarget) return;
  const {lat,lng} = routeTarget;
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
  window.open(url, '_blank');
}

/* ====== 現在地へ ====== */
function locateMe(){
  if(!navigator.geolocation){ return; }
  navigator.geolocation.getCurrentPosition(pos=>{
    const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    map.panTo(p);
    map.setZoom(Math.max(map.getZoom(), 17));
  }, ()=>{}, {enableHighAccuracy:true, timeout:8000, maximumAge:0});
}

/* ====== 経路図（当日で出し分け） ====== */
function getRouteMapUrlByToday(){
  // 日本時間で判定
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth()+1;  // 1-12
  const d = now.getDate();

  // 8/31, 9/1, 9/2 のURLマップ
  const url831 = 'https://sites.google.com/view/sakuramachiku/%E4%BB%A4%E5%92%8C%E5%B9%B4%E7%A5%9E%E5%B9%B8%E7%A5%AD/8%E6%9C%8831%E6%97%A5%E5%89%8D%E5%A4%9C%E7%A5%AD%E7%B5%8C%E8%B7%AF%E5%9B%B3';
  const url901 = 'https://sites.google.com/view/sakuramachiku/%E4%BB%A4%E5%92%8C%E5%B9%B4%E7%A5%9E%E5%B9%B8%E7%A5%AD/9%E6%9C%881%E6%97%A5-%E7%A5%9E%E5%B9%B8%E7%A5%AD%E7%B5%8C%E8%B7%AF%E5%9B%B3';
  const url902 = 'https://sites.google.com/view/sakuramachiku/%E4%BB%A4%E5%92%8C%E5%B9%B4%E7%A5%9E%E5%B9%B8%E7%A5%AD/9%E6%9C%882%E6%97%A5-%E7%A5%9E%E5%B9%B8%E7%A5%AD%E7%B5%8C%E8%B7%AF%E5%9B%B3';

  if (m===8 && d<=31) return url831;
  if (m===9 && d===1)  return url901;
  if (m===9 && d>=2)   return url902;
  // デフォルトは一番近いものに
  return url901;
}

/* ====== 位置トークンのポーリング（擬似） ======
   ※実運用のAPI／WebSocketに差し替えてください。
   ユーザーが共有してくれたトークンをここで使うなら fetch で取りに行く実装に。
*/
function startBeaconPoll(){
  // デモ：10秒ごとに少し動かす
  setInterval(()=>{
    const cur = dashiMarker.getPosition();
    const next = { lat: cur.lat() + (Math.random()-0.5)*0.0005, lng: cur.lng() + (Math.random()-0.5)*0.0005 };
    dashiMarker.setPosition(next);
    routeTarget = next;
    lastBeaconTs = Date.now(); // 受信したことにする
    // InfoWindowを開いていたら内容だけ更新
    if(dashiInfoWindow && dashiInfoWindow.getMap()){
      dashiInfoWindow.setContent(renderDashiInfo());
    }
  }, 10000);
}

/* ====== 右上交通規制パネルのラッパ（既存実装があればそちらを呼ぶ） ====== */
window.showTrafficPanel = function(){
  if (window.openTrafficPanel) {
    window.openTrafficPanel();
    return;
  }
  alert('交通規制パネル（実装フック）');
};

// グローバル公開（Google Maps callback）
window.initMap = initMap;
