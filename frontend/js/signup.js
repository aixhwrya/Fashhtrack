document.getElementById("signupForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = document.getElementById("role").value;
    const messageBox = document.getElementById("message");
    const signupButton = document.querySelector("button");

    signupButton.disabled = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

    if (!emailRegex.test(email)) {
        messageBox.textContent = "❌ Invalid email format!";
        signupButton.disabled = false;
        return;
    }
    if (!phoneRegex.test(phone)) {
        messageBox.textContent = "❌ Phone number must be exactly 10 digits!";
        signupButton.disabled = false;
        return;
    }
    if (!passwordRegex.test(password)) {
        messageBox.textContent = "❌ Password must have at least 6 characters, include uppercase, lowercase, and a number!";
        signupButton.disabled = false;
        return;
    }

    try {
        const response = await fetch("http://localhost:5500/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, phone, password, role }),
        });

        const data = await response.json();

        if (response.ok) {
            messageBox.style.color = "green";
            messageBox.textContent = data.message || "✔️ Signup successful!";
            setTimeout(() => {
                window.location.replace("login.html");
            }, 2000);
        } else {
            messageBox.textContent = data.message || "❌ Signup failed!";
        }
    } catch (error) {
        console.error("Error:", error);
        messageBox.textContent = "❌ Unable to connect to the server!";
    } finally {
        signupButton.disabled = false;
    }
});
