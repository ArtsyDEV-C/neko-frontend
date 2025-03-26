async function getChatbotResponse(message) {
    if (!message.trim()) return;

    try {
        const response = await fetch("/api/chatbot/response", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        document.getElementById("chatbot-response").textContent = data.response;
    } catch (error) {
        console.error("Chatbot fetch failed:", error.message);
        document.getElementById("chatbot-response").textContent = "Something went wrong!";
    }
}

function clearChatbot() {
    document.getElementById("chatbot-input").value = "";
    document.getElementById("chatbot-response").textContent = "";
}

document.getElementById("send-message-btn").addEventListener("click", () => {
    const message = document.getElementById("chatbot-input").value;
    getChatbotResponse(message);
});

document.getElementById("clear-chatbot-btn").addEventListener("click", clearChatbot);