/* ==========================================================
   SABIQUE BITES - JavaScript
   1. Setup   2. Mobile menu   3. Header & active links
   4. Menu filter   5. Scroll reveal   6. Image fallback
   7. Reservation form validation   8. Back-to-top button
   ========================================================== */

// Tell CSS that JavaScript is running (used by the reveal animation)
document.documentElement.classList.add("js");

/* ---------- 1. Setup ---------- */
document.getElementById("year").textContent = new Date().getFullYear();

const header = document.getElementById("header");
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");
const toTop = document.getElementById("toTop");

/* ---------- 2. Mobile hamburger menu ---------- */
function closeMenu() {
  navLinks.classList.remove("open");
  hamburger.classList.remove("open");
  hamburger.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}

hamburger.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  hamburger.classList.toggle("open", isOpen);
  hamburger.setAttribute("aria-expanded", String(isOpen));
  // Stop the page scrolling behind the open menu
  document.body.style.overflow = isOpen ? "hidden" : "";
});

// Close the menu after tapping any link inside it
navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

// Close the menu with the Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

/* ---------- 3. Header style & active nav link on scroll ---------- */
const sections = document.querySelectorAll("main section[id]");
const navAnchors = document.querySelectorAll(".nav-link");

function onScroll() {
  // Dark background on header after scrolling a little
  header.classList.toggle("scrolled", window.scrollY > 60);

  // Show or hide the back-to-top button
  toTop.classList.toggle("show", window.scrollY > 500);

  // Highlight the nav link of the section currently in view
  let current = "home";
  sections.forEach((section) => {
    if (window.scrollY >= section.offsetTop - 140) current = section.id;
  });
  navAnchors.forEach((a) => {
    a.classList.toggle("active", a.getAttribute("href") === "#" + current);
  });
}
window.addEventListener("scroll", onScroll);
onScroll();

/* ---------- 4. Menu category filter ---------- */
const filterButtons = document.querySelectorAll(".filter-btn");
const menuCards = document.querySelectorAll(".menu-card");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    // Update which button looks active
    filterButtons.forEach((b) => b.classList.remove("active"));
    button.classList.add("active");

    // Show or hide cards
    menuCards.forEach((card) => {
      const match = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("hide", !match);
      if (match) {
        // Restart the fade-in animation
        card.style.animation = "none";
        void card.offsetWidth; // forces the browser to reset the animation
        card.style.animation = "";
      }
    });
  });
});

/* ---------- 5. Scroll reveal animation ---------- */
const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target); // animate only once
        }
      });
    },
    { threshold: 0.15 }
  );
  revealItems.forEach((item) => observer.observe(item));
} else {
  // Very old browsers: just show everything
  revealItems.forEach((item) => item.classList.add("visible"));
}

/* ---------- 6. Image fallback ---------- */
// If a photo fails to load (for example, no internet), hide the broken icon
// so the dark card background shows instead.
document.querySelectorAll("img").forEach((img) => {
  img.addEventListener("error", () => {
    img.style.visibility = "hidden";
  });
});

/* ---------- 7. Reservation form validation ---------- */
const form = document.getElementById("reservationForm");
const formMessage = document.getElementById("formMessage");
const dateInput = document.getElementById("date");

// Do not allow past dates in the date picker
function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}
dateInput.min = todayString();

// Show or clear an error for one field
function setError(id, message) {
  const input = document.getElementById(id);
  const errorBox = document.getElementById(id + "Error");
  errorBox.textContent = message;
  input.classList.toggle("invalid", message !== "");
  input.classList.toggle("valid", message === "" && input.value.trim() !== "");
  return message === ""; // true when the field is OK
}

// One small function per field
function validateName() {
  const value = document.getElementById("name").value.trim();
  if (value === "") return setError("name", "Please enter your name.");
  if (value.length < 2) return setError("name", "Name must have at least 2 characters.");
  if (!/^[A-Za-z\s.'-]+$/.test(value)) return setError("name", "Use letters only in the name.");
  return setError("name", "");
}

function validatePhone() {
  // Remove spaces, dashes and brackets before checking
  const value = document.getElementById("phone").value.replace(/[\s\-()]/g, "");
  if (value === "") return setError("phone", "Please enter your phone number.");
  // Accepts 10 digits starting 6-9, with optional +91 or 0 in front
  if (!/^(\+91|91|0)?[6-9]\d{9}$/.test(value)) {
    return setError("phone", "Enter a valid 10-digit mobile number.");
  }
  return setError("phone", "");
}

function validateDate() {
  const value = dateInput.value;
  if (value === "") return setError("date", "Please choose a date.");
  if (value < todayString()) return setError("date", "Date cannot be in the past.");
  return setError("date", "");
}

function validateTime() {
  const value = document.getElementById("time").value;
  if (value === "") return setError("time", "Please choose a time.");
  // Sample opening hours: 11:00 to 23:00
  if (value < "11:00" || value > "23:00") {
    return setError("time", "Please pick a time between 11:00 AM and 11:00 PM.");
  }
  // If booking for today, the time must still be in the future
  if (dateInput.value === todayString()) {
    const now = new Date();
    const current = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
    if (value <= current) return setError("time", "That time has already passed today.");
  }
  return setError("time", "");
}

function validateGuests() {
  const value = document.getElementById("guests").value;
  if (value === "") return setError("guests", "Please enter the number of guests.");
  const number = Number(value);
  if (!Number.isInteger(number)) return setError("guests", "Guests must be a whole number.");
  if (number < 1 || number > 20) return setError("guests", "Guests must be between 1 and 20.");
  return setError("guests", "");
}

// Check each field again when the user leaves it
document.getElementById("name").addEventListener("blur", validateName);
document.getElementById("phone").addEventListener("blur", validatePhone);
dateInput.addEventListener("change", () => { validateDate(); if (document.getElementById("time").value) validateTime(); });
document.getElementById("time").addEventListener("change", validateTime);
document.getElementById("guests").addEventListener("blur", validateGuests);

function showMessage(text, type) {
  formMessage.textContent = text;
  formMessage.className = "form-message show " + type;
}

form.addEventListener("submit", (event) => {
  event.preventDefault(); // stop the page from reloading

  // Run every check (all of them run so every error is shown at once)
  const results = [validateName(), validatePhone(), validateDate(), validateTime(), validateGuests()];
  const allValid = results.every(Boolean);

  if (!allValid) {
    showMessage("Please fix the highlighted fields and try again.", "fail");
    return;
  }

  // IMPORTANT: there is no backend here, so nothing is sent or saved.
  // To accept real bookings later, connect a service (e.g. Netlify Forms,
  // Formspree, or your own server) at this point.
  const name = document.getElementById("name").value.trim();
  const guests = document.getElementById("guests").value;
  const date = dateInput.value;
  const time = document.getElementById("time").value;

  showMessage(
    `Thank you, ${name}. Your details look valid (${guests} guest(s) on ${date} at ${time}). ` +
    "Note: this is a demo form, so your booking has NOT been sent. " +
    "Please contact the restaurant directly to confirm your table.",
    "success"
  );

  form.reset();
  form.querySelectorAll("input").forEach((i) => i.classList.remove("valid", "invalid"));
});

/* ---------- 8. Back-to-top button ---------- */
toTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
