import React from 'react';
import './styles/dashboard.css';

const WeatherCard = ({ city, temperature, description, icon, time }) => {
  return (
    <div className="weather-card">
      <h4 className="weather-city">{city}</h4>
      {time && <p className="weather-time">{time}</p>}
      <img
        src={`http://openweathermap.org/img/wn/${icon}@2x.png`}
        alt="Weather Icon"
        className="weather-icon"
      />
      <p className="weather-temp">{temperature}°C</p>
      <p className="weather-desc">{description}</p>
    </div>
  );
};

export default WeatherCard;
