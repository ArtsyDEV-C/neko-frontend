// index.js – COMPLETE FINAL VERSION WITH ALL FEATURES AND FIXES

const apiKey = "2149cbc5da7384b8ef7bcccf62b0bf68"
const weatherURL = "https://api.openweathermap.org/data/2.5/weather";
const forecastURL = "https://api.openweathermap.org/data/2.5/forecast";
const airPollutionURL = "https://api.openweathermap.org/data/2.5/air_pollution";
const oneCallURL = "https://api.openweathermap.org/data/2.5/onecall";

const elements = {
  cityInput: document.getElementById("search-input"),
  searchBtn: document.getElementById("search-button"),
  forecast: document.getElementById("forecast-cards"),
  background: document.getElementById("weather-background"),
  catVideo: document.getElementById("cat-video"),
  music: document.getElementById("background-music"),
  cityName: document.getElementById("city-name"),
  dateTime: document.getElementById("date-time"),
  temp: document.getElementById("temperature"),
  description: document.getElementById("description"),
  icon: document.getElementById("weather-icon"),
  humidity: document.getElementById("humidity"),
  wind: document.getElementById("wind"),
  windDir: document.getElementById("wind-direction"),
  windArrow: document.getElementById("wind-arrow"),
  uvIndex: document.getElementById("uv-index"),
  sunrise: document.getElementById("sunrise"),
  sunset: document.getElementById("sunset"),
  hourlyForecast: document.getElementById("hourly-forecast"),
  aqi: document.getElementById("air-quality"),
  aqiMsg: document.getElementById("aqi-message"),
  alertBanner: document.getElementById("weather-alert-banner"),
  micBtn: document.getElementById("mic-button"),
  langSelect: document.getElementById("language-switcher"),
  themeSwitcher: document.getElementById("theme-switcher")
};

const savedLang = localStorage.getItem("selectedLanguage") || "en";
const savedCity = localStorage.getItem("lastCity") || "Chennai";
elements.langSelect.value = savedLang;
elements.themeSwitcher.value = localStorage.getItem("theme") || "theme-default";
document.body.className = elements.themeSwitcher.value;

const translations = {
  en: {
    language: "🌍 Language:",
    forecast: "10-Day Forecast",
    aqi: "Air Quality Index",
    uv: "UV Index",
    wind: "Wind",
    humidity: "Humidity",
    events: "Upcoming Weather Events"
  },
  hi: {
    language: "🌍 भाषा:",
    forecast: "10-दिवसीय पूर्वानुमान",
    aqi: "वायु गुणवत्ता सूचकांक",
    uv: "यूवी सूचकांक",
    wind: "पवन",
    humidity: "नमी",
    events: "आगामी मौसम घटनाएँ"
  },
  ta: {
    language: "🌍 மொழி:",
    forecast: "10 நாள் வானிலை",
    aqi: "காற்று தர மதிப்பெண்",
    uv: "UV குறியீடு",
    wind: "காற்று",
    humidity: "ஈரப்பதம்",
    events: "வரவுள்ள வானிலை நிகழ்வுகள்"
  }
};

function updateLabels(lang) {
  const t = translations[lang];

  const label = document.querySelector("label[for='language-switcher']");
  if (label) label.textContent = t.language;

  const forecast = document.querySelector(".forecast-section h2");
  if (forecast) forecast.textContent = t.forecast;

  const aqi = document.querySelector(".air-quality-section h2");
  if (aqi) aqi.textContent = t.aqi;

  const uv = document.querySelector(".uv-index-section h2");
  if (uv) uv.textContent = t.uv;

  const wind = document.querySelector(".wind-section h2");
  if (wind) wind.textContent = t.wind;

  const humidity = document.querySelector(".humidity-section h2");
  if (humidity) humidity.textContent = t.humidity;

  const events = document.querySelector(".events-section h2");
  if (events) events.textContent = t.events;
}


function checkMedia(path, fallback, target, type = "src") {
  fetch(path).then(res => {
    if (res.ok) {
      if (type === "src") target.src = path;
      else target.style.backgroundImage = `url('${path}')`;
    } else {
      if (type === "src") target.src = fallback;
      else target.style.backgroundImage = `url('${fallback}')`;
    }
    if (target.tagName === "VIDEO") target.load();
  });
}

async function fetchWeather(city) {
  const url = `${weatherURL}?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.cod !== 200) return alert("City not found.");
  renderWeather(data);
  fetchForecast(data.coord.lat, data.coord.lon);
  fetchAirQuality(data.coord.lat, data.coord.lon);
  fetchUVIndex(data.coord.lat, data.coord.lon);
}

function getTimeOfDay(timezoneOffsetInSeconds) {
  const utc = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
  const localTime = new Date(utc + 1000 * timezoneOffsetInSeconds);
  const hour = localTime.getHours();

  if (hour >= 6 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "evening";
  return "night";
}


function renderWeather(data) {
  const weather = data.weather[0];
  const rawCondition = weather.main.toLowerCase();

  const conditionMap = {
    clouds: "cloudy",
    clear: "clear",
    rain: "rainy",
    drizzle: "drizzle",
    snow: "snowy",
    mist: "mist",
    fog: "foggy",
    haze: "hazy",
    smoke: "smoke",
    dust: "dusty",
    sand: "sand",
    ash: "ash",
    squall: "squall",
    thunderstorm: "thunderstorm",
    tornado: "tornado"
  };
  const condition = conditionMap[rawCondition] || "clear";
  const time = getTimeOfDay(data.timezone);


  const bgPath = `images/${condition}/${time}.jpg`;
  const catPath = `videos/${condition}/${time}-cat.mp4`;
  const musicPath = `music/${condition}.mp3`;

  elements.cityName.innerText = data.name;
  elements.dateTime.innerText = new Date().toLocaleString();
  elements.temp.innerText = `${Math.round(data.main.temp)}°C`;
  elements.description.innerText = weather.description;
  elements.icon.src = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;

  checkMedia(bgPath, "images/default.jpg", elements.background, "backgroundImage");
  checkMedia(catPath, "videos/others/logo.mp4", elements.catVideo); 
  checkMedia(musicPath, "music/default.mp3", elements.music);

  elements.humidity.innerText = `${data.main.humidity}%`;
  elements.wind.innerText = `${data.wind.speed} m/s`;
  elements.windDir.innerText = `${data.wind.deg}°`;
  if (elements.windArrow) elements.windArrow.style.transform = `rotate(${data.wind.deg}deg)`;
  elements.sunrise.innerText = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
  elements.sunset.innerText = new Date(data.sys.sunset * 1000).toLocaleTimeString();
}


async function fetchForecast(lat, lon) {
  const res = await fetch(`${forecastURL}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
  const data = await res.json();
  renderHourlyForecast(data.list.slice(0, 10));
  renderDailyForecast(data.list);
}

function renderHourlyForecast(hours) {
  elements.hourlyForecast.innerHTML = "";
  hours.forEach(hour => {
    const card = document.createElement("div");
    card.className = "hour-card";
    card.innerHTML = `
      <p>${new Date(hour.dt * 1000).getHours()}:00</p>
      <img src="https://openweathermap.org/img/wn/${hour.weather[0].icon}.png" alt="" />
      <p>${Math.round(hour.main.temp)}°C</p>
    `;
    elements.hourlyForecast.appendChild(card);
  });
}

function renderDailyForecast(list) {
  const days = {};
  list.forEach(item => {
    const date = new Date(item.dt_txt).toDateString();
    if (!days[date]) days[date] = [];
    days[date].push(item);
  });

  elements.forecast.innerHTML = "";
  Object.keys(days).slice(0, 5).forEach(date => {
    const avg = days[date].reduce((a, b) => a + b.main.temp, 0) / days[date].length;
    const icon = days[date][0].weather[0].icon;
    const card = document.createElement("div");
    card.className = "forecast-card";
    card.innerHTML = `
      <p>${date}</p>
      <img src="https://openweathermap.org/img/wn/${icon}.png" alt="" />
      <p>${Math.round(avg)}°C</p>
    `;
    elements.forecast.appendChild(card);
  });
}

async function fetchAirQuality(lat, lon) {
  const res = await fetch(`${airPollutionURL}?lat=${lat}&lon=${lon}&appid=${apiKey}`);
  const data = await res.json();
  const aqi = data.list[0].main.aqi;
  elements.aqi.innerText = aqi;
  const msg = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
  if (elements.aqiMsg) elements.aqiMsg.innerText = `Health level: ${msg[aqi - 1]}`;
}

async function fetchUVIndex(lat, lon) {
  const res = await fetch(`${oneCallURL}?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&appid=${apiKey}`);
  const data = await res.json();
  elements.uvIndex.innerText = data.current.uvi;
}

elements.searchBtn.onclick = () => {
  const city = elements.cityInput.value.trim();
  if (city) {
    localStorage.setItem("lastCity", city);
    fetchWeather(city);
  }
};

document.querySelectorAll(".city-tag").forEach(tag => {
  tag.onclick = () => fetchWeather(tag.innerText);
});

const recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (recognition) {
  const mic = new recognition();
  mic.lang = savedLang === "hi" ? "hi-IN" : savedLang === "ta" ? "ta-IN" : "en-US";
  mic.interimResults = false;
  elements.micBtn.onclick = () => {
    elements.cityInput.disabled = true;
    elements.searchBtn.disabled = true;
    mic.start();
    elements.micBtn.classList.add("listening");
  };
  mic.onresult = e => {
    const transcript = e.results[0][0].transcript;
    elements.cityInput.value = transcript;
    fetchWeather(transcript);
    elements.cityInput.disabled = false;
    elements.searchBtn.disabled = false;
    elements.micBtn.classList.remove("listening");
  };
  mic.onerror = () => {
    alert("Voice recognition error");
    elements.micBtn.classList.remove("listening");
  };
}

elements.themeSwitcher.onchange = e => {
  document.body.className = e.target.value;
  localStorage.setItem("theme", e.target.value);
};

elements.langSelect.onchange = () => {
  const lang = elements.langSelect.value;
  localStorage.setItem("selectedLanguage", lang);
  updateLabels(lang);
};

const calendar = document.getElementById("weather-events");
function renderWeatherEvents() {
  const events = [
    { date: "2025-04-05", title: "Light Rain in South Chennai" },
    { date: "2025-04-06", title: "High UV Expected - Avoid Noon Sun" },
    { date: "2025-04-07", title: "Wind Advisory in Marina Beach" },
    { date: "2025-04-08", title: "Possible Thunderstorm Evening" }
  ];
  calendar.innerHTML = "";
  events.forEach(event => {
    const div = document.createElement("div");
    div.className = "calendar-event";
    div.innerHTML = `<strong>${event.date}</strong>: ${event.title}`;
    calendar.appendChild(div);
  });
}
renderWeatherEvents();

const socket = new WebSocket("wss://your-weather-alert-server.example/ws");
socket.onopen = () => socket.send(JSON.stringify({ type: "subscribe", city: savedCity }));
socket.onmessage = event => {
  try {
    const alert = JSON.parse(event.data);
    const level = alert.severity?.toLowerCase() || "info";
    elements.alertBanner.className = `alert-banner ${level}`;
    elements.alertBanner.innerText = `⚠️ ${alert.message}`;
    fetch("https://your-backend.com/send-whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: "your-recipient-number", message: alert.message })
    });
    if ("vibrate" in navigator) navigator.vibrate(400);
  } catch (e) {
    console.warn("Invalid alert format", e);
  }
};

fetchWeather(savedCity);
updateLabels(savedLang);
