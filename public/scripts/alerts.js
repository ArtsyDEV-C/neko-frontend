// alerts.js - Handle sending weather alerts via the backend

async function sendAlert(message) {
    try {
        const response = await fetch("/api/send-alert", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message })
        });
        const data = await response.json();
        
        if (data.success) {
            alert("Alert sent successfully!");
        } else {
            alert("Failed to send alert.");
        }
    } catch (error) {
        console.error("Error sending alert:", error);
    }
}

// Event listener for the send alert button
document.getElementById("send-alert-btn").addEventListener("click", () => {
    const message = document.getElementById("alert-message").value;
    sendAlert(message);
});
