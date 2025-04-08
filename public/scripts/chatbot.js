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
const chatHistoryList = document.getElementById("chat-history");

// Guest mode UI
if (!token) {
  chatHistorySidebar.style.display = "none";
  exportBtn.disabled = true;
}

// Load history if logged in
window.addEventListener("load", async () => {
  if (token) {
    const res = await fetch("/api/chatbot/history", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const history = await res.json();
    history.forEach((item) => renderMessage(item.role, item.message, item.timestamp));
  }
});

// Handle chat form submission
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;

  renderMessage("user", message);
  chatInput.value = "";

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
  if (confirm("Clear this chat?")) chatWindow.innerHTML = "";
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

// Voice input (ASR)
micBtn.addEventListener("click", async () => {
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
    chatInput.value = data.text;
  };

  mediaRecorder.start();
  micBtn.textContent = "🔴 Recording... Click to stop";
  micBtn.onclick = () => {
    mediaRecorder.stop();
    micBtn.textContent = "🎤";
  };
});
