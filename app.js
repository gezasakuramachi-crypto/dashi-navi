(() => {
  "use strict";

  const config = window.DASHI_NAVI_CONFIG;
  if (!config) {
    throw new Error("config.jsを読み込めませんでした。");
  }

  const elements = {
    connectionStatus: document.getElementById("connectionStatus"),
    setupMessage: document.getElementById("setupMessage"),
    setupDetail: document.getElementById("setupDetail"),
    townSelector: document.getElementById("townSelector"),
    mapNotice: document.getElementById("mapNotice"),
    refreshButton: document.getElementById("refreshButton"),
    dashiButton: document.getElementById("dashiButton"),
    trafficButton: document.getElementById("trafficButton"),
    locationButton: document.getElementById("locationButton"),
    guideButton: document.getElementById("guideButton"),
    trafficDialog: document.getElementById("trafficDialog"),
    guideDialog: document.getElementById("guideDialog"),
    sponsorLink: document.getElementById("sponsorLink"),
    sponsorImage: document.getElementById("sponsorImage"),
    sponsorPlaceholder: document.getElementById("sponsorPlaceholder"),
  };

  const enabledTowns = config.towns.filter((town) => town.enabled);
  const townsById = new Map(config.towns.map((town) => [town.id, town]));
  const markers = new Map();
  const positions = new Map();

  let googleMap = null;
  let AdvancedMarkerElement = null;
  let PinElement = null;
  let infoWindow = null;
  let currentLocationMarker = null;
  let refreshTimer = null;
  let requestInProgress = false;

  function setStatus(kind, text) {
    elements.connectionStatus.className = `status-pill status-${kind}`;
    elements.connectionStatus.textContent = text;
  }

  function showSetupMessage(detail) {
    elements.setupDetail.textContent = detail;
    elements.setupMessage.hidden = false;
  }

  function hideSetupMessage() {
    elements.setupMessage.hidden = true;
  }

  function showNotice(text) {
    elements.mapNotice.textContent = text;
    elements.mapNotice.classList.toggle("is-visible", Boolean(text));
  }

  function formatJstTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "時刻不明";

    return new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  }

  function isFresh(recordedAt) {
    const recordedTime = new Date(recordedAt).getTime();
    return Number.isFinite(recordedTime)
      && Date.now() - recordedTime <= config.staleAfterMs;
  }

  function createTownSelector() {
    elements.townSelector.replaceChildren();

    for (const town of enabledTowns) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "town-chip";
      button.dataset.townId = town.id;
      button.textContent = town.name;
      button.style.setProperty("--town-color", town.color);
      button.addEventListener("click", () => focusTown(town.id));
      elements.townSelector.appendChild(button);
    }
  }

  function setupSponsor() {
    const ad = config.ads.find((item) => item.enabled !== false);
    if (!ad || !ad.imageUrl) {
      elements.sponsorLink.removeAttribute("href");
      elements.sponsorLink.removeAttribute("target");
      return;
    }

    elements.sponsorImage.src = ad.imageUrl;
    elements.sponsorImage.alt = ad.alt || "協賛広告";
    elements.sponsorImage.hidden = false;
    elements.sponsorPlaceholder.hidden = true;

    if (ad.href) {
      elements.sponsorLink.href = ad.href;
      elements.sponsorLink.target = "_blank";
    } else {
      elements.sponsorLink.removeAttribute("href");
    }
  }

  function loadGoogleMaps() {
    return new Promise((resolve, reject) => {
      if (window.google?.maps) {
        resolve();
        return;
      }

      const apiKey = config.map.googleMapsApiKey.trim();
      if (!apiKey) {
        reject(new Error("Google Maps APIキーが未設定です。"));
        return;
      }

      const script = document.createElement("script");
      const params = new URLSearchParams({
        key: apiKey,
        v: "weekly",
        loading: "async",
      });
      script.src = `https://maps.googleapis.com/maps/api/js?${params}`;
      script.async = true;
      script.onerror = () => reject(new Error("Google Mapsを読み込めませんでした。"));
      script.onload = resolve;
      document.head.appendChild(script);
    });
  }

  async function initializeMap() {
    const { Map: GoogleMap } = await google.maps.importLibrary("maps");
    ({ AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker"));

    googleMap = new GoogleMap(document.getElementById("map"), {
      center: config.map.center,
      zoom: config.map.zoom,
      mapId: config.map.mapId || "DEMO_MAP_ID",
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      clickableIcons: false,
      gestureHandling: "greedy",
    });

    infoWindow = new google.maps.InfoWindow();
    googleMap.addListener("click", () => infoWindow.close());
    hideSetupMessage();
  }

  function createInfoContent(town, position) {
    const wrapper = document.createElement("div");
    wrapper.className = "marker-info";

    const title = document.createElement("strong");
    title.textContent = `${town.name}の山車`;

    const status = document.createElement("span");
    status.className = isFresh(position.recordedAt) ? "marker-online" : "marker-stale";
    status.textContent = isFresh(position.recordedAt) ? "位置更新中" : "更新停止中";

    const time = document.createElement("small");
    time.textContent = `最終更新 ${formatJstTime(position.recordedAt)}`;

    const route = document.createElement("a");
    route.href = `https://www.google.com/maps/dir/?api=1&destination=${position.latitude},${position.longitude}&travelmode=walking`;
    route.target = "_blank";
    route.rel = "noopener";
    route.textContent = "ここまでの経路を見る";

    wrapper.append(title, status, time, route);
    return wrapper;
  }

  function updateTownMarker(position) {
    const town = townsById.get(position.townId);
    if (!town || !town.enabled || !googleMap) return;

    const markerPosition = {
      lat: Number(position.latitude),
      lng: Number(position.longitude),
    };

    if (!Number.isFinite(markerPosition.lat) || !Number.isFinite(markerPosition.lng)) {
      return;
    }

    positions.set(town.id, { ...position, ...markerPosition });
    let marker = markers.get(town.id);

    if (!marker) {
      const pin = new PinElement({
        background: town.color,
        borderColor: "#ffffff",
        glyphColor: "#ffffff",
        glyphText: town.markerLabel || town.name.slice(0, 1),
        scale: 1.18,
      });

      marker = new AdvancedMarkerElement({
        map: googleMap,
        position: markerPosition,
        title: `${town.name}の山車`,
        gmpClickable: true,
      });
      marker.append(pin);

      marker.addEventListener("gmp-click", () => {
        const latestPosition = positions.get(town.id);
        if (!latestPosition) return;
        infoWindow.setContent(createInfoContent(town, latestPosition));
        infoWindow.open({ map: googleMap, anchor: marker });
      });

      markers.set(town.id, marker);
    } else {
      marker.position = markerPosition;
    }
  }

  function normalizePositionPayload(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.positions)) return payload.positions;
    throw new Error("位置情報APIの形式が正しくありません。");
  }

  async function refreshPositions({ silent = false } = {}) {
    if (requestInProgress || !googleMap) return;

    if (!config.positionApiUrl) {
      setStatus("waiting", "位置API準備中");
      if (!silent) showNotice("位置情報APIは次の工程で接続します。");
      return;
    }

    requestInProgress = true;
    elements.refreshButton.classList.add("is-spinning");

    try {
      const response = await fetch(config.positionApiUrl, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`位置情報を取得できませんでした（${response.status}）`);
      }

      const payload = await response.json();
      const receivedPositions = normalizePositionPayload(payload);
      receivedPositions.forEach(updateTownMarker);

      const freshCount = receivedPositions.filter((position) => isFresh(position.recordedAt)).length;
      setStatus(freshCount > 0 ? "online" : "stale", freshCount > 0 ? "位置更新中" : "更新待ち");
      showNotice(`最終確認 ${formatJstTime(payload.updatedAt || Date.now())}`);
    } catch (error) {
      console.error(error);
      setStatus("error", "接続エラー");
      if (!silent) showNotice(error.message);
    } finally {
      requestInProgress = false;
      elements.refreshButton.classList.remove("is-spinning");
    }
  }

  function focusTown(townId) {
    const position = positions.get(townId);
    if (!googleMap) return;

    document.querySelectorAll(".town-chip").forEach((chip) => {
      chip.classList.toggle("is-selected", chip.dataset.townId === townId);
    });

    if (!position) {
      showNotice(`${townsById.get(townId)?.name || "山車"}の位置はまだ届いていません。`);
      return;
    }

    googleMap.panTo({ lat: position.latitude, lng: position.longitude });
    googleMap.setZoom(Math.max(googleMap.getZoom() || 0, 16));
  }

  function focusAllTowns() {
    if (!googleMap) return;

    const visiblePositions = [...positions.values()];
    if (visiblePositions.length === 0) {
      googleMap.panTo(config.map.center);
      googleMap.setZoom(config.map.zoom);
      showNotice("山車の位置を待っています。");
      return;
    }

    if (visiblePositions.length === 1) {
      focusTown(visiblePositions[0].townId);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    visiblePositions.forEach((position) => {
      bounds.extend({ lat: position.latitude, lng: position.longitude });
    });
    googleMap.fitBounds(bounds, 48);
  }

  function showCurrentLocation() {
    if (!googleMap) {
      showNotice("地図の準備が完了していません。");
      return;
    }

    if (!navigator.geolocation) {
      showNotice("この端末では現在地を取得できません。");
      return;
    }

    showNotice("現在地を確認しています…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const position = { lat: coords.latitude, lng: coords.longitude };

        if (!currentLocationMarker) {
          const pin = new PinElement({
            background: "#1a73e8",
            borderColor: "#ffffff",
            glyphColor: "#ffffff",
            glyphText: "●",
          });
          currentLocationMarker = new AdvancedMarkerElement({
            map: googleMap,
            position,
            title: "現在地",
          });
          currentLocationMarker.append(pin);
        } else {
          currentLocationMarker.position = position;
        }

        googleMap.panTo(position);
        googleMap.setZoom(Math.max(googleMap.getZoom() || 0, 16));
        showNotice(`現在地の精度 約${Math.round(coords.accuracy)}m`);
      },
      () => showNotice("現在地を取得できませんでした。端末の位置情報設定をご確認ください。"),
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 10000,
      },
    );
  }

  function openDialog(dialog) {
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
  }

  function bindEvents() {
    elements.refreshButton.addEventListener("click", () => refreshPositions());
    elements.dashiButton.addEventListener("click", focusAllTowns);
    elements.locationButton.addEventListener("click", showCurrentLocation);
    elements.trafficButton.addEventListener("click", () => openDialog(elements.trafficDialog));
    elements.guideButton.addEventListener("click", () => openDialog(elements.guideDialog));

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        refreshPositions({ silent: true });
      }
    });
  }

  async function start() {
    createTownSelector();
    setupSponsor();
    bindEvents();
    setStatus("waiting", "地図準備中");

    try {
      await loadGoogleMaps();
      await initializeMap();
      await refreshPositions({ silent: true });
      refreshTimer = window.setInterval(
        () => refreshPositions({ silent: true }),
        config.pollIntervalMs,
      );
    } catch (error) {
      console.warn(error.message);
      setStatus("waiting", "開発準備中");
      showSetupMessage("Google Mapsの公開設定後に、ここへ地図を表示します。");
    }
  }

  window.addEventListener("pagehide", () => {
    if (refreshTimer) window.clearInterval(refreshTimer);
  });

  start();
})();
