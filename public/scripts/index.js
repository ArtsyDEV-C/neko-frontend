// index.js – FINAL with all features fully integrated

const apiKey = "YOUR_API_KEY_HERE";
const weatherURL = "https://api.openweathermap.org/data/2.5/weather";
const forecastURL = "https://api.openweathermap.org/data/2.5/forecast";
const airPollutionURL = "https://api.openweathermap.org/data/2.5/air_pollution";
const oneCallURL = "https://api.openweathermap.org/data/3.0/onecall";

const elements = {
  cityInput: document.getElementById("search-input"),
  searchBtn: document.getElementById("search-button"),
  forecast: document.getElementById("forecast"),
  background: document.getElementById("weather-background"),
  catVideo: document.getElementById("cat-video"),
  music: document.getElementById("weather-music"),
  cityName: document.getElementById("city-name"),
  dateTime: document.getElementById("date-time"),
  temp: document.getElementById("weather-temperature"),
  description: document.getElementById("weather-description"),
  icon: document.getElementById("weather-icon"),
  humidity: document.getElementById("humidity"),
  wind: document.getElementById("wind-speed"),
  windDir: document.getElementById("wind-degree"),
  windArrow: document.getElementById("wind-arrow"),
  uvIndex: document.getElementById("uv-index"),
  sunrise: document.getElementById("sunrise"),
  sunset: document.getElementById("sunset"),
  hourlyForecast: document.getElementById("hourly-forecast"),
  aqi: document.getElementById("aqi-value"),
  aqiMsg: document.getElementById("aqi-message"),
  alertBanner: document.getElementById("weather-alert-banner"),
  micBtn: document.getElementById("mic-button"),
  langSelect: document.getElementById("language-select"),
  darkToggle: document.getElementById("dark-mode-toggle")
};

function getTimeOfDay() {
  const hour = new Date().getHours();
  return hour >= 5 && hour < 12 ? "day" : hour >= 12 && hour < 18 ? "evening" : "night";
}

async function fetchWeather(city) {
  const url = `${weatherURL}?q=${city}&appid=${apiKey}&units=metric`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.cod !== 200) return alert("City not found.");
  renderWeather(data);
  fetchForecast(data.coord.lat, data.coord.lon);
  fetchAirQuality(data.coord.lat, data.coord.lon);
  fetchUVIndex(data.coord.lat, data.coord.lon);
}

function renderWeather(data) {
  const weather = data.weather[0];
  const condition = weather.main.toLowerCase();
  const time = getTimeOfDay();
  const bgPath = `images/${condition}/${time}.jpg`;
  const catPath = `videos/${condition}/${time}-cat.mp4`;
  const musicPath = `music/${condition}.mp3`;

  elements.cityName.innerText = data.name;
  elements.dateTime.innerText = new Date().toLocaleString();
  elements.temp.innerText = `${Math.round(data.main.temp)}°C`;
  elements.description.innerText = weather.description;
  elements.icon.src = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;

  fetch(bgPath).then(res => {
    if (res.ok) {
      elements.background.style.backgroundImage = `url('${bgPath}')`;
    } else {
      elements.background.style.backgroundImage = "url('images/default.jpg')";
    }
  });

  fetch(catPath).then(res => {
    if (res.ok) {
      elements.catVideo.src = catPath;
    } else {
      elements.catVideo.src = "videos/default-cat.mp4";
    }
  });

  fetch(musicPath).then(res => {
    if (res.ok) {
      elements.music.src = musicPath;
      elements.music.play();
    } else {
      elements.music.src = "music/default.mp3";
      elements.music.play();
    }
  });

  elements.humidity.innerText = `${data.main.humidity}%`;
  elements.wind.innerText = `${data.wind.speed} m/s`;
  elements.windDir.innerText = `${data.wind.deg}`;
  elements.windArrow.style.transform = `rotate(${data.wind.deg}deg)`;
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
  hours.forEach((hour) => {
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
  elements.aqiMsg.innerText = `Health level: ${msg[aqi - 1]}`;
}

async function fetchUVIndex(lat, lon) {
  const res = await fetch(`${oneCallURL}?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&appid=${apiKey}`);
  const data = await res.json();
  elements.uvIndex.innerText = data.current.uvi;
}

// Search + Quick City Tags
elements.searchBtn.onclick = () => {
  const city = elements.cityInput.value.trim();
  if (city) {
    localStorage.setItem("lastCity", city);
    fetchWeather(city);
  }
};
document.querySelectorAll(".city-tag").forEach(btn => {
  btn.onclick = () => fetchWeather(btn.innerText);
});

// Location Event
window.addEventListener("fetch-weather-location", (e) => {
  const { lat, lon } = e.detail;
  fetchWeatherByCoords(lat, lon);
});

async function fetchWeatherByCoords(lat, lon) {
  const url = `${weatherURL}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  const res = await fetch(url);
  const data = await res.json();
  renderWeather(data);
  fetchForecast(lat, lon);
  fetchAirQuality(lat, lon);
  fetchUVIndex(lat, lon);
}

// 🎙️ Real ASR Voice Mic Integration
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

  mic.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    elements.cityInput.value = transcript;
    fetchWeather(transcript);
    elements.micBtn.classList.remove("listening");
elements.cityInput.disabled = false;
elements.searchBtn.disabled = false;
  };

  mic.onerror = () => {
    alert("Voice recognition error. Try again.");
    elements.micBtn.classList.remove("listening");
  };
} else {
  elements.micBtn.onclick = () => alert("Speech recognition not supported in this browser.");
}
};

// 🌘 Dark Mode Toggle
elements.darkToggle.onchange = () => {
  document.body.classList.toggle("dark-mode", elements.darkToggle.checked);
};

// 🌐 Language Switcher Logic (Basic Demo)
const translations = {
  en: {
    temperature: "Temperature",
    humidity: "Humidity",
    wind: "Wind",
    sunrise: "Sunrise",
    sunset: "Sunset",
    forecast: "10-Day Forecast",
    hourly: "Hourly Forecast",
    aqi: "Air Quality Index (AQI)",
    windDir: "Wind Direction",
    events: "Upcoming Weather Events",
    language: "🌍 Language:"
  },
  hi: {
    temperature: "तापमान",
    humidity: "नमी",
    wind: "हवा",
    sunrise: "सूर्योदय",
    sunset: "सूर्यास्त",
    forecast: "10-दिवसीय पूर्वानुमान",
    hourly: "प्रति घंटा पूर्वानुमान",
    aqi: "वायु गुणवत्ता सूचकांक",
    windDir: "पवन दिशा",
    events: "आगामी मौसम कार्यक्रम",
    language: "🌍 भाषा:"
  },
  ta: {
    temperature: "வெப்பநிலை",
    humidity: "ஈரப்பதம்",
    wind: "காற்று",
    sunrise: "சூரிய உதயம்",
    sunset: "சூரிய அஸ்தமனம்",
    forecast: "10 நாள் வானிலை முன்னறிவு",
    hourly: "மணிநேர வானிலை",
    aqi: "காற்று தர மதிப்பீடு",
    windDir: "காற்று திசை",
    events: "வரவுள்ள வானிலை நிகழ்வுகள்",
    language: "🌍 மொழி:"
  }
};

function updateLabels(lang) {
  const t = translations[lang];
  document.querySelector("label[for='language-select']").textContent = t.language;
  document.querySelector("#weather-temperature").previousElementSibling.textContent = t.temperature;
  document.querySelector("#humidity").parentElement.innerHTML = `<i class='fas fa-water'></i> <strong>${t.humidity}:</strong> <span id='humidity'>${elements.humidity.innerText}</span>`;
  document.querySelector("#wind-speed").parentElement.innerHTML = `<i class='fas fa-wind'></i> <strong>${t.wind}:</strong> <span id='wind-speed'>${elements.wind.innerText}</span>`;
  document.querySelector("#sunrise").parentElement.innerHTML = `<i class='fas fa-arrow-up'></i> <strong>${t.sunrise}:</strong> <span id='sunrise'>${elements.sunrise.innerText}</span>`;
  document.querySelector("#sunset").parentElement.innerHTML = `<i class='fas fa-arrow-down'></i> <strong>${t.sunset}:</strong> <span id='sunset'>${elements.sunset.innerText}</span>`;
  document.querySelector(".forecast-section h2").textContent = t.forecast;
  document.querySelector(".hourly-slider h2, .hourly-slider h3").textContent = t.hourly;
  document.querySelector(".air-quality-section h2").textContent = t.aqi;
  document.querySelector(".wind-compass-section h2").textContent = t.windDir;
  document.querySelector(".weather-events-section h2").textContent = t.events;
}:</strong> <span id='humidity'>${elements.humidity.innerText}</span>`;
  document.querySelector("#wind-speed").parentElement.innerHTML = `<i class='fas fa-wind'></i> <strong>${t.wind}:</strong> <span id='wind-speed'>${elements.wind.innerText}</span>`;
  document.querySelector("#sunrise").parentElement.innerHTML = `<i class='fas fa-arrow-up'></i> <strong>${t.sunrise}:</strong> <span id='sunrise'>${elements.sunrise.innerText}</span>`;
  document.querySelector("#sunset").parentElement.innerHTML = `<i class='fas fa-arrow-down'></i> <strong>${t.sunset}:</strong> <span id='sunset'>${elements.sunset.innerText}</span>`;
}

elements.langSelect.onchange = () => updateLabels(elements.langSelect.value);
};

// 🚨 Live Alert via WebSocket with Severity
const socket = new WebSocket("wss://your-weather-alert-server.example/ws");
socket.onopen = () => socket.send(JSON.stringify({ type: "subscribe", city: savedCity }));
socket.onmessage = (event) => {
  try {
    const alert = JSON.parse(event.data);
    const level = alert.severity?.toLowerCase() || "info";
    elements.alertBanner.className = `alert-banner ${level}`;
    elements.alertBanner.innerText = `⚠️ ${alert.message}`;

    // Optional: Push WhatsApp message (placeholder)
    fetch("https://your-backend.com/send-whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: "your-recipient-number",
        message: alert.message
      })
    });

    // Optional mobile vibration
    if ("vibrate" in navigator) navigator.vibrate(400);
  } catch (e) {
    console.warn("Invalid alert format", e);
  }
}; // Replace with your alert backend WS endpoint
socket.onopen = () => {
  socket.send("Requesting weather alert updates");
};
socket.onmessage = (event) => {
  elements.alertBanner.innerText = `⚠️ ${event.data}`;
};

// Auto-load default city from localStorage or fallback
const savedCity = localStorage.getItem("lastCity") || "Chennai";
fetchWeather(savedCity);

// 🌍 Remember selected language
const savedLang = localStorage.getItem("selectedLanguage") || "en";
elements.langSelect.value = savedLang;
updateLabels(savedLang);

elements.langSelect.onchange = () => {
  localStorage.setItem("selectedLanguage", elements.langSelect.value);
  updateLabels(elements.langSelect.value);
};
