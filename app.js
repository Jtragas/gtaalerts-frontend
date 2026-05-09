const sampleIncidents = [
  {
    id: 1,
    type: "fire",
    title: "Fire / rescue response",
    location: "Downtown Toronto",
    status: "Sample official-feed style alert",
    time: "8 min ago",
    confidence: "Official-style demo",
    lat: 43.6532,
    lng: -79.3832
  },
  {
    id: 2,
    type: "transit",
    title: "TTC service disruption",
    location: "Line 1 corridor",
    status: "Sample transit alert",
    time: "14 min ago",
    confidence: "Public transit demo",
    lat: 43.6590,
    lng: -79.3970
  },
  {
    id: 3,
    type: "road",
    title: "Road closure / traffic issue",
    location: "Gardiner Expressway area",
    status: "Sample road alert",
    time: "20 min ago",
    confidence: "Road-info demo",
    lat: 43.6380,
    lng: -79.4100
  },
  {
    id: 4,
    type: "weather",
    title: "Weather advisory",
    location: "GTA-wide",
    status: "Sample weather alert",
    time: "36 min ago",
    confidence: "Weather demo",
    lat: 43.7001,
    lng: -79.4163
  },
  {
    id: 5,
    type: "community",
    title: "Community report",
    location: "Scarborough area",
    status: "Unverified sample community report",
    time: "42 min ago",
    confidence: "Unverified community demo",
    lat: 43.7731,
    lng: -79.2578
  }
];

const typeLabels = {
  fire: "Fire / Rescue",
  transit: "TTC",
  road: "Road",
  weather: "Weather",
  community: "Community"
};

const typeColors = {
  fire: "#e5484d",
  transit: "#0f4c81",
  road: "#f6b21a",
  weather: "#6b5dd3",
  community: "#178c60"
};

let currentFilter = "all";
let activeId = null;

function mapUrl(lat = 43.6532, lng = -79.3832, zoom = 11) {
  const span = zoom >= 13 ? 0.025 : zoom >= 12 ? 0.05 : 0.16;
  const left = lng - span;
  const right = lng + span;
  const bottom = lat - span;
  const top = lat + span;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lng}`;
}

function getFilteredIncidents() {
  return currentFilter === "all"
    ? sampleIncidents
    : sampleIncidents.filter(item => item.type === currentFilter);
}

function setMap(item) {
  const mapFrame = document.getElementById("map-frame");
  const mapTitle = document.getElementById("map-title");
  const mapLocation = document.getElementById("map-location");

  if (!item) {
    mapFrame.src = mapUrl(43.6532, -79.3832, 10);
    mapTitle.textContent = "GTA overview";
    mapLocation.textContent = "Greater Toronto Area";
    return;
  }

  mapFrame.src = mapUrl(item.lat, item.lng, 13);
  mapTitle.textContent = item.title;
  mapLocation.textContent = item.location;
}

function renderList() {
  const filtered = getFilteredIncidents();
  const list = document.getElementById("incident-list");
  const count = document.getElementById("alert-count");

  count.textContent = filtered.length;

  list.innerHTML = filtered.map(item => `
    <button class="incident-item ${item.id === activeId ? "active" : ""}" data-id="${item.id}">
      <span class="badge" style="background:${typeColors[item.type] || "#0f4c81"}">${typeLabels[item.type] || item.type}</span>
      <strong>${item.title}</strong>
      <div class="incident-meta">
        ${item.location}<br>
        ${item.status}<br>
        ${item.time}
      </div>
    </button>
  `).join("");

  document.querySelectorAll(".incident-item").forEach(button => {
    button.addEventListener("click", () => {
      selectIncident(Number(button.dataset.id));
    });
  });
}

function renderSelected(item) {
  const panel = document.getElementById("selected-alert");

  if (!item) {
    panel.innerHTML = `<p class="empty-state">Click an alert card to see details here.</p>`;
    return;
  }

  panel.innerHTML = `
    <div class="detail-card">
      <span class="badge" style="background:${typeColors[item.type] || "#0f4c81"}">${typeLabels[item.type] || item.type}</span>
      <h4>${item.title}</h4>
      <p>${item.status}</p>
      <div class="detail-grid">
        <div>
          <span>Location</span>
          <strong>${item.location}</strong>
        </div>
        <div>
          <span>Time</span>
          <strong>${item.time}</strong>
        </div>
        <div>
          <span>Confidence</span>
          <strong>${item.confidence}</strong>
        </div>
        <div>
          <span>Action</span>
          <strong>Avoid if needed</strong>
        </div>
      </div>
    </div>
  `;
}

function selectIncident(id) {
  activeId = id;
  const item = sampleIncidents.find(incident => incident.id === id);
  renderList();
  renderSelected(item);
  setMap(item);
}

function renderAll() {
  activeId = null;
  renderList();
  renderSelected(null);

  const filtered = getFilteredIncidents();
  if (filtered.length === 1) {
    setMap(filtered[0]);
  } else {
    setMap(null);
  }
}

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    renderAll();
  });
});

window.addEventListener("load", () => {
  renderAll();
});
