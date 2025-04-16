document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const orderSelect = document.getElementById("order_id");
  const amountInput = document.getElementById("amount");

  if (!token) {
    alert("❌ Please login first.");
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch("http://localhost:5500/api/orders/unpaid", {
      headers: {
        "Authorization": `Bearer ${token}`
        
      }
    });

    const orders = await res.json();

    if (!res.ok) {
      throw new Error(orders.message || "Failed to fetch unpaid orders.");
    }

    orders.forEach(order => {
      const option = document.createElement("option");
      option.value = order.order_id;
      option.textContent = `Order #${order.order_id} - ₹${order.amount}`;
      option.dataset.amount = order.amount;
      orderSelect.appendChild(option);
    });

    orderSelect.addEventListener("change", () => {
      const selected = orderSelect.options[orderSelect.selectedIndex];
      amountInput.value = selected.dataset.amount || '';
    });

  } catch (err) {
    console.error("❌ Error loading unpaid orders:", err);
    alert("Failed to load orders. Try again later.");
  }
});

document.getElementById("paymentForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const orderId = document.getElementById("order_id").value;
  const amount = document.getElementById("amount").value.trim();
  const method = document.getElementById("method").value;
  const message = document.getElementById("message");

  message.textContent = "";
  message.style.color = "white";

  const token = localStorage.getItem("token");
  if (!token) {
    alert("❌ Please log in first.");
    window.location.href = "login.html";
    return;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.id;
    const userName = payload.name;

    const res = await fetch("http://localhost:5500/api/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        userId,
        orderId,
        amount,
        method
      })
    });

    const data = await res.json();

    if (res.ok) {
      message.textContent = data.message || "✅ Payment successful!";
      message.style.color = "lightgreen";
      document.getElementById("paymentForm").reset();

      generateReceipt({
        orderId,
        amount,
        method,
        userName
      });

    } else {
      message.textContent = data.message || "❌ Payment failed.";
      message.style.color = "red";
    }

  } catch (error) {
    console.error("Payment Error:", error);
    message.textContent = "❌ Server error. Please try again later.";
    message.style.color = "red";
  }
});

function generateReceipt({ orderId, amount, method, userName }) {
  const date = new Date().toLocaleString();

  const receiptWindow = window.open('', '_blank');
  receiptWindow.document.write(`
    <html>
      <head>
        <title>Payment Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 30px; background: #f4f4f4; }
          .receipt-box {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            max-width: 500px;
            margin: auto;
          }
          h2 { text-align: center; color: #2c3e50; }
          p { font-size: 16px; }
          .highlight { font-weight: bold; color: #27ae60; }
          .footer { margin-top: 20px; text-align: center; font-size: 14px; color: gray; }
        </style>
      </head>
      <body>
        <div class="receipt-box">
          <h2>FashhTrack Payment Receipt</h2>
          <p><span class="highlight">Order ID:</span> ${orderId}</p>
          <p><span class="highlight">Amount Paid:</span> ₹${amount}</p>
          <p><span class="highlight">Payment Method:</span> ${method}</p>
          <p><span class="highlight">Paid By:</span> ${userName}</p>
          <p><span class="highlight">Date:</span> ${date}</p>
          <div class="footer">Thank you for shopping with us 💛</div>
        </div>
        <script>setTimeout(() => window.print(), 500);</script>
      </body>
    </html>
  `);
}
