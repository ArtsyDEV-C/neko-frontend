// business.js – Final Optimized Version

const scenarioContainer = document.getElementById("scenario-container");
const industrySelect = document.getElementById("industry-select");
const cityInput = document.getElementById("city-input");
const cityButton = document.getElementById("city-button");
const background = document.getElementById("industry-background");

let currentWeatherType = "";
let allScenarios = [];

// Load JSON file
fetch("weatherScenarios.json")
  .then(res => res.json())
  .then(data => {
    allScenarios = data;
  });

// Get weatherType using city name
async function getWeatherType(city) {
  const apiKey = "YOUR_API_KEY"; // Replace with your actual API key
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.weather) throw new Error("Invalid weather data");
    const main = data.weather[0].main.toLowerCase();

    // Map OpenWeather condition to our weatherTypes
    const map = {
      clear: "Clear",
      clouds: "Fog",
      rain: "Rain",
      drizzle: "Rain",
      thunderstorm: "Thunderstorm",
      snow: "Snow",
      mist: "Fog",
      smoke: "Air Pollution",
      haze: "Haze",
      dust: "Air Pollution",
      sand: "Air Pollution",
      ash: "Air Pollution",
      squall: "Wind",
      tornado: "Storm"
    };

    currentWeatherType = map[main] || "Clear";
    return currentWeatherType;
  } catch (e) {
    console.error("Weather fetch failed", e);
    currentWeatherType = "Clear";
    return currentWeatherType;
  }
}

// Render scenarios
function renderScenarios(industry) {
  const matched = allScenarios.filter(
    s => s.industry === industry && s.weatherType === currentWeatherType
  );
  scenarioContainer.innerHTML = "";

  if (!matched.length) {
    scenarioContainer.innerHTML = `<p class="no-results">No relevant scenarios found for ${industry} during ${currentWeatherType}.</p>`;
    return;
  }

  matched.forEach(item => {
    const card = document.createElement("div");
    card.className = "scenario-card";
    card.innerHTML = `
      <h3>${item.category}</h3>
      <p><strong>Scenario:</strong> ${item.scenario}</p>
      <p><strong>Advice:</strong> ${item.advice}</p>
      <div class="tags">
        <span class="tag severity ${item.severity.toLowerCase()}">${item.severity}</span>
        <span class="tag">${item.weatherType}</span>
        <span class="tag">${item.responseUrgency}</span>
        <span class="tag">${item.sensitiveGroups}</span>
        <span class="tag">${item.sourceReliability}</span>
      </div>
    `;
    scenarioContainer.appendChild(card);
  });
}

// Set background
function setBackground(industry) {
  const staticIndustries = [
    "Healthcare",
    "Retail",
    "Education",
    "Energy",
    "Event Management"
  ];
  if (staticIndustries.includes(industry)) {
    background.src = `videos/${industry.toLowerCase().replace(/ & | /g, "-")}.mp4`;
  } else {
    background.src = `videos/${industry.toLowerCase().replace(/ & | /g, "-")}/${currentWeatherType.toLowerCase()}.mp4`;
  }
  background.load();
}

// City search handler
cityButton.onclick = async () => {
  const city = cityInput.value.trim();
  if (!city) return alert("Please enter a city name");
  await getWeatherType(city);
  const industry = industrySelect.value;
  if (industry) {
    setBackground(industry);
    renderScenarios(industry);
  }
};

industrySelect.onchange = () => {
  const industry = industrySelect.value;
  if (industry && currentWeatherType) {
    setBackground(industry);
    renderScenarios(industry);
  }
};

