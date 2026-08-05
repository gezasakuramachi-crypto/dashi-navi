window.DASHI_NAVI_CONFIG = {
  appName: "令和8年 鹿島神宮神幸祭 山車ナビ",
  festivalYear: 2026,
  timeZone: "Asia/Tokyo",

  googleMapsApiKey: "",
  mapCenter: { lat: 35.966, lng: 140.628 },
  mapZoom: 15,
  mapViewportUrl: "data/map-viewport.geojson",

  positionApi: {
    serverBase: "https://kashima-dashi-position-api-2026.fly.dev",
    pollMs: 30000,
    staleAfterMs: 180000
  },

  /*
   * 一般公開ページで山車の現在地を表示する時間です。
   * 管理用表示（index.html?admin=1）は、この時間外もライブ位置を確認できます。
   */
  publicPositionDays: [
    {
      id: "position-2026-09-01",
      date: "2026-09-01",
      label: "9月1日",
      published: true,
      slots: [
        { id: "position-0901-1000-2200", start: "10:00", end: "22:00" }
      ]
    },
    {
      id: "position-2026-09-02",
      date: "2026-09-02",
      label: "9月2日",
      published: true,
      slots: [
        { id: "position-0902-0600-0700", start: "06:00", end: "07:00" },
        { id: "position-0902-1800-2200", start: "18:00", end: "22:00" }
      ]
    },
    {
      id: "position-2026-09-03",
      date: "2026-09-03",
      label: "9月3日",
      published: true,
      slots: [
        { id: "position-0903-1130-2200", start: "11:30", end: "22:00" }
      ]
    }
  ],

  runtimeConfigUrl: "data/runtime-config.json",
  runtimeConfigRefreshMs: 60000,
  adminPreviewStorageKey: "dashi-navi-admin-preview-v1",

  icons: {
    info: "mark/info.png",
    wc: "mark/wc.png",
    parking: "mark/parking.png"
  },

  dashis: [
    {
      id: "sakuramachi",
      townName: "櫻町区",
      visible: true,
      deviceId: 2,
      iconUrl: "mark/sakuramachi-konohanasakuya-icon.png",
      officialUrl: "https://sites.google.com/view/sakuramachiku/",
      routeUrls: {},
      testPosition: { lat: 35.963918, lng: 140.631464 }
    }
  ],

  poi: {
    information: [
      {
        title: "新町山車集合場所　9/3 13時",
        lat: 35.9658889,
        lng: 140.6268333,
        description: "年番区新町を先頭に新町通りから役曳きをおこない、各町内へ向かいます。"
      },
      {
        title: "にぎわい広場",
        lat: 35.9664167,
        lng: 140.6277778,
        description: "飲食販売屋台、トイレ、休憩スペースがあります。"
      },
      {
        title: "総踊り・のの字廻し会場　9/2 18時～",
        lat: 35.9679444,
        lng: 140.6300278,
        photo: "mark/souodori2.png",
        description: "町内の山車が勢ぞろいし、総踊りとのの字廻しが披露される会場です。"
      },
      {
        title: "大町通り山車集合",
        lat: 35.9679722,
        lng: 140.6286944,
        description: "五ヶ町の山車が大町通りに並ぶ場所です。"
      },
      {
        title: "年番引継ぎ会場　9/3 18時～",
        lat: 35.9679722,
        lng: 140.6289444,
        photo: "mark/nen-hiki.png",
        description: "山車の運行を執り仕切る「山車年番」を、次年度の年番町内へ引き継ぐ会場です。"
      },
      {
        title: "宮内ビル駐車場",
        lat: 35.9613889,
        lng: 140.6362778,
        description: "山車の折り返し地点です。"
      },
      {
        title: "二十三夜尊",
        lat: 35.963322897955784,
        lng: 140.6323540837374,
        description: "櫻町区にある月読大神をまつる社です。"
      },
      {
        title: "櫻町区祭事事務所",
        lat: 35.963917794648374,
        lng: 140.63146447396596,
        description: "櫻町区公会堂"
      }
    ],
    toilets: [
      { title: "鹿島神宮公衆トイレ", lat: 35.9679444, lng: 140.6305833 },
      { title: "にぎわい広場 トイレ", lat: 35.9664167, lng: 140.6278611 },
      { title: "鹿嶋市宮中地区駐車場 トイレ", lat: 35.9665, lng: 140.6318056 },
      { title: "道祖神児童公園 公衆トイレ", lat: 35.9639444, lng: 140.6292778 },
      { title: "観光案内所 公衆トイレ", lat: 35.9672778, lng: 140.6266944 }
    ],
    parking: [
      { title: "鹿嶋市宮中地区駐車場", lat: 35.9665833, lng: 140.632 },
      { title: "鹿嶋市営鹿島神宮駅西駐車場", lat: 35.97, lng: 140.6238333 }
    ]
  },

  /*
   * 令和8年の正式な交通規制図は3日分とも公開済みです。
   * published が false の日はテストモードだけで表示できます。
   */
  trafficDays: [
    {
      id: "2026-09-01",
      date: "2026-09-01",
      label: "9月1日",
      published: true,
      note: "令和8年9月1日 交通規制",
      slots: [
        { id: "0901-1030-1530", label: "10:30〜15:30", start: "10:30", end: "15:30", src: "data/91-1030-1530.geojson" },
        { id: "0901-1530-1930", label: "15:30〜19:30", start: "15:30", end: "19:30", src: "data/91-1530-1930.geojson" },
        { id: "0901-1930-2030", label: "19:30〜20:30", start: "19:30", end: "20:30", src: "data/91-1930-2030.geojson" },
        { id: "0901-2030-2200", label: "20:30〜22:00", start: "20:30", end: "22:00", src: "data/91-2030-2200.geojson" }
      ]
    },
    {
      id: "2026-09-02",
      date: "2026-09-02",
      label: "9月2日",
      published: true,
      note: "令和8年9月2日 交通規制",
      slots: [
        { id: "0902-0800-1000", label: "8:00〜10:00", start: "08:00", end: "10:00", src: "data/92-0800-1000.geojson" },
        { id: "0902-1000-1400", label: "10:00〜14:00", start: "10:00", end: "14:00", src: "data/92-1000-1400.geojson" },
        { id: "0902-1400-1600", label: "14:00〜16:00", start: "14:00", end: "16:00", src: "data/92-1400-1600.geojson" },
        { id: "0902-1600-1630", label: "16:00〜16:30", start: "16:00", end: "16:30", src: "data/92-1600-1630.geojson" },
        { id: "0902-1630-1700", label: "16:30〜17:00", start: "16:30", end: "17:00", src: "data/92-1630-1700.geojson" },
        { id: "0902-1700-2200", label: "17:00〜22:00", start: "17:00", end: "22:00", src: "data/92-1700-2200.geojson" }
      ]
    },
    {
      id: "2026-09-03",
      date: "2026-09-03",
      label: "9月3日",
      published: true,
      note: "令和8年9月3日 交通規制",
      slots: [
        { id: "0903-0800-1230", label: "8:00〜12:30", start: "08:00", end: "12:30", src: "data/93-0800-1230.geojson" },
        { id: "0903-1230-1400", label: "12:30〜14:00", start: "12:30", end: "14:00", src: "data/93-1230-1400.geojson" },
        { id: "0903-1400-1630", label: "14:00〜16:30", start: "14:00", end: "16:30", src: "data/93-1400-1630.geojson" },
        { id: "0903-1630-1900", label: "16:30〜19:00", start: "16:30", end: "19:00", src: "data/93-1630-1900.geojson" },
        { id: "0903-1900-1930", label: "19:00〜19:30", start: "19:00", end: "19:30", src: "data/93-1900-1930.geojson" },
        { id: "0903-1930-2200", label: "19:30〜22:00", start: "19:30", end: "22:00", src: "data/93-1930-2200.geojson" }
      ]
    }
  ]
};
