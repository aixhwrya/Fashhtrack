document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem('token');
  const loader = document.getElementById('loader');
  const message = document.getElementById('message');
  const orderDetails = document.getElementById('orderDetails');
  const orderIdInput = document.getElementById('orderId');

  // ✅ Auto-fill from URL
  const urlParams = new URLSearchParams(window.location.search);
  const orderIdFromURL = urlParams.get('orderId');
  if (orderIdFromURL) {
    orderIdInput.value = orderIdFromURL;
    fetchAndDisplayOrder(orderIdFromURL, token);
  }

  // ✅ Manual submit
  document.getElementById('trackOrderForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const orderId = orderIdInput.value.trim();
    fetchAndDisplayOrder(orderId, token);
  });

  // 🔁 Function to fetch and display order details
  async function fetchAndDisplayOrder(orderId, token) {
    // Reset UI
    message.textContent = '';
    orderDetails.style.display = 'none';
    loader.style.display = 'block';

    try {
      const res = await fetch(`http://localhost:5500/api/track-order?orderId=${orderId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      loader.style.display = 'none';

      if (!res.ok) throw new Error('Order not found or server error!');
      const data = await res.json();

      // Fill in details
      document.getElementById('order-id').textContent = orderId;
      document.getElementById('design').textContent = data.design_name;
      document.getElementById('status').textContent = data.status;
      document.getElementById('delivery').textContent = data.expected_delivery;

      // Status color
      const statusSpan = document.getElementById('status');
      statusSpan.className = 'status'; // reset
      const statusLower = data.status.toLowerCase();
      if (statusLower.includes('process')) statusSpan.classList.add('processing');
      else if (statusLower.includes('complete')) statusSpan.classList.add('completed');
      else if (statusLower.includes('cancel')) statusSpan.classList.add('cancelled');

      orderDetails.style.display = 'block';
    } catch (err) {
      loader.style.display = 'none';
      message.textContent = `❌ ${err.message}`;
    }
  }
});
