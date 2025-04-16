// ✅ Updated place-order.js with PDF, Toast, Stock Check, Reset, and Design Image Preview

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    showToast("❌ Unauthorized. Please log in.", false);
    window.location.href = "login.html";
    return;
  }

  const designSelect = document.getElementById("design");
  const colorSelect = document.getElementById("color");
  const sizeSelect = document.getElementById("size");
  const quantityInput = document.getElementById("quantity");
  const priceDisplay = document.getElementById("price-display");
  const totalPriceDisplay = document.getElementById("total-price-display");
  const stockInfo = document.getElementById("stockInfo");
  const preview = document.getElementById("designPreview");
  const apiBase = "http://localhost:5500";

  let selectedPrice = 0;

  // 🔄 Load Designs
  fetch(`${apiBase}/api/designs`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      data.forEach(design => {
        const option = document.createElement("option");
        option.value = design.id;
        option.textContent = `${design.name} (${design.category})`;
        designSelect.appendChild(option);
      });

      designSelect.addEventListener("change", async () => {
        const selectedDesignId = designSelect.value;
        if (!selectedDesignId) {
          priceDisplay.textContent = "";
          totalPriceDisplay.textContent = "";
          stockInfo.textContent = "";
          preview.style.display = "none";
          selectedPrice = 0;
          return;
        }

        try {
          const res = await fetch(`${apiBase}/api/designs/${selectedDesignId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (res.ok) {
            selectedPrice = data.price;
            priceDisplay.textContent = `Price: ₹${selectedPrice}`;
            stockInfo.textContent = `Stock Left: ${data.stock} units`;
            const qty = parseInt(quantityInput.value) || 1;
            totalPriceDisplay.textContent = `Total: ₹${selectedPrice * qty} (₹${selectedPrice} × ${qty})`;

            if (data.image_url) {
              preview.src = data.image_url;
              preview.style.display = "block";
            } else {
              preview.style.display = "none";
            }

          } else {
            showToast("❌ Could not load price", false);
            priceDisplay.textContent = stockInfo.textContent = totalPriceDisplay.textContent = "";
            preview.style.display = "none";
          }
        } catch (err) {
          console.error("❌ Error fetching price/stock:", err);
          showToast("⚠️ Error fetching price", false);
          preview.style.display = "none";
        }
      });
    })
    .catch(err => {
      console.error("❌ Failed to load designs:", err);
      showToast("❌ Failed to load designs", false);
    });

  quantityInput.addEventListener("input", () => {
    const qty = parseInt(quantityInput.value) || 1;
    if (selectedPrice > 0) {
      totalPriceDisplay.textContent = `Total: ₹${selectedPrice * qty} (₹${selectedPrice} × ${qty})`;
    } else {
      totalPriceDisplay.textContent = "";
    }
  });

  document.getElementById("orderForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const order = {
      design_id: designSelect.value,
      color: colorSelect.value,
      size: sizeSelect.value,
      measurements: document.getElementById("measurements").value.trim(),
      requirements: document.getElementById("requirements").value.trim(),
      quantity: parseInt(quantityInput.value)
    };

    const availableStock = parseInt(stockInfo.textContent.match(/\d+/)[0]);
    if (order.quantity > availableStock) {
      showToast("❌ Not enough stock available!", false);
      return;
    }

    if (!order.design_id || !order.color || !order.size || !order.measurements || isNaN(order.quantity) || order.quantity <= 0) {
      showToast("❌ Please fill all fields correctly!", false);
      return;
    }

    const details = `
      <strong>Design:</strong> ${designSelect.options[designSelect.selectedIndex].text}<br>
      <strong>Color:</strong> ${colorSelect.value}<br>
      <strong>Size:</strong> ${sizeSelect.value}<br>
      <strong>Measurements:</strong> ${order.measurements}<br>
      <strong>Requirements:</strong> ${order.requirements || "None"}<br>
      <strong>Quantity:</strong> ${order.quantity}<br>
      <strong>Total Price:</strong> ₹${selectedPrice * order.quantity}
    `;
    document.getElementById("orderDetails").innerHTML = details;
    document.getElementById("orderModal").style.display = "flex";
  });

  document.getElementById("orderForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const order = {
      design_id: designSelect.value,
      color: colorSelect.value,
      size: sizeSelect.value,
      measurements: document.getElementById("measurements").value.trim(),
      requirements: document.getElementById("requirements").value.trim(),
      quantity: parseInt(quantityInput.value)
    };

    try {
      const res = await fetch(`${apiBase}/api/orders/place-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(order)
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || result.message || "Unknown error");

      showToast(result.message || "✅ Order placed successfully!");
      const orderId = result.order_id;
showToast(`✅ Order placed! Your Order ID is: ${orderId}`);

// Optional: Store to use later in track-order
localStorage.setItem("lastOrderId", orderId);


      const designName = designSelect.options[designSelect.selectedIndex].text;
      const total = selectedPrice * order.quantity;
      generatePDF(order, designName, total);

      document.getElementById("orderForm").reset();
      priceDisplay.textContent = "";
      totalPriceDisplay.textContent = "";
      stockInfo.textContent = "";
      preview.style.display = "none";

      setTimeout(() => {
        window.location.href = "track-order.html";
      }, 1000);

    } catch (err) {
      console.error("❌ Order failed:", err);
      showToast("❌ Order failed. See console.", false);
    }
  });
});

function closeModal() {
  document.getElementById("orderModal").style.display = "none";
}

function submitOrder() {
  document.getElementById("orderForm").submit();
}

function showToast(message, success = true) {
  const toast = document.getElementById("toast");
  toast.style.background = success ? "#2ecc71" : "#e74c3c";
  toast.textContent = message;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.opacity = 0;
  }, 2000);

  setTimeout(() => {
    toast.style.display = "none";
    toast.style.opacity = 1;
  }, 3000);
}

function generatePDF(order, designName, total) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("🧾 FashhTrack Order Receipt", 20, 20);

  doc.setFontSize(12);
  doc.text(`Design: ${designName}`, 20, 40);
  doc.text(`Color: ${order.color}`, 20, 50);
  doc.text(`Size: ${order.size}`, 20, 60);
  doc.text(`Measurements: ${order.measurements}`, 20, 70);
  doc.text(`Requirements: ${order.requirements || "None"}`, 20, 80);
  doc.text(`Quantity: ${order.quantity}`, 20, 90);
  doc.text(`Total: ₹${total}`, 20, 100);

  doc.text("✅ Thank you for shopping with us!", 20, 120);

  doc.save("FashhTrack_Receipt.pdf");
}