import React, { useEffect, useState } from 'react';
import { getAuthToken } from '../utils/auth';
import './styles/dashboard.css';

const CurrentLocationWidget = () => {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchWeatherFromBackend = async (lat, lon) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch weather');
      const data = await res.json();
      setWeather(data);
    } catch (err) {
      setError('Could not fetch weather data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported in your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherFromBackend(latitude, longitude);
      },
      () => {
        setError('Permission denied. Please enable location access.');
        setLoading(false);
      }
    );
  }, []);

  if (loading) {
    return (
      <div className="widget-card loading">
        <p>Detecting your location...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="widget-card error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="widget-card">
      <h3>🌍 Current Location Weather</h3>
      {weather ? (
        <div className="weather-info">
          <p className="city-name">{weather.city}</p>
          <p className="temperature">{weather.temperature}°C</p>
          <p className="description">{weather.description}</p>
          <img
            src={`http://openweathermap.org/img/wn/${weather.icon}@2x.png`}
            alt="weather icon"
            className="weather-icon"
          />
        </div>
      ) : (
        <p>Weather data unavailable.</p>
      )}
    </div>
  );
};

export default CurrentLocationWidget;
