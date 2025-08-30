<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
  <title>桜町区 山車ナビ</title>
  <style>
    :root { --headerH: 50px; --footerH: 56px; }
    html, body { height:100%; margin:0; }
    body { background:#000; overflow:hidden; color:#fff; }

    /* Map：通常フロー＋ヘッダー/フッターぶん差し引き */
    #map {
      width:100%;
      height: calc(100dvh - var(--headerH) - var(--footerH));
      margin-top: var(--headerH);
      margin-bottom: var(--footerH);
    }

    /* ヘッダー（タイトル画像） */
    .app-header{
      position:fixed; inset:0 0 auto 0; z-index:10;
      display:flex; align-items:center; justify-content:center;
      background:#000; box-shadow:0 2px 8px rgba(0,0,0,.25);
      height:var(--headerH); padding:2px 6px;
    }
    .app-header img{
      height: calc(var(--headerH) - 6px);
      width: auto;
      max-width: 98vw;
      object-fit: contain;
      display: block;
    }

    /* 右上：交通規制ピル＋ドロワー */
    .ctrl{ position:fixed; right:8px; top: calc(var(--headerH) + 8px); z-index:11; }
    .reg-pill{
      background:#e91e63; color:#fff; text-align:center;
      font-size:13px; line-height:1; padding:5px 10px;
      border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,.25);
      cursor:pointer; user-select:none; white-space:nowrap;
    }

    .reg-drawer{
      margin-top:8px;
      width:10vw;                /* 全体の20%以下相当：細く保つ */
      max-width: 180px;
      min-width: 120px;
      background: rgba(218,233,248,0.7);
      border:1px solid #bcd4ea; border-radius:10px;
      box-shadow:0 4px 16px rgba(0,0,0,.18);
      padding:6px;
      font-size:12px;
      color:#222; display:none;
      -webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px);
      max-height: 60vh; overflow:auto;
    }
    .reg-drawer .title-row{ display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
    .reg-drawer .title{ font-weight:700; font-size:13px; }
    .reg-drawer .close{ border:1px solid #7aa7d6; background:#fff; padding:3px 8px; border-radius:8px; font-size:12px; cursor:pointer; }
    .vstack{ display:grid; gap:6px; }
    .tab{ text-align:center; border:1px solid #88b5e6; background:#fff; border-radius:8px; padding:5px 0; cursor:pointer; user-select:none; }
    .tab.active{ background:#e9f2ff; border-color:#5ea2ff; font-weight:700; }
    .legend{ display:flex; align-items:center; gap:6px; font-size:12px; color:#333; margin:6px 0; }
    .sw{ width:10px; height:10px; border-radius:3px; border:1px solid #ff0000; background:#ff99cc; opacity:.7 }
    .slotlist{ display:grid; gap:6px; }
    .slotbtn{ padding:5px; border:1px solid #b9cfe8; border-radius:8px; background:#fff; text-align:center; cursor:pointer; font-size:12px; }
    .slotbtn.active{ background:#5ea2ff; color:#fff; border-color:#5ea2ff; }

    /* 左：表示切替（インフォ/トイレ/パーキング） */
    .layer-ctrl{
      position:fixed; left:8px; top: calc(var(--headerH) + 8px); z-index:11;
      display:grid; gap:8px;
      background:#fff; border:1px solid #e5e7eb; border-radius:12px;
      box-shadow:0 4px 12px rgba(0,0,0,.18);
      padding:4px; width:36px; place-items:center;
    }
    .layer-btn{ width:28px; height:28px; object-fit:contain; cursor:pointer; }
    .layer-btn.inactive{ filter: grayscale(100%); opacity:.55; }

    /* 下：ボトムメニュー（アイコン↑/文字↓） */
    .bottom-bar{
      position:fixed; inset:auto 0 0 0; height:var(--footerH); z-index:20;
      background:#000; color:#fff; display:grid; grid-template-columns:repeat(4,1fr);
      align-items:center; border-top:1px solid rgba(255,255,255,.12);
    }
    .bottom-btn{
      appearance:none; background:transparent; color:#fff; border:0;
      width:100%; height:100%; cursor:pointer;
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      gap:3px; font-size:12.5px; line-height:1.1;
      -webkit-tap-highlight-color: transparent;
    }
    .bottom-btn .ico{ width:38px; height:38px; object-fit:contain; }

    /* InfoWindow（山車・POI）細身 */
    .gm-style .gm-style-iw-c{ padding:6px !important; }
    .iw { font:13px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,"Hiragino Kaku Gothic ProN",Meiryo,sans-serif; color:#333; }
    .iw-narrow { width: 178px; }
    .iw .title{ font-weight:700; font-size:13.5px; margin:0 0 4px; color:#202124; }
    .iw .status{ font-size:12px; margin:2px 0 6px; color:#555; }
    .iw .btnrow{ display:flex; gap:6px; flex-wrap:wrap; }
    .iw .btn{
      appearance:none; border:1px solid #dadce0; background:#fff; border-radius:999px;
      padding:6px 10px; font-size:12px; cursor:pointer; margin-top:2px;
      box-shadow:0 1px 2px rgba(0,0,0,.12);
      display:inline-flex; align-items:center; gap:6px; text-decoration:none; color:#1a73e8;
    }
    .iw .btn .dot{ width:6px; height:6px; border-radius:50%; background:#1a73e8; }

    /* ヘルプ簡易モーダル */
    .modal{ position:fixed; inset:0; background:rgba(0,0,0,.5); display:none; align-items:center; justify-content:center; z-index:30; }
    .modal .box{ width:min(92vw,520px); background:#fff; border-radius:12px; padding:12px; color:#222; }
    .modal .box h3{ margin:4px 0 8px; font-size:16px; }
    .modal .box .close{ float:right; border:1px solid #ddd; background:#fff; border-radius:8px; padding:4px 10px; cursor:pointer; }
    .modal-content { max-height: 80vh; overflow-y: auto; padding: 16px; box-sizing: border-box; }
  </style>
</head>
<body>
  <!-- ヘッダー（タイトル画像） -->
  <header class="app-header">
    <img src="https://gezasakuramachi-crypto.github.io/dashi-navi/mark/header-title.webp" alt="鹿嶋のご神幸">
  </header>

  <!-- 右上：交通規制 -->
  <div class="ctrl">
    <div class="reg-pill" id="regPill">交通規制</div>
    <aside class="reg-drawer" id="regDrawer" aria-hidden="true">
      <div class="title-row">
        <div class="title">交通規制</div>
        <button id="regClose" class="close" type="button">閉じる</button>
      </div>
      <div class="vstack">
        <div id="tabAuto" class="tab active">自動更新</div>
        <div id="tabD1"   class="tab">9/1</div>
        <div id="tabD2"   class="tab">9/2</div>
      </div>
      <div class="legend"><span class="sw"></span>交通規制</div>
      <div id="slotList" class="slotlist"></div>
    </aside>
  </div>

  <!-- 左：表示切替（インフォ/トイレ/パーキング） -->
  <div class="layer-ctrl" id="layerCtrl" title="表示の切替">
    <img src="https://gezasakuramachi-crypto.github.io/dashi-navi/mark/info.png"    id="btnInfo" class="layer-btn" title="インフォ">
    <img src="https://gezasakuramachi-crypto.github.io/dashi-navi/mark/wc.png"      id="btnWC" class="layer-btn" title="トイレ">
    <img src="https://gezasakuramachi-crypto.github.io/dashi-navi/mark/parking.png" id="btnPark" class="layer-btn" title="駐車場">
  </div>

  <!-- 地図 -->
  <div id="map"></div>

  <!-- 下：ボトムメニュー（アイコン↑/文字↓） -->
  <nav class="bottom-bar">
    <button class="bottom-btn" id="bDashi" title="山車" type="button">
      <img class="ico" src="https://gezasakuramachi-crypto.github.io/dashi-navi/mark/sakura.png" alt="">
      <span>山車</span>
    </button>
    <button class="bottom-btn" id="bTraffic" title="交通規制" type="button">
      <img class="ico" id="icoTraffic"
           src="https://gezasakuramachi-crypto.github.io/dashi-navi/mark/no_entry.png"
           alt="">
      <span>交通規制</span>
    </button>
    <button class="bottom-btn" id="bMyLoc" title="現在地" type="button">
      <img class="ico" src="https://gezasakuramachi-crypto.github.io/dashi-navi/mark/myloc.svg" alt=""
           onerror="this.src='data:image/svg+xml;utf8,<?xml version=&quot;1.0&quot;?><svg xmlns=&quot;http://www.w3.org/2000/svg&quot; viewBox=&quot;0 0 24 24&quot;><circle cx=&quot;12&quot; cy=&quot;12&quot; r=&quot;3&quot; fill=&quot;%234285f4&quot;/><circle cx=&quot;12&quot; cy=&quot;12&quot; r=&quot;8&quot; fill=&quot;none&quot; stroke=&quot;%234285f4&quot; stroke-width=&quot;2&quot;/><path d=&quot;M12 2v3M12 19v3M2 12h3M19 12h3&quot; stroke=&quot;%234285f4&quot; stroke-width=&quot;2&quot; stroke-linecap=&quot;round&quot;/></svg>';">
      <span>現在地</span>
    </button>
    <button class="bottom-btn" id="bHelp" title="ヘルプ" type="button">
      <img class="ico" src="https://gezasakuramachi-crypto.github.io/dashi-navi/mark/help.png" alt="">
      <span>ヘルプ</span>
    </button>
  </nav>

  <!-- ヘルプモーダル -->
  <div class="modal" id="helpModal" role="dialog" aria-modal="true" aria-hidden="true">
    <div class="box">
      <button class="close" id="helpClose">閉じる</button>
      <h3>山車ナビの使い方</h3>
      <div class="modal-content">
        <pre style="white-space:pre-wrap; font-family:inherit; line-height:1.5; margin:0;">
◆交通規制（右上と下段左２）
自動更新は、リアルタイムの交通規制を表示します。
日付と時間を選択すると、その日時の交通規制エリアが見れます。

◆左側アイコン
３つあるアイコンは
・インフォメーション
・トイレ
・駐車場
の表示・非常時を切り替えるボタンです
それぞれのアイコンをタップすると、情報が見れます。

◆下段メニュー
桜→山車の現在地がわかります
交通規制→交通規制が見れます
現在地→利用者の現在地がわかります
ヘルプ→ここです

その他
テストは主にiphoneSEでやってます。androidはもしかしたら経路案内でGoogleMAPにうまくとばないかもしれません。またこちらは桜町区のいち役員（非エンジニア）が０円で作成したものです。
よって、使い勝手が悪いとは思いますが、ご承知の上でご利用ください。
また通信端末が猛暑でうまく動かない可能性もあります。その時は夏を恨んで頂きますようお願い申し上げまする。

created by Masu
        </pre>
      </div>
    </div>
  </div>

  <script src="app.js"></script>
  <script async src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCExrqcE4MPmievjTlV8wFJrVtKcbKWqX8&callback=initMap&v=weekly&language=ja"></script>
</body>
</html>
