document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const message = document.getElementById('message');

  message.textContent = "";
  message.style.color = "white";

  // 🚨 Basic validation
  if (!email || !password) {
    message.textContent = "❌ Email and password are required!";
    message.style.color = "red";
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    message.textContent = "❌ Invalid email format!";
    message.style.color = "red";
    return;
  }

  try {
    const res = await fetch('http://localhost:5500/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    // ❗ Handle login failure
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "❌ Login failed! Invalid credentials.");
    }

    const data = await res.json();

    // ✅ Extract user data safely
    const userRole = data.user?.role;
    const userName = data.user?.name;

    if (!userRole) {
      throw new Error("❌ User role not returned from server.");
    }

    // 💾 Store login data
    localStorage.setItem("token", data.token);
    localStorage.setItem("userRole", userRole);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userName", userName);

    console.log("🔐 Token:", data.token);
    console.log("👤 Role:", userRole, "| Name:", userName);

    message.textContent = "✅ Login successful! Redirecting...";
    message.style.color = "lightgreen";

    // 🚀 Redirect to respective dashboard
    const dashboardPaths = {
      admin: "admin-dashboard.html",
      staff: "staff-dashboard.html",
      customer: "customer-dashboard.html"
    };

    const redirectTo = dashboardPaths[userRole.toLowerCase()] || "customer-dashboard.html";

    setTimeout(() => {
      window.location.replace(redirectTo);
    }, 1000);

  } catch (error) {
    console.error("Login error:", error);
    message.textContent = error.message || "❌ Login failed!";
    message.style.color = "red";
  }
});
