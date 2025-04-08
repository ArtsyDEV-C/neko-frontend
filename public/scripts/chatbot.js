// Global State
let isMuted = false;
const token = localStorage.getItem("token");

// DOM Elements
const chatWindow = document.getElementById("chat-window");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const muteToggle = document.getElementById("mute-toggle");
const exportBtn = document.getElementById("export-chat");
const micBtn = document.getElementById("mic-btn");
const clearBtn = document.getElementById("clear-chat");
const chatHistorySidebar = document.querySelector(".chat-sidebar");
const guestMessage = document.getElementById("guest-message");
const loadingIndicator = document.getElementById("loading-indicator");

// Guest Mode UI (hide chat history and export for guests)
if (!token) {
  chatHistorySidebar.style.display = "none";
  exportBtn.disabled = true;
  guestMessage.style.display = "block"; // Show guest message
}

// Load chat history if logged in
window.addEventListener("load", async () => {
  if (token) {
    try {
      const res = await fetch("/api/chatbot/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const history = await res.json();
      history.forEach((item) => renderMessage(item.role, item.message, item.timestamp));
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
  }
});

// Handle chat form submission
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;

  renderMessage("user", message);
  chatInput.value = "";

  loadingIndicator.style.display = "block"; // Show loading indicator

  try {
    const res = await fetch("/api/chatbot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    renderMessage("bot", data.reply);

    if (!isMuted && window.speechSynthesis) {
      const speech = new SpeechSynthesisUtterance(data.reply);
      speechSynthesis.speak(speech);
    }
  } catch (error) {
    console.error("Chatbot error:", error.message);
    renderMessage("bot", "Sorry, I couldn't process that. Please try again.");
  } finally {
    loadingIndicator.style.display = "none"; // Hide loading indicator
  }
});

// Render chat bubble
function renderMessage(role, text, timestamp = new Date().toLocaleTimeString()) {
  const bubble = document.createElement("div");
  bubble.classList.add("chat-message", role);
  bubble.innerHTML = `
    <span class="meta">${role === "user" ? "🧑 You" : "🤖 Neko"} • ${timestamp}</span>
    <p>${text}</p>
  `;
  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Mute toggle
muteToggle.addEventListener("click", () => {
  isMuted = !isMuted;
  muteToggle.textContent = isMuted ? "🔇 Unmute" : "🔊 Mute";
});

// Clear chat
clearBtn.addEventListener("click", () => {
  const userConfirmed = window.confirm("Are you sure you want to clear the chat?");
  if (userConfirmed) {
    chatWindow.innerHTML = "";
  }
});

// Export chat
exportBtn.addEventListener("click", () => {
  const lines = Array.from(chatWindow.querySelectorAll(".chat-message"))
    .map((msg) => msg.innerText)
    .join("\n\n");
  const blob = new Blob([lines], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "chat-history.txt";
  link.click();
});

// 🌦️ Scenario Advice Fetch Logic
const scenarioForm = document.getElementById("scenario-form");
const weatherInput = document.getElementById("scenario-weather");
const industryInput = document.getElementById("scenario-industry");
const severityInput = document.getElementById("scenario-severity");
const categoryInput = document.getElementById("scenario-category");
const resultsContainer = document.getElementById("scenario-results");

scenarioForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const weatherType = weatherInput.value.trim();
  const industry = industryInput.value.trim();
  const severity = severityInput.value.trim();
  const category = categoryInput.value.trim();

  if (!weatherType) {
    alert("Please enter a weather type.");
    return;
  }

  try {
    const response = await fetch("/api/scenario-advice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ weatherType, industry, severity, category }),
    });

    const data = await response.json();

    resultsContainer.innerHTML = "";

    if (data.results && data.results.length > 0) {
      data.results.forEach((item, index) => {
        const card = document.createElement("div");
        card.className = "advice-card";
        card.innerHTML = `
          <h3>🌐 ${item.industry} - ${item.weatherType}</h3>
          <p><strong>Scenario:</strong> ${item.scenario}</p>
          <p><strong>Advice:</strong> ${item.advice}</p>
          <p><strong>Severity:</strong> ${item.severity} | <strong>Urgency:</strong> ${item.responseUrgency}</p>
          <p><strong>Region:</strong> ${item.regionType} | <strong>Sensitive:</strong> ${item.sensitiveGroups}</p>
        `;
        resultsContainer.appendChild(card);
      });
    } else {
      resultsContainer.innerHTML = `<p class="no-results">❌ No matching scenario advice found.</p>`;
    }
  } catch (err) {
    console.error("Scenario fetch error:", err);
    resultsContainer.innerHTML = `<p class="error-msg">⚠️ Failed to fetch advice. Try again.</p>`;
  }
});


// Voice input (ASR)
micBtn.addEventListener("click", async () => {
  try {
    // Check for microphone permissions
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks = [];

    mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      const formData = new FormData();
      formData.append("audio", audioBlob, "speech.wav");

      const res = await fetch("/api/voice/transcribe", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      chatInput.value = data.text; // Set transcribed text to chat input
    };

    mediaRecorder.start();
    micBtn.textContent = "🔴 Recording... Click to stop";
    micBtn.disabled = true; // Disable mic button during recording

    micBtn.onclick = () => {
      mediaRecorder.stop();
      micBtn.textContent = "🎤"; // Reset mic button text after stopping
      micBtn.disabled = false; // Re-enable button after recording
    };
  } catch (error) {
    alert("Microphone access denied. Please enable it to use voice input.");
  }
});
