// GTA Alerts - Connected to Live Backend
const API_URL = 'https://gta-alerts-production.up.railway.app';

let allIncidents = [];
let currentFilter = "all";
let activeId = null;

const typeLabels = {
  fire: "Fire / Rescue",
  police: "Police",
  ttc: "TTC",
  transit: "TTC",
  road: "Road",
  weather: "Weather",
  community: "Community"
};

const typeColors = {
  fire: "#e5484d",
  police: "#3b82f6",
  ttc: "#0f4c81",
  transit: "#0f4c81",
  road: "#f6b21a",
  weather: "#6b5dd3",
  community: "#178c60"
};

// Fetch incidents from backend
async function fetchIncidents() {
  try {
    console.log('📡 Fetching incidents from backend...');
    const response = await fetch(`${API_URL}/api/incidents`);
    const data = await response.json();
    
    if (data.success && data.incidents) {
      // Transform backend data to frontend format
      allIncidents = data.incidents.map(incident => ({
        id: incident.id,
        type: incident.category,
        title: incident.type || incident.description,
        location: incident.address || incident.location || 'Toronto',
        status: incident.description,
        time: formatTimeAgo(new Date(incident.time)),
        confidence: incident.source || 'Official',
        lat: incident.lat,
        lng: incident.lon
      }));
      
      console.log(`✅ Loaded ${allIncidents.length} incidents`);
      renderAll();
    } else {
      console.warn('⚠️ No incidents returned from API');
      allIncidents = [];
      renderAll();
    }
  } catch (error) {
    console.error('❌ Error fetching incidents:', error);
    allIncidents = [];
    renderAll();
  }
}

// Format time ago
function formatTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

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
    ? allIncidents
    : allIncidents.filter(item => item.type === currentFilter);
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

  if (filtered.length === 0) {
    list.innerHTML = '<p class="empty-state" style="padding: 20px; text-align: center; color: #667085;">No active incidents</p>';
    return;
  }

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
      selectIncident(button.dataset.id);
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
          <span>Source</span>
          <strong>${item.confidence}</strong>
        </div>
        <div>
          <span>Action</span>
          <strong>Stay informed</strong>
        </div>
      </div>
    </div>
  `;
}

function selectIncident(id) {
  activeId = id;
  const item = allIncidents.find(incident => incident.id === id);
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
  console.log('🚀 GTA Alerts loading...');
  fetchIncidents();
  
  // Auto-refresh every 5 minutes
  setInterval(() => {
    console.log('🔄 Auto-refreshing incidents...');
    fetchIncidents();
  }, 5 * 60 * 1000);
});
