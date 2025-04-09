const map = L.map('weather-map').setView([12.9716, 77.5946], 10);

// 🗺️ Base Layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// 📍 Default marker
let activeMarker = L.marker([12.9716, 77.5946])
  .addTo(map)
  .bindPopup("You're here!")
  .openPopup();

// 🌦️ Weather Overlays (OpenWeatherMap)
const OPENWEATHER_API_KEY = '2149cbc5da7384b8ef7bcccf62b0bf68';

const weatherLayers = {
  temp: L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`, { opacity: 0.6 }),
  clouds: L.tileLayer(`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`, { opacity: 0.6 }),
  wind: L.tileLayer(`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`, { opacity: 0.6 }),
  rain: L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`, { opacity: 0.6 }),
};
let currentOverlay = null;

// 🔄 Toggle weather overlays
document.querySelectorAll(".layer-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.layer;
    if (currentOverlay) map.removeLayer(currentOverlay);
    if (weatherLayers[type]) {
      currentOverlay = weatherLayers[type];
      currentOverlay.addTo(map);
    }
  });
});

// 📡 Fetch weather from backend
async function fetchWeather(lat, lon) {
  const response = await fetch(`https://your-backend.up.railway.app/api/weather?lat=${lat}&lon=${lon}`);
  const data = await response.json();

  if (data.cod === 200) {
    const temp = data.main.temp;
    const description = data.weather[0].description;

    document.getElementById('city-name').innerText = data.name;
    document.getElementById('temp').innerText = `${temp}°C`;
    document.getElementById('weather-desc').innerText = description;

    if (activeMarker) map.removeLayer(activeMarker);
    activeMarker = L.marker([lat, lon]).addTo(map)
      .bindPopup(`<b>${data.name}</b><br>${description}<br>${temp}°C`)
      .openPopup();
  } else {
    alert('Weather data not available.');
  }
}

// 📍 Weather on map click
map.on('click', (e) => {
  const { lat, lng } = e.latlng;
  fetchWeather(lat, lng);
});

// 🔍 Search by city (OpenWeather API)
document.getElementById('search-btn').addEventListener('click', async () => {
  const city = document.getElementById('city-search').value;
  if (!city) return;

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.cod === 200) {
    const { lat, lon } = data.coord;
    map.setView([lat, lon], 13);
    fetchWeather(lat, lon);
  } else {
    alert('City not found.');
  }
});

// 🌍 Geocode Location Search
document.getElementById('search-location-btn').addEventListener('click', async () => {
  const location = document.getElementById('location-input').value;
  if (!location) return;

  const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json`);
  const geoData = await geoRes.json();

  if (geoData.length > 0) {
    const { lat, lon } = geoData[0];
    map.setView([lat, lon], 10);
    if (activeMarker) map.removeLayer(activeMarker);
    activeMarker = L.marker([lat, lon]).addTo(map).bindPopup(location).openPopup();
    fetchWeather(lat, lon);
  } else {
    alert("Location not found!");
  }
});


// 🛣️ ROUTE PLANNER (OpenRouteService)
const OPENROUTESERVICE_API_KEY = '5b3ce3597851110001cf62483f1332746348402c87c322558eefb9d3';
let routeLayer = null;
let routeMarkers = [];

async function geocode(location) {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json`);
  const data = await res.json();
  return data.length > 0 ? { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) } : null;
}

document.getElementById('route-btn').addEventListener('click', async () => {
  const from = document.getElementById('from-location').value;
  const to = document.getElementById('to-location').value;
  if (!from || !to) return alert("Please enter both locations.");

  // 🛣️ Route segments for styled visualization
const segments = data.features[0].geometry.coordinates;
const warnings = data.features[0].properties.segments[0].steps;

if (routeLayer) map.removeLayer(routeLayer);
if (routeMarkers.length > 0) routeMarkers.forEach(m => map.removeLayer(m));

// Color based on traffic warnings (simplified)
let styledCoords = [];
segments.forEach((coord, i) => {
  const latLng = [coord[1], coord[0]];
  styledCoords.push(latLng);
});

routeLayer = L.polyline(styledCoords, {
  color: 'orange', // Replace with dynamic color logic if needed
  weight: 5
}).addTo(map);
map.fitBounds(routeLayer.getBounds());

  const toCoords = await geocode(to);

  if (!fromCoords || !toCoords) return alert("Could not find one or both locations.");

  const body = { coordinates: [[fromCoords.lon, fromCoords.lat], [toCoords.lon, toCoords.lat]] };

  const res = await fetch("https://api.openrouteservice.org/v2/directions/driving-car", {
    method: "POST",
    headers: {
      "Authorization": OPENROUTESERVICE_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  const coords = data.features[0].geometry.coordinates.map(c => [c[1], c[0]]);
 const trafficSteps = data.features[0].properties.segments[0].steps;
const issues = trafficSteps
  .filter(step => step.road_class === "motorway" || step.road_class === "primary")
  .map(step => step.instruction);

if (issues.length > 0) {
  alert("🚧 Traffic Alert:\n" + issues.slice(0, 5).join('\n'));
}


  // Draw route
  if (routeLayer) map.removeLayer(routeLayer);
  routeLayer = L.polyline(coords, { color: 'blue', weight: 5 }).addTo(map);
  map.fitBounds(routeLayer.getBounds());

  // Markers
  routeMarkers.forEach(m => map.removeLayer(m));
  routeMarkers = [
    L.marker([fromCoords.lat, fromCoords.lon]).addTo(map).bindPopup("Start"),
    L.marker([toCoords.lat, toCoords.lon]).addTo(map).bindPopup("End")
  ];

  // Show route summary
  document.getElementById("route-summary").style.display = "block";
  document.getElementById("route-distance").innerText = `${(summary.distance / 1000).toFixed(1)} km`;
  document.getElementById("route-duration").innerText = `${Math.round(summary.duration / 60)} mins`;
});

  const data = await res.json();
  const coords = data.features[0].geometry.coordinates.map(c => [c[1], c[0]]); // flip for Leaflet

  if (routeLayer) map.removeLayer(routeLayer);
  routeLayer = L.polyline(coords, { color: 'blue' }).addTo(map);
  map.fitBounds(routeLayer.getBounds());

  // Add markers
  routeMarkers.forEach(m => map.removeLayer(m));
  routeMarkers = [
    L.marker([fromCoords.lat, fromCoords.lon]).addTo(map).bindPopup("Start").openPopup(),
    L.marker([toCoords.lat, toCoords.lon]).addTo(map).bindPopup("End")
  ];
});

// ❌ Clear Route
document.getElementById('clear-route-btn').addEventListener('click', () => {
  if (routeLayer) map.removeLayer(routeLayer);
  routeMarkers.forEach(m => map.removeLayer(m));
  routeLayer = null;
  routeMarkers = [];
});


// 🚦 LIVE TRAFFIC OVERLAY (TomTom)
const TOMTOM_API_KEY = 'PScRYLUY0qIa3AeY18UfnfeOQCP2yVlO';
const trafficLayer = L.tileLayer(`https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${TOMTOM_API_KEY}`, {
  opacity: 0.7
});
let trafficVisible = false;

document.getElementById("traffic-toggle-btn").addEventListener("click", () => {
  if (trafficVisible) {
    map.removeLayer(trafficLayer);
    trafficVisible = false;
    document.getElementById("traffic-toggle-btn").innerText = "🚗 Show Traffic";
  } else {
    trafficLayer.addTo(map);
    trafficVisible = true;
    document.getElementById("traffic-toggle-btn").innerText = "❌ Hide Traffic";
  }
});
