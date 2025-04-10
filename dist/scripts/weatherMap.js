const map = L.map('weather-map').setView([12.9716, 77.5946], 10);

// 🗺️ Base Tile Layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// 📍 Default Marker
let activeMarker = L.marker([12.9716, 77.5946])
  .addTo(map)
  .bindPopup("You're here!")
  .openPopup();

// 🌦️ Weather Overlay Layers
const OPENWEATHER_API_KEY = 'YOUR_OPENWEATHER_API_KEY'; // Replace with your key
const weatherLayers = {
  temp: L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`, { opacity: 0.6 }),
  clouds: L.tileLayer(`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`, { opacity: 0.6 }),
  wind: L.tileLayer(`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`, { opacity: 0.6 }),
  rain: L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`, { opacity: 0.6 }),
};
let currentOverlay = null;

// 🌐 Toggle Overlays
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

// 📡 Fetch Weather from Backend
async function fetchWeather(lat, lon) {
  const res = await fetch(`https://your-backend.up.railway.app/api/weather?lat=${lat}&lon=${lon}`);
  const data = await res.json();

  if (data.cod === 200) {
    document.getElementById('city-name').innerText = data.name;
    document.getElementById('temp').innerText = `${data.main.temp}°C`;
    document.getElementById('weather-desc').innerText = data.weather[0].description;

    if (activeMarker) map.removeLayer(activeMarker);
    activeMarker = L.marker([lat, lon]).addTo(map)
      .bindPopup(`<b>${data.name}</b><br>${data.weather[0].description}<br>${data.main.temp}°C`)
      .openPopup();
  } else {
    alert("Weather data unavailable.");
  }
}

// 🖱️ Click to Get Weather
map.on('click', (e) => {
  const { lat, lng } = e.latlng;
  fetchWeather(lat, lng);
});

// 🔍 City Search
document.getElementById('search-btn').addEventListener('click', async () => {
  const city = document.getElementById('city-search').value;
  if (!city) return;

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.cod === 200) {
    const { lat, lon } = data.coord;
    map.setView([lat, lon], 13);
    fetchWeather(lat, lon);
  } else {
    alert("City not found.");
  }
});

// 🗺️ Location Search by Name
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

// 📍 Geolocation Button
document.getElementById("geolocate-btn").addEventListener("click", () => {
  if (!navigator.geolocation) return alert("Geolocation not supported!");
  navigator.geolocation.getCurrentPosition((pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    map.setView([lat, lon], 13);
    fetchWeather(lat, lon);
  }, () => alert("Failed to get location."));
});

// 🛣️ Route Planner
const OPENROUTESERVICE_API_KEY = 'YOUR_OPENROUTESERVICE_API_KEY';
let routeLayer = null;
let routeMarkers = [];

async function geocode(place) {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json`);
  const data = await res.json();
  return data.length > 0 ? { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) } : null;
}

document.getElementById('route-btn').addEventListener('click', async () => {
  const from = document.getElementById('from-location').value;
  const to = document.getElementById('to-location').value;
  if (!from || !to) return alert("Enter both locations.");

  const fromCoords = await geocode(from);
  const toCoords = await geocode(to);
  if (!fromCoords || !toCoords) return alert("Invalid location(s).");

  const body = { coordinates: [[fromCoords.lon, fromCoords.lat], [toCoords.lon, toCoords.lat]] };

  const res = await fetch("https://api.openrouteservice.org/v2/directions/driving-car", {
    method: "POST",
    headers: {
      Authorization: OPENROUTESERVICE_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  const coords = data.features[0].geometry.coordinates.map(c => [c[1], c[0]]);
  const segment = data.features[0].properties.segments[0];

  if (routeLayer) map.removeLayer(routeLayer);
  routeMarkers.forEach(m => map.removeLayer(m));

  routeLayer = L.polyline(coords, { color: 'blue', weight: 5 }).addTo(map);
  map.fitBounds(routeLayer.getBounds());

  routeMarkers = [
    L.marker([fromCoords.lat, fromCoords.lon]).addTo(map).bindPopup("Start"),
    L.marker([toCoords.lat, toCoords.lon]).addTo(map).bindPopup("End")
  ];

  // Show distance/duration
  document.getElementById("route-summary").style.display = "block";
  document.getElementById("route-distance").innerText = `${(segment.distance / 1000).toFixed(1)} km`;
  document.getElementById("route-duration").innerText = `${Math.round(segment.duration / 60)} mins`;

  // 🚧 Traffic Alerts
  const issues = segment.steps.filter(s => ["motorway", "primary"].includes(s.road_class)).map(s => s.instruction);
  if (issues.length > 0) alert("🚧 Traffic Issues:\n" + issues.slice(0, 5).join("\n"));
});

// ❌ Clear Route
document.getElementById("clear-route-btn").addEventListener("click", () => {
  if (routeLayer) map.removeLayer(routeLayer);
  routeMarkers.forEach(m => map.removeLayer(m));
  routeLayer = null;
  routeMarkers = [];
  document.getElementById("route-summary").style.display = "none";
});

// 🚦 TomTom Live Traffic Toggle
const TOMTOM_API_KEY = 'YOUR_TOMTOM_API_KEY';
const trafficLayer = L.tileLayer(`https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${TOMTOM_API_KEY}`, {
  opacity: 0.7
});
let trafficVisible = false;

document.getElementById("traffic-toggle-btn").addEventListener("click", () => {
  if (trafficVisible) {
    map.removeLayer(trafficLayer);
    document.getElementById("traffic-toggle-btn").innerText = "🚗 Show Traffic";
  } else {
    trafficLayer.addTo(map);
    document.getElementById("traffic-toggle-btn").innerText = "❌ Hide Traffic";
  }
  trafficVisible = !trafficVisible;
});

// 📤 Export Weather Info
document.getElementById("export-weather-btn").addEventListener("click", () => {
  const name = document.getElementById("city-name").innerText;
  const temp = document.getElementById("temp").innerText;
  const desc = document.getElementById("weather-desc").innerText;
  const text = `City: ${name}\nTemperature: ${temp}\nDescription: ${desc}`;

  const blob = new Blob([text], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${name}-weather.txt`;
  link.click();
});
