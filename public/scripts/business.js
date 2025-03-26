document.getElementById("industry").addEventListener("change", function () {
    const selectedIndustry = this.value;
    fetchIndustryData(selectedIndustry);
});

async function fetchIndustryData(industry) {
    document.getElementById("loading-indicator").style.display = "block";
    try {
        const response = await fetch(`/api/business/weather?industry=${industry}`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });
        const data = await response.json();
        document.getElementById("loading-indicator").style.display = "none";

        if (data.success) {
            displayIndustryData(data.analytics);
        } else {
            document.getElementById("industry-description").innerText = "No data available for the selected industry.";
        }
    } catch (error) {
        console.error("Failed to fetch industry data:", error);
        document.getElementById("loading-indicator").style.display = "none";
        document.getElementById("industry-description").innerText = "Failed to fetch data. Please try again later.";
    }
}

function displayIndustryData(analytics) {
    document.getElementById("industry-description").innerText = `Weather analytics for ${analytics.industry}.`;
    const dataContainer = document.getElementById("industry-weather-data");
    dataContainer.innerHTML = `
        <p>Average Temperature: ${analytics.averageTemperature}°C</p>
        <p>Rainfall: ${analytics.rainfall}mm</p>
        <p>Wind Speed: ${analytics.windSpeed} km/h</p>
        <p>Recommended Actions: ${analytics.recommendedActions}</p>
    `;
}

// Automatically load default industry (e.g., Agriculture) on page start
window.addEventListener("DOMContentLoaded", () => {
    fetchIndustryData("agriculture");
});
