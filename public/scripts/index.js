const apiKey = "2149cbc5da7384b8ef7bcccf62b0bf68"; // Replace with your API key

const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const cityNameEl = document.getElementById('city-name');
const dateTimeEl = document.getElementById('date-time');
const weatherIconEl = document.getElementById('weather-icon');
const temperatureEl = document.getElementById('weather-temperature');
const descriptionEl = document.getElementById('weather-description');
const forecastEl = document.getElementById('forecast');
const backgroundVideo = document.getElementById('weather-video');
const musicPlayer = document.getElementById('weather-music');

const windSpeedEl = document.getElementById('wind-speed');
const humidityEl = document.getElementById('humidity');
const uvIndexEl = document.getElementById('uv-index');
const pressureEl = document.getElementById('pressure');
const sunriseEl = document.getElementById('sunrise');
const sunsetEl = document.getElementById('sunset');
const localTimeEl = document.getElementById('local-time');
const istTimeEl = document.getElementById('ist-time');

// Handle search
searchButton.addEventListener('click', () => {
  const city = searchInput.value.trim();
  if (city) {
    fetchWeather(city);
  }
});

// Main function
async function fetchWeather(city) {
  try {
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`;
    const geoData = await (await fetch(geoUrl)).json();
    if (!geoData.length) throw new Error('City not found');

    const { lat, lon, name, country } = geoData[0];
    const weatherUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&appid=${apiKey}`;
    const weatherData = await (await fetch(weatherUrl)).json();

    updateCurrentWeather(weatherData.current, name, country, weatherData.timezone_offset);
    updateForecast(weatherData.daily);
    updateMedia(weatherData.current.weather[0].main.toLowerCase());

  } catch (err) {
    alert('Error: ' + err.message);
  }
}

// Current Weather Display
function updateCurrentWeather(current, city, country, tzOffset) {
  cityNameEl.textContent = `${city}, ${country}`;
  dateTimeEl.textContent = new Date(current.dt * 1000).toLocaleString();
  temperatureEl.textContent = `${Math.round(current.temp)}°C`;
  descriptionEl.textContent = current.weather[0].description;

  weatherIconEl.innerHTML = `<img src="https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png" alt="Weather Icon">`;

  windSpeedEl.textContent = `${current.wind_speed} m/s`;
  humidityEl.textContent = `${current.humidity}%`;
  uvIndexEl.textContent = current.uvi;
  pressureEl.textContent = `${current.pressure} hPa`;
  sunriseEl.textContent = new Date(current.sunrise * 1000).toLocaleTimeString();
  sunsetEl.textContent = new Date(current.sunset * 1000).toLocaleTimeString();

  // Time
  const localTime = new Date(Date.now() + tzOffset * 1000);
  localTimeEl.textContent = localTime.toLocaleTimeString();
  istTimeEl.textContent = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });
}

// 10-Day Forecast
function updateForecast(daily) {
  forecastEl.innerHTML = '';
  daily.slice(0, 10).forEach(day => {
    const dayName = new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
    const icon = day.weather[0].icon;
    const max = Math.round(day.temp.max);
    const min = Math.round(day.temp.min);
    forecastEl.innerHTML += `
      <div class="forecast-day">
        <div>${dayName}</div>
        <img src="https://openweathermap.org/img/wn/${icon}.png" alt="Icon">
        <div>${max}° / ${min}°</div>
      </div>
    `;
  });
}

// Dynamic Background + Media
function updateMedia(weatherType) {
  const backgrounds = {
    clear: 'clear.jpg',
    clouds: 'cloudy.jpg',
    rain: 'rain.jpg',
    thunderstorm: 'storm.jpg',
    snow: 'snow.jpg',
    drizzle: 'drizzle.jpg',
    mist: 'mist.jpg',
    fog: 'fog.jpg',
    haze: 'haze.jpg'
  };

  const cats = {
    clear: 'cat-sunny.mp4',
    clouds: 'cat-cloudy.mp4',
    rain: 'cat-rainy.mp4',
    thunderstorm: 'cat-thunder.mp4',
    snow: 'cat-snowy.mp4'
  };

  const music = {
    clear: 'clear.mp3',
    clouds: 'clouds.mp3',
    rain: 'rain.mp3',
    thunderstorm: 'storm.mp3',
    snow: 'snow.mp3'
  };

  document.body.style.backgroundImage = `url('/images/${backgrounds[weatherType] || 'default.jpg'}')`;

  backgroundVideo.src = `/videos/${cats[weatherType] || 'default.mp4'}`;
  backgroundVideo.load();
  backgroundVideo.play();

  musicPlayer.src = `/music/${music[weatherType] || 'default.mp3'}`;
  musicPlayer.load();
  musicPlayer.play();
}
