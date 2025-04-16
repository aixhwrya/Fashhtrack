document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("⚠️ Unauthorized Access! Redirecting to Login...");
    window.location.href = "login.html";
    return;
  }

  // ✅ Determine API URL (localhost or production)
  const apiUrl = window.location.origin.includes("127.0.0.1") || window.location.origin.includes("localhost")
    ? "http://localhost:5500"
    : "https://your-production-api.com"; // Replace if deployed

  try {
    // ✅ Fetch user profile using token
    const response = await fetch(`${apiUrl}/api/users/profile`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Cache-Control": "no-cache"
      },
      credentials: "include" // ✅ Required for cookies/CORS support
    });

    if (!response.ok) throw new Error("Profile fetch failed");

    const { name, email, role } = await response.json();

    // ✅ Save for reuse
    localStorage.setItem("userName", name);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userRole", role);

    const page = window.location.pathname;

    // ✅ Auto-redirect only from generic dashboard.html
    if (
      page.includes("dashboard.html") &&
      !page.includes(`${role}-dashboard.html`)
    ) {
      window.location.href = `${role}-dashboard.html`;
      return;
    }

    // ✅ Dynamically fill name & email
    const nameEl = document.getElementById(`${role}-name`);
    const emailEl = document.getElementById(`${role}-email`);

    if (nameEl) nameEl.textContent = name || role;
    if (emailEl) emailEl.textContent = email || "No email found";

    // 👋 Welcome message for customer
    if (role === "customer") {
      const welcomeText = document.getElementById("welcomeText");
      if (welcomeText) welcomeText.textContent = `Hey, ${name || "Customer"} 👋`;
    }

  } catch (error) {
    console.error("❌ Error fetching profile:", error);
    alert("⚠️ Session expired or unauthorized. Please log in again.");
    localStorage.clear();
    window.location.href = "login.html";
  }
});
