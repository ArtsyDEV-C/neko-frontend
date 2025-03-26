const map = L.map('weather-map').setView([12.9716, 77.5946], 10);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © OpenStreetMap contributors'
}).addTo(map);

async function fetchTrafficData(lat, lon) {
    const response = await fetch(`/api/traffic?lat=${lat}&lon=${lon}`);
    const data = await response.json();
    // Process and display traffic data on the map
    // Example: Add a marker for traffic data
    L.marker([lat, lon]).addTo(map)
        .bindPopup(`<b>Traffic Data</b><br>Speed: ${data.flowSegmentData.currentSpeed} km/h`)
        .openPopup();
}

map.on('click', function (e) {
    const lat = e.latlng.lat;
    const lon = e.latlng.lng;
    fetchTrafficData(lat, lon);
});