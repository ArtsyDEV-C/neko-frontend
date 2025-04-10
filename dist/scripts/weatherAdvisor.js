document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("advisor-form");
  const resultSection = document.getElementById("advisor-result");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const industry = document.getElementById("industry").value.trim();
    const category = document.getElementById("category").value.trim();
    const severity = document.getElementById("severity").value.trim();
    const level = document.getElementById("level").value.trim() || "0"; // Normal = 0
    const weatherType = document.getElementById("weatherType").value.trim();

    if (!industry || !category || !severity || !weatherType) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      resultSection.classList.add("hidden");
      resultSection.innerHTML = "<p>Loading...</p>";

      const response = await fetch("https://your-backend-url.up.railway.app/api/scenario-advice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ industry, category, severity, level, weatherType })
      });

      const data = await response.json();

      if (data.reply) {
        resultSection.classList.remove("hidden");
        resultSection.innerHTML = `<pre>${data.reply}</pre>`;
      } else {
        resultSection.innerHTML = "<p>No scenario match found.</p>";
      }

    } catch (err) {
      console.error("Error:", err);
      resultSection.innerHTML = "<p>Error fetching data. Try again later.</p>";
    }
  });
});
