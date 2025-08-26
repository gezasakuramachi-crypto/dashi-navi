/* ================= 基本設定 ================= */
const CONFIG = {
  SERVER_BASE: "https://traccar-railway.fly.dev",
  DEVICE_ID: 1,
  PUBLIC_BEARER:
    "RzBFAiAaeMvmv32ZrmskwLBY7hx0jHxCezE-NGOh_K2-QFuHgQIhAOY_es0TTwL-GX4pbel4G6wxKQcYjJd1EgtRzGKhSlQ7eyJ1Ijo2LCJlIjoiMjAyNS0wOC0yN1QxNTowMDowMC4wMDArMDA6MDAifQ",
  POLL_MS: 5000,

  DASHI_ICON:
    "https://www.dropbox.com/scl/fi/echpcekhl6f13c9df5uzh/sakura.png?rlkey=e93ng3fdwbdlkvr07zkvw9pph&raw=1",

  ICONS: {
    info: "https://gezasakuramachi-crypto.github.io/dashi-navi/mark/info.png",
    wc:   "https://gezasakuramachi-crypto.github.io/dashi-navi/mark/wc.png",
    park: "https://gezasakuramachi-crypto.github.io/dashi-navi/mark/parking.png",
  },

  POI_ICON_PX: 18
};

/* ================= 地図の初期中心 ================= */
const MAP_CENTER = { lat: 35.966, lng: 140.628 };
const MAP_ZOOM   = 15;

/* ================= 規制線スタイル ================= */
const STROKE = {
  main: {
    strokeColor: "#ff0000",
    strokeOpacity: 1,
    strokeWeight: 1.5,  // ★外枠を細く変更
    fillColor: "#ff0000",
    fillOpacity: 0.20,
    zIndex: 3002
  },
};

/* ================= POIデータ ================= */
// （以下は前回と同じ内容のため省略）
