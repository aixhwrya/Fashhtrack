document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole");
  const form = document.getElementById("editInventoryForm");

  if (!token || (role !== "admin" && role !== "staff")) {
    alert("Access Denied!");
    window.location.href = "dashboard.html";
    return;
  }

  // Get item ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get("id");

  if (!itemId) {
    alert("Invalid Item ID");
    return;
  }

  // Fetch item details
  fetch(`http://localhost:5500/api/inventory/${itemId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(item => {
      document.getElementById("item_name").value = item.item_name;
      document.getElementById("quantity").value = item.quantity;
      document.getElementById("price").value = item.price;
      document.getElementById("supplier").value = item.supplier;
    })
    .catch(err => {
      alert("Failed to load item details.");
      console.error(err);
    });

  // Handle update
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const updatedItem = {
      item_name: form.item_name.value,
      quantity: form.quantity.value,
      price: form.price.value,
      supplier: form.supplier.value,
    };

    fetch(`http://localhost:5500/api/inventory/update/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updatedItem)
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message || "Item updated successfully!");
        window.location.href = "inventory.html";
      })
      .catch(err => {
        alert("Failed to update item.");
        console.error(err);
      });
  });
});
