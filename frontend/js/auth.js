const API_BASE = "http://localhost:5500"; // ✅ backend API URL

// 🔐 LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userRole", data.role);
        localStorage.setItem("userName", data.name);
        localStorage.setItem("userEmail", data.email);

        alert(data.message);

        // Redirect to role-based dashboard
        window.location.href = `${data.role}-dashboard.html`;
      } else {
        alert(data.message || "❌ Login failed. Try again.");
      }

    } catch (err) {
      console.error("Login error:", err);
      alert("⚠️ Server error during login.");
    }
  });
}

// 📝 SIGNUP
const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = document.getElementById("role").value; // dropdown or hidden field

    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password, role })
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Signup successful! Please login.");
        window.location.href = "login.html";
      } else {
        alert(data.message || "❌ Signup failed. Try again.");
      }

    } catch (err) {
      console.error("Signup error:", err);
      alert("⚠️ Server error during signup.");
    }
  });
}
