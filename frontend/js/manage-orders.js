document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole");

  if (!token || (role !== 'admin' && role !== 'staff')) {
    alert("Access denied!");
    window.location.href = "login.html";
    return;
  }

  const tableBody = document.querySelector("#ordersTable tbody");

  function fetchOrders() {
    fetch('http://localhost:5500/api/manage-order', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        tableBody.innerHTML = '';

        if (!data.length) {
          tableBody.innerHTML = `<tr><td colspan="9" style="text-align:center;">No orders found.</td></tr>`;
          return;
        }

        data.forEach(order => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.user_id}</td>
            <td>${order.design_id}</td>
            <td>${order.measurements}</td>
            <td>${order.requirements || '—'}</td>
            <td>${order.quantity}</td>
            <td>
              <select onchange="updateStatus(${order.id}, this.value)" ${order.status === "Completed" ? "disabled" : ""}>
                <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                <option value="Completed" ${order.status === 'Completed' ? 'selected' : ''}>Completed</option>
                <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
              </select>
            </td>
            <td>${new Date(order.order_date).toLocaleString()}</td>
            <td>
              <button class="btn edit-btn" onclick="editOrder(${order.id})">Edit</button>
              ${role === 'admin' ? `<button class="btn delete-btn" onclick="deleteOrder(${order.id})">Delete</button>` : ''}
            </td>
          `;
          tableBody.appendChild(row);
        });
      })
      .catch(err => {
        tableBody.innerHTML = `<tr><td colspan="9" style="text-align:center;">Error loading orders.</td></tr>`;
        console.error(err);
      });
  }

  window.updateStatus = function (orderId, newStatus) {
    fetch(`http://localhost:5500/api/orders/update-order/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message || data.error || "Order update failed.");
        fetchOrders();
      })
      .catch(err => {
        alert("Failed to update order!");
        console.error(err);
      });
  };

  window.editOrder = function (orderId) {
    window.location.href = `edit-order.html?id=${orderId}`;
  };

  window.deleteOrder = function (orderId) {
    if (!confirm("Are you sure you want to delete this order?")) return;

    fetch(`http://localhost:5500/api/orders/delete/${orderId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message || data.error || "Order delete failed.");
        fetchOrders();
      })
      .catch(err => {
        alert("Failed to delete order!");
        console.error(err);
      });
  };

  fetchOrders();
});
