document.addEventListener("DOMContentLoaded", async () => {
  const loader = document.getElementById("loader");
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Unauthorized. Please log in first.");
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch("http://localhost:5500/api/users/profile", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      console.error("Status:", res.status);
      throw new Error("Failed to fetch profile.");
    }

    const user = await res.json();

    // 🧾 Display profile data
    document.getElementById("user-name").textContent = user.name || "User";
    document.getElementById("name").textContent = user.name || "-";
    document.getElementById("email").textContent = user.email || "-";
    document.getElementById("phone").textContent = user.phone || "Not provided";
    document.getElementById("role").textContent = user.role || "-";
    document.getElementById("profile-info").style.display = "block";
    if (loader) loader.style.display = "none";

    // 📦 Show customer orders (optional section)
    if (user.role === "customer" && Array.isArray(user.orders)) {
      const ordersDiv = document.getElementById("orders");
      if (user.orders.length > 0) {
        user.orders.forEach(order => {
          const orderItem = document.createElement("p");
          orderItem.innerHTML = `<span>Order ID:</span> ${order.id} | <span>Status:</span> ${order.status}`;
          ordersDiv.appendChild(orderItem);
        });
        document.getElementById("order-list").style.display = "block";
      } else {
        ordersDiv.innerHTML = "<p>No orders found.</p>";
      }
    }

  } catch (err) {
    console.error("Error fetching profile:", err.message);
    alert("Error loading profile. Please log in again.");
    localStorage.clear();
    window.location.href = "login.html";
  }
});

// 🔐 Logout
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
  window.location.href = "login.html";
}

// ✏️ Edit profile (if applicable)
function editProfile() {
  window.location.href = "edit-profile.html";
}

// Optional: Assign logout button if exists
document.getElementById("logoutBtn")?.addEventListener("click", logout);
