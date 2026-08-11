(function () {
  "use strict";

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
        ["11:30–12:50", "198vNazs-OGaw2szb1b6RJ0paOr2oauw"],
        ["13:40–15:00", "1aVRi7Ed9P5YZxNEJSLOg2nV695fUNl4"],
        ["15:20–17:00", "1Q4RNYVSgucO-mLRKspDzCGe5ECwm-YA"],
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

  const timeButtons = day.slots.map((slot, index) => `
    <button class="time-button${index === 0 ? " active" : ""}" type="button" data-index="${index}" aria-pressed="${index === 0}">
      ${slot[0]}
    </button>`).join("");

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

      <div class="time-section">
        <p class="time-guide">時間帯を選んでください</p>
        <div class="time-buttons" role="group" aria-label="${day.label}の時間帯">${timeButtons}</div>
      </div>

      <div class="current-map-label" aria-live="polite">
        <span class="pulse-dot" aria-hidden="true"></span>
        <span id="currentMapText"></span>
      </div>

      <div class="map-frame">
        <iframe id="routeMap" title="${day.label} 山車経路図" loading="eager" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
      </div>

      <p class="notice"><span aria-hidden="true">※</span>天候・運行状況などにより、経路や時間が変更になる場合があります。</p>
    </section>

    <footer class="page-footer">
      <a class="back-button" href="../">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 7-5 5 5 5"></path></svg>
        <span>山車ナビに戻る</span>
      </a>
      <aside class="ad-rotator ad-rotator--inline" data-ad-rotator aria-label="広告">
        <a class="ad-rotator-link" href="https://www.koken-realestate.com/" target="_blank" rel="noopener noreferrer" aria-label="株式会社コウケンのウェブサイトを開く（新しいタブ）">
          <img class="ad-rotator-slide is-active" data-ad-slide src="../mark/ads/koken-01.png" alt="" decoding="async">
          <img class="ad-rotator-slide" data-ad-slide src="../mark/ads/koken-02.png" alt="" decoding="async">
          <img class="ad-rotator-slide" data-ad-slide src="../mark/ads/koken-03.png" alt="" decoding="async">
        </a>
      </aside>
    </footer>`;

  const mapFrame = document.getElementById("routeMap");
  const currentMapText = document.getElementById("currentMapText");
  const buttons = Array.from(document.querySelectorAll(".time-button"));

  function showSlot(index) {
    const slot = day.slots[index];
    mapFrame.src = `https://www.google.com/maps/d/embed?mid=${encodeURIComponent(slot[1])}`;
    mapFrame.title = `${day.label} ${slot[0]} 山車経路図`;
    currentMapText.textContent = `${day.label}　${slot[0]} の経路を表示中`;

    buttons.forEach((button, buttonIndex) => {
      const active = buttonIndex === index;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => showSlot(Number(button.dataset.index)));
  });

  showSlot(0);
})();
