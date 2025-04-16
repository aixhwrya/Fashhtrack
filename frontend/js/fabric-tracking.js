document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const tableBody = document.querySelector("table tbody");
  const messageRow = document.createElement("tr");

  // 🧠 Load existing leftover fabric
  fetch("http://localhost:5500/api/leftover", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    })
    .then(data => {
      tableBody.innerHTML = "";
      if (data.length === 0) {
        messageRow.innerHTML = `<td colspan="4">No fabric data yet.</td>`;
        tableBody.appendChild(messageRow);
      } else {
        data.forEach(item => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.fabric_type}</td>
            <td>${item.quantity}</td>
            <td>${item.color}</td>
            <td>${item.purpose || ''}</td>
          `;
          tableBody.appendChild(row);
        });
      }
    })
    .catch(err => {
      console.error("❌ Error loading fabric data:", err);
      tableBody.innerHTML = `<tr><td colspan="4">Error fetching fabric data.</td></tr>`;
    });

  // 💾 Handle form submission
  const form = document.querySelector("form");
  form.addEventListener("submit", async e => {
    e.preventDefault();

    const fabricType = document.getElementById("fabric_type").value.trim();
    const quantity = document.getElementById("quantity").value.trim();
    const color = document.getElementById("color").value.trim();
    const purpose = document.getElementById("purpose").value.trim();

    if (!fabricType || !quantity || !color) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5500/api/leftover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ fabric_type: fabricType, quantity, color, purpose })
      });

      const result = await res.json();
      if (res.ok) {
        alert("✅ Fabric data added!");
        window.location.reload();
      } else {
        alert(`❌ ${result.error || "Failed to save fabric"}`);
      }
    } catch (err) {
      console.error("❌ Submit Error:", err);
      alert("Something went wrong. Try again.");
    }
  });
});
