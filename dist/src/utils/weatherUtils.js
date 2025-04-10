// src/utils/weatherUtils.js

// Convert raw weather code to readable description (optional)
export const getReadableWeather = (code) => {
    const map = {
      '01d': 'Clear Sky (Day)',
      '01n': 'Clear Sky (Night)',
      '02d': 'Few Clouds',
      '02n': 'Few Clouds (Night)',
      '03d': 'Scattered Clouds',
      '04d': 'Broken Clouds',
      '09d': 'Shower Rain',
      '10d': 'Rain',
      '11d': 'Thunderstorm',
      '13d': 'Snow',
      '50d': 'Mist',
    };
    return map[code] || 'Unknown';
  };
  
  // Format date string to readable time like "Mon, 2 PM"
  export const formatForecastTime = (isoTime) => {
    const date = new Date(isoTime);
    const options = { weekday: 'short', hour: 'numeric', hour12: true };
    return date.toLocaleString('en-IN', options); // Adjust locale as needed
  };
  
  // Optionally round temperature
  export const formatTemp = (temp) => `${Math.round(temp)}°C`;
  
  // Extract main forecast from OpenWeather 3-hour data
  export const simplifyForecast = (forecastList) => {
    return forecastList.map((entry) => ({
      time: formatForecastTime(entry.dt_txt),
      temp: formatTemp(entry.main.temp),
      description: entry.weather[0].description,
      icon: entry.weather[0].icon,
    }));
  };
  