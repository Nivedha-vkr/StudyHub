// Switch page
function switchPage(id) {
  document
    .querySelectorAll(".container > div")
    .forEach((p) => p.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

// Validation helpers
function validateEmail(email) {
  return email.toLowerCase().endsWith("@gmail.com");
}
function validateLength(value) {
  return value.length >= 5 && value.length <= 18;
}
function showError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.style.display = "block";
}
function hideError(id) {
  document.getElementById(id).style.display = "none";
}

// ----------------- Signup -----------------
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  let valid = true;
  const email = signupEmail.value.trim(),
    user = signupUsername.value.trim(),
    pass = signupPassword.value.trim();

  if (!email) {
    showError("signupEmailError", "Please fill out this field");
    valid = false;
  } else if (!validateEmail(email)) {
    showError(
      "signupEmailError",
      "Sorry, this doesn't look like a valid email"
    );
    valid = false;
  } else hideError("signupEmailError");

  if (!user) {
    showError("signupUsernameError", "Please fill out this field");
    valid = false;
  } else if (!validateLength(user)) {
    showError(
      "signupUsernameError",
      "Username must be between 5 and 18 characters"
    );
    valid = false;
  } else hideError("signupUsernameError");

  if (!pass) {
    showError("signupPasswordError", "Please fill out this field");
    valid = false;
  } else if (!validateLength(pass)) {
    showError(
      "signupPasswordError",
      "Password must be between 5 and 18 characters"
    );
    valid = false;
  } else hideError("signupPasswordError");

  if (valid) {
    const res = await fetch("/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, email: email, password: pass }),
    });
    const data = await res.json();
    if (data.status === "success") {
      window.location.href = data.redirect;
    } else {
      alert(data.message);
    }
  }
});

// ----------------- Login -----------------
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  let valid = true;
  if (!validateLength(loginUsername.value.trim())) {
    loginUsernameError.style.display = "block";
    valid = false;
  } else loginUsernameError.style.display = "none";

  if (!validateLength(loginPassword.value.trim())) {
    loginPasswordError.style.display = "block";
    valid = false;
  } else loginPasswordError.style.display = "none";

  if (valid) {
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: loginUsername.value.trim(),
        password: loginPassword.value.trim(),
      }),
    });
    const data = await res.json();
    if (data.status === "success") {
      window.location.href = data.redirect;
    } else {
      alert(data.message);
    }
  }
});

// ----------------- Forgot -----------------
document.getElementById("forgotForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = forgotEmail.value.trim(),
    user = forgotUsername.value.trim();

  if (!email) {
    showError("forgotEmailError", "Please fill out this field");
    return;
  } else if (!validateEmail(email)) {
    showError(
      "forgotEmailError",
      "Sorry, this doesn't look like a valid email"
    );
    return;
  } else hideError("forgotEmailError");

  const res = await fetch("/forgot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: user, email: email }),
  });
  const data = await res.json();
  if (data.status === "success") {
    switchPage("resetPage");
  } else {
    alert(data.message);
  }
});

// ----------------- Reset -----------------
document.getElementById("resetForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  let valid = true;
  const newP = resetNew.value.trim(),
    conP = resetConfirm.value.trim();

  if (!newP) {
    showError("resetNewError", "Please enter a new password");
    valid = false;
  } else if (!validateLength(newP)) {
    showError("resetNewError", "Password must be between 5 and 18 characters");
    valid = false;
  } else hideError("resetNewError");

  if (!conP) {
    showError("resetConfirmError", "Please confirm your password");
    valid = false;
  } else if (newP !== conP) {
    showError("resetConfirmError", "Passwords do not match");
    valid = false;
  } else hideError("resetConfirmError");

  if (valid) {
    const res = await fetch("/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ new_password: newP, confirm_password: conP }),
    });
    const data = await res.json();
    if (data.status === "success") {
      alert(data.message);
      switchPage("loginPage");
    } else {
      alert(data.message);
    }
  }
});