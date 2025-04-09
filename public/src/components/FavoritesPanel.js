import React, { useEffect, useState } from 'react';
import html2pdf from 'html2pdf.js';
import './FavoritesPanel.css';

const OPENWEATHER_API_KEY = 'YOUR_OPENWEATHER_API_KEY'; // Replace with actual key

const FavoritesPanel = () => {
  const [favorites, setFavorites] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [weatherData, setWeatherData] = useState({});
  const token = localStorage.getItem('token');

  // ✅ Fetch all favorite cities
  const fetchFavorites = async () => {
    try {
      const res = await fetch('https://your-backend.up.railway.app/api/favorites', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFavorites(data);
    } catch (err) {
      console.error('Failed to load favorites:', err);
    }
  };

  // 🌤 Fetch weather data for one city
  const fetchWeatherForCity = async (city, lat, lon) => {
    const url = lat && lon
      ? `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
      : `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      setWeatherData((prev) => ({ ...prev, [city]: data }));
    } catch (err) {
      console.error(`Weather fetch error for ${city}:`, err);
    }
  };

  // ❌ Remove from favorites
  const removeCity = async (city) => {
    try {
      await fetch(`https://your-backend.up.railway.app/api/favorites/${city}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites((prev) => prev.filter((f) => f.city !== city));
    } catch (err) {
      console.error('Remove city error:', err);
    }
  };

  // 📤 Export PDF
  const exportCityPDF = (city) => {
    const weather = weatherData[city.city];
    const element = document.createElement('div');
    element.innerHTML = `
      <h3>🌤 Weather Report - ${city.city}</h3>
      <p><strong>Country:</strong> ${city.country || '-'}</p>
      <p><strong>Latitude:</strong> ${city.lat || '-'}</p>
      <p><strong>Longitude:</strong> ${city.lon || '-'}</p>
      ${weather ? `<p><strong>Weather:</strong> ${weather.main.temp}°C - ${weather.weather[0].description}</p>` : ''}
    `;
    html2pdf().from(element).save(`${city.city}-weather.pdf`);
  };

  // 🔀 Drag functions
  const handleDragStart = (index) => setDraggedIndex(index);

  const handleDrop = (index) => {
    if (index === draggedIndex || draggedIndex === null) return;

    const reordered = [...favorites];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, moved);
    setFavorites(reordered);
    setDraggedIndex(null);
    updateOrderOnBackend(reordered);
  };

  const updateOrderOnBackend = async (reorderedList) => {
    try {
      const payload = reorderedList.map((fav, index) => ({
        id: fav._id,
        order: index
      }));

      await fetch('https://your-backend.up.railway.app/api/favorites/reorder', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reordered: payload })
      });
    } catch (error) {
      console.error('Reorder update failed:', error);
    }
  };

  // 📥 Load all cities & weather
  useEffect(() => {
    fetchFavorites();
  }, []);

  useEffect(() => {
    favorites.forEach((fav) => {
      if (!weatherData[fav.city]) {
        fetchWeatherForCity(fav.city, fav.lat, fav.lon);
      }
    });
  }, [favorites]);

  return (
    <div className="favorites-panel">
      <h3>🌆 Favorite Cities</h3>
      {favorites.length === 0 ? (
        <p>No favorite cities saved.</p>
      ) : (
        <ul className="favorite-list">
          {favorites.map((fav, index) => {
            const weather = weatherData[fav.city];
            return (
              <li
                key={fav._id}
                className="favorite-item"
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(index)}
              >
                <div className="fav-city-header">
                  <strong>{fav.city}</strong> {fav.country && `(${fav.country})`}
                  <button onClick={() => removeCity(fav.city)} className="remove-btn">❌</button>
                </div>
                {weather ? (
                  <div className="weather-preview">
                    <p>{weather.main.temp}°C - {weather.weather[0].description}</p>
                  </div>
                ) : (
                  <p>Loading weather...</p>
                )}
                <div className="favorite-actions">
                  <button onClick={() => exportCityPDF(fav)}>📤 Export</button>
                  <button onClick={() => window.location.href = `/forecast?city=${fav.city}`}>📍 Forecast</button>
                  <button onClick={() => window.location.href = `/route?city=${fav.city}`}>🧭 Route</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FavoritesPanel;
