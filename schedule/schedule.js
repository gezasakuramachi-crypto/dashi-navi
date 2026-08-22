(function () {
  "use strict";

  /*
   * 9/3 15:20–17:00は、暑さなどで運行を短縮する場合に備えて
   * 通常ルートとショートカットルートを登録しています。
   * 現場から切替指示があるまでは standard を公開します。
   */
  const september3AfternoonRoutes = {
    active: "standard",
    standard: "1Q4RNYVSgucO-mLRKspDzCGe5ECwm-YA",
    shortcut: "16IWs5jEWnULAdROjkelBjx0-G0FdSok"
  };

  const scheduleDays = [
    {
      id: "9-1",
      label: "9月1日",
      weekday: "火",
      fullDate: "令和8年9月1日（火）",
      href: "./",
      slots: [
        ["10:00–11:00", "1wnaaa4BzSV38wpZTjvUsC-6AFUJgWrE"],
        ["11:00–12:00", "1uwH9Ev7Z-RionWUW7xosEwmG1j3hvlQ"],
        ["13:00–15:00", "1iSwJTXqS-7W9GptQ1p9q82myQndugbQ"],
        ["15:00–17:00", "1-L6Hkj7gZOI6CvOoGsAMHbFEGs0SvdM"],
        ["18:00–20:00", "1hOzCpo2AYEOAW75tD0rnXtHASK7FRck"],
        ["20:00–22:00", "1zWt2TnUcFQ5jwjI5zbjUkpCsb7xT6xc"]
      ]
    },
    {
      id: "9-2",
      label: "9月2日",
      weekday: "水",
      fullDate: "令和8年9月2日（水）",
      href: "9-2.html",
      slots: [
        ["6:00–7:00", "1oJISLf7jiyDP8iGFQ81kuC9ekG3T05M"],
        ["18:00–22:00", "1d5sStF44q29Eh0tA75oetNn97e4iNr4"]
      ]
    },
    {
      id: "9-3",
      label: "9月3日",
      weekday: "木",
      fullDate: "令和8年9月3日（木）",
      href: "9-3.html",
      slots: [
        ["11:00–12:50", "198vNazs-OGaw2szb1b6RJ0paOr2oauw"],
        ["13:40–15:00", "1aVRi7Ed9P5YZxNEJSLOg2nV695fUNl4"],
        [
          "15:20–17:00",
          september3AfternoonRoutes[september3AfternoonRoutes.active]
        ],
        ["18:00–19:00", "11a7L6DMlUi5GDAASMdAoOJJOiR6sGzs"],
        ["19:00–22:00", "1pOcI3vWw05sHGBjk1cWZd54631HdIxM"]
      ]
    }
  ];

  const requestedDay = document.body.dataset.day;
  const day = scheduleDays.find((item) => item.id === requestedDay) || scheduleDays[0];
  const app = document.getElementById("scheduleApp");

  const dayTabs = scheduleDays.map((item) => {
    const active = item.id === day.id;
    return `
      <a class="day-tab${active ? " active" : ""}" href="${item.href}"${active ? ' aria-current="page"' : ""}>
        <span class="day-label">${item.label}</span><span class="weekday">（${item.weekday}）</span>
      </a>`;
  }).join("");

  const routeMaps = day.slots.map((slot, index) => `
    <article class="route-panel" aria-labelledby="routeTime${index}">
      <div class="route-panel-heading">
        <span class="route-index" aria-hidden="true">${index + 1}</span>
        <div>
          <p class="route-caption">${day.label}の運行経路</p>
          <h3 id="routeTime${index}">${slot[0]}</h3>
        </div>
      </div>
      <div class="map-frame">
        <iframe
          src="https://www.google.com/maps/d/embed?mid=${encodeURIComponent(slot[1])}"
          title="${day.label} ${slot[0]} 山車経路図"
          loading="${index === 0 ? "eager" : "lazy"}"
          referrerpolicy="no-referrer-when-downgrade"
          allowfullscreen
        ></iframe>
      </div>
    </article>`).join("");

  app.className = "site-shell";
  app.innerHTML = `
    <header class="festival-header">
      <div class="header-inner">
        <div class="crest" aria-hidden="true"><span>櫻</span></div>
        <div class="title-group">
          <p class="eyebrow">令和8年 鹿島神宮神幸祭</p>
          <h1>櫻町区 山車運行表</h1>
        </div>
      </div>
    </header>

    <nav class="day-tabs" aria-label="運行日を選択">${dayTabs}</nav>

    <section class="content-card" aria-labelledby="scheduleDate">
      <div class="date-heading">
        <div>
          <p class="section-kicker">山車経路</p>
          <h2 id="scheduleDate">${day.fullDate}</h2>
        </div>
        <div class="route-badge">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-6.1 7-13A7 7 0 1 0 5 9c0 6.9 7 13 7 13Z"></path><circle cx="12" cy="9" r="2.4"></circle></svg>
          <span>経路図</span>
        </div>
      </div>

      <p class="route-guide">経路図は時間順に並んでいます。下へスクロールしてご覧ください。</p>
      <div class="route-list">${routeMaps}</div>

      <p class="notice"><span aria-hidden="true">※</span>天候・運行状況などにより、経路や時間が変更になる場合があります。</p>

      <div class="bottom-day-section">
        <p class="bottom-day-guide">別の日の経路図を見る</p>
        <nav class="bottom-day-tabs" aria-label="ページ下部の日付選択">${dayTabs}</nav>
      </div>
    </section>

    <footer class="page-footer">
      <a class="back-button" href="../">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 7-5 5 5 5"></path></svg>
        <span>山車ナビに戻る</span>
      </a>
    </footer>`;

})();
