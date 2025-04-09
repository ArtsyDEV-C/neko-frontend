const map = L.map('weather-map').setView([12.9716, 77.5946], 10); // Default to Bangalore

// Base Layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Initial marker
let activeMarker = L.marker([12.9716, 77.5946]).addTo(map).bindPopup("You're here!").openPopup();

// Weather Overlay Layers (OpenWeatherMap)
const OPENWEATHER_API_KEY = '2149cbc5da7384b8ef7bcccf62b0bf68';
const weatherLayers = {
    temp: L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`, { opacity: 0.6 }),
    clouds: L.tileLayer(`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`, { opacity: 0.6 }),
    wind: L.tileLayer(`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`, { opacity: 0.6 }),
    rain: L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`, { opacity: 0.6 }),
};
let currentOverlay = null;

// Toggle weather overlay layers
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

// Weather data from backend by coordinates
async function fetchWeather(lat, lon) {
    const response = await fetch(`https://your-backend.up.railway.app/api/weather?lat=${lat}&lon=${lon}`);
    const data = await response.json();

    if (data.cod === 200) {
        const temp = data.main.temp;
        const description = data.weather[0].description;

        // Update panel
        document.getElementById('city-name').innerText = data.name;
        document.getElementById('temp').innerText = `${temp}°C`;
        document.getElementById('weather-desc').innerText = description;

        // Add or update marker
        if (activeMarker) map.removeLayer(activeMarker);
        activeMarker = L.marker([lat, lon]).addTo(map)
            .bindPopup(`<b>${data.name}</b><br>${description}<br>${temp}°C`)
            .openPopup();
    } else {
        alert('Weather data not available.');
    }
}

// Handle click on map
map.on('click', (e) => {
    const { lat, lng } = e.latlng;
    fetchWeather(lat, lng);
});

// City-based weather search via OpenWeatherMap
document.getElementById('search-btn').addEventListener('click', async () => {
    const city = document.getElementById('city-search').value;
    if (!city) return;

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const response = await fetch(weatherUrl);
    const data = await response.json();

    if (data.cod === 200) {
        const lat = data.coord.lat;
        const lon = data.coord.lon;
        map.setView([lat, lon], 13);
        fetchWeather(lat, lon);
    } else {
        alert('City not found.');
    }
});

// Location-based search using Nominatim (Geocoding)
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

