window.DASHI_NAVI_CONFIG = {
  eventLabel: "令和8年 鹿島神宮神幸祭",
  pollIntervalMs: 30000,
  staleAfterMs: 120000,

  map: {
    center: { lat: 35.966, lng: 140.628 },
    zoom: 15,
    googleMapsApiKey: "",
    mapId: "DEMO_MAP_ID",
  },

  /*
   * 公開画面はTraccarへ直接アクセスさせません。
   * 30秒キャッシュ済みの位置情報だけを返すAPIを、次の工程で設定します。
   */
  positionApiUrl: "",

  towns: [
    {
      id: "sakuramachi",
      name: "櫻町",
      markerLabel: "櫻",
      color: "#e85c88",
      enabled: true,
    },
    {
      id: "shimmachi",
      name: "新町",
      markerLabel: "新",
      color: "#2563a8",
      enabled: false,
    },
    {
      id: "omachi",
      name: "大町",
      markerLabel: "大",
      color: "#cb7b15",
      enabled: false,
    },
    {
      id: "nakamachi",
      name: "仲町",
      markerLabel: "仲",
      color: "#25815c",
      enabled: false,
    },
    {
      id: "kakunai",
      name: "角内",
      markerLabel: "角",
      color: "#7046a1",
      enabled: false,
    },
  ],

  ads: [
    {
      id: "preparing",
      imageUrl: "",
      href: "",
      alt: "協賛広告 準備中",
      enabled: true,
    },
  ],
};
