// business.js – Final Optimized Version for Neko Global Weather

const industrySelect = document.getElementById("industry-select");
const weatherTypeSelect = document.getElementById("weather-type-select");
const scenarioCardsContainer = document.getElementById("scenario-cards");
const backgroundVideo = document.getElementById("background-video");

let allScenarios = {};

const staticIndustries = ["healthcare", "retail", "education", "energy", "event manager"];
const animatedIndustries = ["agriculture", "logistics", "construction", "tourism"];

async function loadWeatherScenarios() {
  try {
    const res = await fetch("weatherScenarios.json");
    allScenarios = await res.json();
    populateIndustryOptions();
  } catch (error) {
    console.error("Failed to load scenario data:", error);
  }
}

function populateIndustryOptions() {
  industrySelect.innerHTML = '<option value="">Select Industry</option>';
  Object.keys(allScenarios).forEach(industry => {
    const option = document.createElement("option");
    option.value = industry;
    option.textContent = capitalize(industry);
    industrySelect.appendChild(option);
  });
}

function populateWeatherTypes(industry) {
  weatherTypeSelect.innerHTML = '<option value="">Select Weather Type</option>';
  if (!allScenarios[industry]) return;

  Object.keys(allScenarios[industry]).forEach(weatherType => {
    const option = document.createElement("option");
    option.value = weatherType;
    option.textContent = capitalize(weatherType.replace(/_/g, " "));
    weatherTypeSelect.appendChild(option);
  });
}

function updateBackground(industry, weatherType) {
  let videoPath;

  if (staticIndustries.includes(industry)) {
    videoPath = `videos/${industry}.mp4`; // static single background
  } else if (animatedIndustries.includes(industry)) {
    videoPath = `videos/${industry}/${weatherType}.mp4`; // weather-specific background
  } else {
    videoPath = `videos/default.mp4`;
  }

  backgroundVideo.src = videoPath;
  backgroundVideo.load();
}

function renderScenarioCards(industry, weatherType) {
  scenarioCardsContainer.innerHTML = "";

  if (!allScenarios[industry] || !allScenarios[industry][weatherType]) {
    scenarioCardsContainer.innerHTML = "<p>No scenarios available.</p>";
    return;
  }

  const cards = allScenarios[industry][weatherType];

  cards.forEach(card => {
    const cardEl = document.createElement("div");
    cardEl.className = "scenario-card";

    cardEl.innerHTML = `
      <div class="icon-container">
        <img src="icons/${weatherType}.gif" alt="${weatherType} icon" />
      </div>
      <div class="card-details">
        <p><strong>Scenario:</strong> ${card.scenario}</p>
        <p><strong>Advice:</strong> ${card.advice}</p>
        <p><strong>Urgency:</strong> ${capitalize(card.responseUrgency)}</p>
        <p><strong>Groups Affected:</strong> ${card.sensitiveGroups}</p>
        <p><strong>Source:</strong> ${capitalize(card.sourceReliability)}</p>
        <p><strong>Severity:</strong> ${capitalize(card.severity)}</p>
      </div>
    `;

    scenarioCardsContainer.appendChild(cardEl);
  });
}

industrySelect.addEventListener("change", () => {
  const industry = industrySelect.value;
  if (!industry) return;

  populateWeatherTypes(industry);
  scenarioCardsContainer.innerHTML = "";
  backgroundVideo.src = "videos/default.mp4"; // Reset background
});

weatherTypeSelect.addEventListener("change", () => {
  const industry = industrySelect.value;
  const weatherType = weatherTypeSelect.value;

  if (industry && weatherType) {
    updateBackground(industry, weatherType);
    renderScenarioCards(industry, weatherType);
  }
});

function capitalize(str) {
  return str.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

// Initialize
loadWeatherScenarios();
