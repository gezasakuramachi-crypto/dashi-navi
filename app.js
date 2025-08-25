/* app.js — Traccar共有トークンでログイン→デバイス特定→位置を定期取得
   レイアウトは index.html に完全対応。スマホでズレないよう map padding も適用。 */

//////////////////// 基本設定 ////////////////////
const TRACCAR_BASE  = "https://traccar-railway.fly.dev";
const TRACCAR_TOKEN = "RzBFAiAaeMvmv32ZrmskwLBY7hx0jHxCezE-NGOh_K2-QFuHgQIhAOY_es0TTwL-GX4pbel4G6wxKQcYjJd1EgtRzGKhSlQ7eyJ1Ijo2LCJlIjoiMjAyNS0wOC0yN1QxNTowMDowMC4wMDArMDA6MDAifQ";
const POLL_MS       = 10000; // 10秒ごと更新（お祭り本番は 5-10秒推奨）
const DASHI_ICON    = 'https://www.dropbox.com/scl/fi/echpcekhl6f13c9df5uzh/sakura.png?rlkey=e93ng3fdwbdlkvr07zkvw9pph&raw=1';

//////////////////// 変数 ////////////////////
let map, homeCenter, dashiMarker, myMarker;
let deviceId = null;

// 交通規制レイヤー（必要に応じてGeoJSON等をここで管理）
let trafficLayer = null;         // google.maps.Data などを使用予定
let currentTrafficKey = 'auto';  // 'auto' or 'YYYY-MM-DD'
let currentSlotLabel = null;     // '10:00-12:00' など

//////////////////// 地図の余白（UI衝突回避） ////////////////////
function applyMapPadding(){
  const isPc = window.matchMedia('(min-width: 601px)').matches;
  map.setOptions({
    padding: {
      top: 12,
      right: 12,
      bottom: isPc ? 16 : 90,
      left: 76
    }
  });
}

//////////////////// UIバインド ////////////////////
function bindUI(){
  // 交通規制パネル開閉
  const openBtn = document.getElementById('openBtn');
  const drawer  = document.getElementById('drawer');
  openBtn.addEventListener('click', ()=>{
    const opened = drawer.style.display !== 'none';
    drawer.style.display = opened ? 'none' : 'block';
    openBtn.textContent = opened ? '表示' : '閉じる';
  });

  // 日付タブ（自動／個別日）
  const tabs = [
    { id:'tabAuto', key:'auto' },
    { id:'tabD0',   key:'2025-08-31' },
    { id:'tabD1',   key:'2025-09-01' },
    { id:'tabD2',   key:'2025-09-02' },
  ];
  tabs.forEach(t=>{
    const el = document.getElementById(t.id);
    el.addEventListener('click', ()=>{
      tabs.forEach(x=>document.getElementById(x.id).classList.remove('active'));
      el.classList.add('active');
      currentTrafficKey = t.key;
      renderSlots(t.key);
      loadTrafficForSelection(); // 選択に応じて規制レイヤーを更新
    });
  });

  // 左レール：山車へ
  document.getElementById('btnFocusDashi').addEventListener('click', ()=>{
    if(dashiMarker){
      map.panTo(dashiMarker.getPosition());
      map.setZoom(Math.max(map.getZoom(), 17));
    }else{
      map.panTo(homeCenter);
    }
  });

  // 左レール：レイヤーON/OFF（見た目のみ・必要なら地図レイヤーと接続）
  const toggles = [
    { id:'btnInfo', key:'info' },
    { id:'btnWC',   key:'wc' },
    { id:'btnPark', key:'park' },
  ];
  toggles.forEach(t=>{
    const el = document.getElementById(t.id);
    el.addEventListener('click', ()=>{
      el.classList.toggle('inactive');
      // TODO: 実レイヤー（info/wc/park）の表示切替をここで実装
    });
  });

  // 現在地へ
  document.getElementById('btnMyLoc').addEventListener('click', ()=>{
    if(!navigator.geolocation) return alert('現在地が取得できません');
    navigator.geolocation.getCurrentPosition(pos=>{
      const p = {lat: pos.coords.latitude, lng: pos.coords.longitude};
      if(!myMarker){
        myMarker = new google.maps.Marker({
          map, position:p,
          icon: { path: google.maps.SymbolPath.CIRCLE, scale: 6, fillColor:'#4285f4', fillOpacity:1, strokeColor:'#fff', strokeWeight:2 }
        });
      }else{
        myMarker.setPosition(p);
      }
      map.panTo(p);
    }, ()=>alert('現在地の許可をお願いします'), { enableHighAccuracy:true, timeout:10000 });
  });

  // 下フッター操作
  document.getElementById('zoom-in').onclick  = ()=> map.setZoom(map.getZoom()+1);
  document.getElementById('zoom-out').onclick = ()=> map.setZoom(map.getZoom()-1);
  document.getElementById('recenter').onclick = ()=> map.panTo(homeCenter);

  // リサイズ時にパディング再適用
  window.addEventListener('resize', ()=> setTimeout(applyMapPadding, 50));
}

//////////////////// 交通規制スロット（UI生成＋ロード） ////////////////////
function renderSlots(key){
  const slotList = document.getElementById('slotList');
  slotList.innerHTML = '';
  const mk = (label)=> {
    const b = document.createElement('button');
    b.className = 'slotbtn';
    b.textContent = label;
    b.addEventListener('click', ()=>{
      document.querySelectorAll('.slotbtn').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      currentSlotLabel = label;
      loadTrafficForSelection();
    });
    slotList.appendChild(b);
    return b;
  };

  if(key==='auto'){
    const btn = mk('自動（現在時刻）');
    btn.classList.add('active');
    currentSlotLabel = '自動（現在時刻）';
  }else{
    // 例：時間帯を3つ用意（必要に応じて調整・増減）
    ['10:00-12:00','12:00-16:00','16:00-22:00'].forEach((label,i)=>{
      const b = mk(label);
      if(i===0){ b.classList.add('active'); currentSlotLabel = label; }
    });
  }
}

/* 規制データの読み込み
   - data/ 以下に GeoJSON を置いている場合の例。
   - 命名規則の一例：data/traffic_YYYYMMDD_1000-1200.geojson など
   - 自動（現在時刻）は、現在時刻からスロットを判定して読み込み。
*/
async function loadTrafficForSelection(){
  try{
    // 既存レイヤーを一旦クリア
    if(trafficLayer){
      trafficLayer.setMap(null);
      trafficLayer = null;
    }

    // ファイルパス推定（必要に応じて命名規則を合わせてください）
    let path = null;

    if(currentTrafficKey === 'auto'){
      // 現在時刻から日付・時間帯を推定（ザックリ例）
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth()+1).padStart(2,'0');
      const d = String(now.getDate()).padStart(2,'0');
      const hh = now.getHours();
      let slot = (hh < 12) ? '1000-1200' : (hh < 16) ? '1200-1600' : '1600-2200';
      path = `./data/traffic_${y}${m}${d}_${slot}.geojson`;
    } else {
      // 指定日のスロットからファイル名を作る
      // 例：'2025-09-01' + '12:00-16:00' -> traffic_20250901_1200-1600.geojson
      const ymd = currentTrafficKey.replaceAll('-',''); // '20250901'
      const slot = (currentSlotLabel || '').replace(':','').replace(':','').replaceAll('（','').replaceAll('）','').replaceAll('現在時刻','now').replaceAll('～','-').replaceAll('ー','-').replaceAll('–','-').replaceAll('−','-').replaceAll('—','-').replaceAll('−','-').replaceAll('–','-'); // 簡易
      if(currentSlotLabel && currentSlotLabel.includes('-')){
        const parts = currentSlotLabel.split('-'); // ['12:00','16:00']
        const s = parts[0].replace(':','') + '-' + parts[1].replace(':','');
        path = `./data/traffic_${ymd}_${s}.geojson`;
      }else{
        // 自動 or 未対応
        path = `./data/traffic_${ymd}.geojson`;
      }
    }

    // GeoJSON を読み込んで描画（存在しない場合は黙って終了）
    const res = await fetch(path, { cache:'no-cache' });
    if(!res.ok){
      console.warn('交通規制データなし:', path);
      return;
    }
    const geojson = await res.json();

    // Data Layer で表示（赤・透過で歩行者専用風）
    trafficLayer = new google.maps.Data({ map });
    trafficLayer.addGeoJson(geojson);
    trafficLayer.setStyle({
      fillColor: '#ff0000',
      fillOpacity: 0.35,
      strokeColor: '#ff3333',
      strokeWeight: 2
    });
  }catch(e){
    console.error('交通規制の描画に失敗', e);
  }
}

//////////////////// Traccar API 連携 ////////////////////
async function traccarLoginWithToken(){
  const url = `${TRACCAR_BASE}/api/session?token=${encodeURIComponent(TRACCAR_TOKEN)}`;
  const res = await fetch(url, { credentials: 'include', mode: 'cors' });
  if(!res.ok) throw new Error('Traccarセッション確立に失敗しました');
}

async function getFirstDeviceId(){
  const res = await fetch(`${TRACCAR_BASE}/api/devices`, { credentials: 'include', mode: 'cors' });
  if(!res.ok) throw new Error('デバイス一覧取得に失敗しました');
  const list = await res.json();
  if(!Array.isArray(list) || list.length === 0) throw new Error('デバイスが見つかりません');
  // 山車用のデバイス名に規則があるならここでフィルタ可能（例：name.includes('dashi') など）
  return list[0].id;
}

async function fetchLatestPosition(id){
  const url = `${TRACCAR_BASE}/api/positions?deviceId=${id}`;
  const res = await fetch(url, { credentials: 'include', mode: 'cors' });
  if(!res.ok) throw new Error('現在位置取得に失敗しました');
  const positions = await res.json();
  if(!Array.isArray(positions) || positions.length === 0) return null;
  const p = positions[0];
  return { lat: p.latitude, lng: p.longitude, speed: p.speed, course: p.course, time: p.deviceTime };
}

async function updateDashiPosition(){
  if(!deviceId) return;
  try{
    const pos = await fetchLatestPosition(deviceId);
    if(!pos) return;
    const point = { lat: pos.lat, lng: pos.lng };
    if(!dashiMarker){
      dashiMarker = new google.maps.Marker({
        map,
        position: point,
        icon: { url: DASHI_ICON, scaledSize: new google.maps.Size(38, 38) },
        title: '山車'
      });
      map.panTo(point);
    }else{
      dashiMarker.setPosition(point);
    }
  }catch(e){
    console.error('Dashi更新失敗', e);
  }
}

//////////////////// Google Map 初期化 ////////////////////
function initMap(){
  map = new google.maps.Map(document.getElementById('map'),{
    center:{lat:35.9689, lng:140.6408}, zoom:16,
    mapTypeControl:false, streetViewControl:false, fullscreenControl:false,
    zoomControl:true
  });
  homeCenter = map.getCenter();

  applyMapPadding();
  bindUI();
  renderSlots('auto');           // 初期は「自動（現在時刻）」
  loadTrafficForSelection();     // 初期の交通規制を試行ロード（あれば表示）

  // Traccar連携開始
  (async ()=>{
    try{
      await traccarLoginWithToken();
      deviceId = await getFirstDeviceId();
      await updateDashiPosition();
      setInterval(updateDashiPosition, POLL_MS);
    }catch(err){
      console.error(err);
      alert('Traccarとの接続に問題があります。トークン/URL/CORS設定をご確認ください。');
    }
  })();
}
window.initMap = initMap;
