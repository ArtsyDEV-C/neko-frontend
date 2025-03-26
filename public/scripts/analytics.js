// analytics.js - Fetch and display weather and traffic analytics

async function getAnalytics() {
    try {
        const response = await fetch("/api/analytics");
        const data = await response.json();

        if (data) {
            displayAnalytics(data);
        } else {
            alert("No data available.");
        }
    } catch (error) {
        console.error("Error fetching analytics:", error);
    }
}

function displayAnalytics(data) {
    document.getElementById("analytics-temperature").innerText = `Temperature: ${data.temperature}°C`;
    document.getElementById("analytics-traffic").innerText = `Traffic: ${data.trafficStatus}`;
    document.getElementById("analytics-rainfall").innerText = `Rainfall: ${data.rainfall}mm`;
}

window.onload = getAnalytics;  // Automatically fetch analytics on page load
