// weatherMap.js - Handle map rendering and weather data fetching

const map = L.map('weather-map').setView([12.9716, 77.5946], 10); // Default to Bangalore

// Set up the map tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © OpenStreetMap contributors'
}).addTo(map);

// Add a sample marker
L.marker([12.9716, 77.5946]).addTo(map).bindPopup("You're here!").openPopup();

// Function to fetch weather data from the backend for a specific lat, lon
async function fetchWeather(lat, lon) {
    const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
    const data = await response.json();

    if (data.cod === 200) {
        const temp = data.main.temp;
        const description = data.weather[0].description;

        // Display weather data on the map
        document.getElementById('city-name').innerText = data.name;
        document.getElementById('temp').innerText = `${temp}°C`;
        document.getElementById('weather-desc').innerText = description;

        // Add a marker for the clicked location
        L.marker([lat, lon]).addTo(map)
            .bindPopup(`<b>${data.name}</b><br>${description}<br>${temp}°C`)
            .openPopup();
    } else {
        alert('Weather data not available for this location');
    }
}

// Handle map click event to fetch weather data for clicked location
map.on('click', function (e) {
    const lat = e.latlng.lat;
    const lon = e.latlng.lng;
    fetchWeather(lat, lon);
});

// Search functionality
document.getElementById('search-btn').addEventListener('click', function() {
    const city = document.getElementById('city-search').value;
    fetchCityWeather(city);
});

// Fetch weather by city name
async function fetchCityWeather(city) {
    const weatherAPIKey = 'YOUR_OPENWEATHERMAP_API_KEY'; // Replace with your OpenWeatherMap API key
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherAPIKey}&units=metric`;

    const response = await fetch(weatherUrl);
    const data = await response.json();

    if (data.cod === 200) {
        // Update map view to the searched city
        const lat = data.coord.lat;
        const lon = data.coord.lon;
        map.setView([lat, lon], 13);
        fetchWeather(lat, lon);
    } else {
        alert('City not found!');
    }
}

// Add location search with geocoding
document.getElementById('search-location-btn').addEventListener('click', async () => {
    const location = document.getElementById('location-input').value;
    if (!location) return;

    const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json`);
    const geoData = await geoRes.json();

    if (geoData.length > 0) {
        const { lat, lon } = geoData[0];
        map.setView([lat, lon], 10);
        L.marker([lat, lon]).addTo(map).bindPopup(location).openPopup();
        fetchWeather(lat, lon); // call your existing weather fetcher
    } else {
        alert("Location not found!");
    }
});