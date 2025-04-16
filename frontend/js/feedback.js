document.getElementById("feedbackForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const subject = document.getElementById("subject").value.trim();
  const messageText = document.getElementById("messageText").value.trim();
  const orderId = document.getElementById("orderId").value.trim();
  const rating = document.getElementById("rating").value;
  const feedbackMessage = document.getElementById("message");

  feedbackMessage.textContent = "";
  feedbackMessage.style.color = "white";

  const token = localStorage.getItem("token");

  if (!token) {
    alert("⚠️ Please login first.");
    window.location.href = "login.html";
    return;
  }

  if (!subject || !messageText) {
    feedbackMessage.textContent = "❌ Please fill in both fields.";
    feedbackMessage.style.color = "red";
    return;
  }

  try {
    const bodyData = {
      subject,
      message: messageText,
    };

    if (orderId) bodyData.order_id = parseInt(orderId);
    if (rating) bodyData.rating = parseInt(rating);

    const res = await fetch("http://localhost:5500/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(bodyData)
    });

    const text = await res.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      console.error("❌ Invalid JSON from server:", text);
      feedbackMessage.textContent = "❌ Server returned an invalid response.";
      feedbackMessage.style.color = "red";
      return;
    }

    if (res.ok) {
      feedbackMessage.textContent = data.message || "✅ Feedback submitted!";
      feedbackMessage.style.color = "lightgreen";
      document.getElementById("feedbackForm").reset();
    } else {
      feedbackMessage.textContent = data.message || "❌ Submission failed.";
      feedbackMessage.style.color = "red";
    }
  } catch (err) {
    console.error("❌ Feedback Error:", err);
    feedbackMessage.textContent = "❌ Server error. Try again later.";
    feedbackMessage.style.color = "red";
  }
});
