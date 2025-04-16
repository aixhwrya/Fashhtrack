console.log("✅ my-orders.js is linked and running");

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const tbody = document.getElementById("ordersBody");
  const table = document.getElementById("ordersTable");
  const loader = document.getElementById("loader");

  console.log("🔐 Token:", token);
  console.log("📦 Table Body Element Found:", !!tbody);

  if (!token) {
    alert("❌ Please login first.");
    window.location.href = "login.html";
    return;
  }

  try {
    console.log("📡 Sending request to http://localhost:5500/api/orders/my");
    console.log("🔥 About to fetch /my with token:", token);

    const res = await fetch("http://localhost:5500/api/orders/my", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      credentials: "include"
    });

    console.log("🌐 Status Code:", res.status);

    const orders = await res.json();
    loader.style.display = "none";

    if (!res.ok) {
      throw new Error(orders.message || "❌ Failed to fetch orders");
    }

    if (!Array.isArray(orders) || orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">📭 No orders found.</td></tr>`;
      table.style.display = "table";
      return;
    }

    orders.forEach(order => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${order.order_id}</td>
        <td>${order.design_name}</td>
        <td class="status ${order.status.toLowerCase()}">${order.status}</td>
        <td>${new Date(order.order_date).toLocaleDateString()}</td>
        <td><a href="track-order.html?orderId=${order.order_id}" class="track-btn">🔍 Track</a></td>
      `;
      tbody.appendChild(row);
    });

    table.style.display = "table";

  } catch (err) {
    console.error("❌ Error loading orders:", err.message);
    loader.style.display = "none";
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">❌ ${err.message}</td></tr>`;
    table.style.display = "table";
  }
});
