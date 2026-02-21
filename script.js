// ===================== AUTH =====================

function getUsers() {
  return JSON.parse(localStorage.getItem("acUsers") || "[]");
}

function saveUsers(users) {
  localStorage.setItem("acUsers", JSON.stringify(users));
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("acCurrentUser") || "null");
}

function setCurrentUser(user) {
  localStorage.setItem("acCurrentUser", JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem("acCurrentUser");
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getInitials(name) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

// ---- Nav state ----
function updateNav() {
  const user = getCurrentUser();
  const navUser = document.getElementById("navUser");
  const navLoginBtn = document.getElementById("navLoginBtn");
  const navAvatar = document.getElementById("navAvatar");
  const navUserName = document.getElementById("navUserName");

  if (user) {
    if (navUser) navUser.style.display = "flex";
    if (navLoginBtn) navLoginBtn.style.display = "none";
    if (navAvatar) navAvatar.textContent = getInitials(user.name);
    if (navUserName) navUserName.textContent = user.name.split(" ")[0];
  } else {
    if (navUser) navUser.style.display = "none";
    if (navLoginBtn) navLoginBtn.style.display = "inline-block";
  }
  updateMessageBadge();
}

function logout() {
  clearCurrentUser();
  showToast("You've been logged out.");
  setTimeout(() => { window.location.href = "index.html"; }, 1000);
}

// ---- Index page hero ----
function updateHero() {
  const user = getCurrentUser();
  const heroButtons = document.getElementById("heroButtons");
  const heroWelcome = document.getElementById("heroWelcome");
  if (!heroButtons) return;
  if (user) {
    heroButtons.style.display = "none";
    heroWelcome.style.display = "flex";
  } else {
    heroButtons.style.display = "flex";
    heroWelcome.style.display = "none";
  }
}

// ---- Gate protected pages ----
function checkAuthGate() {
  const authGate = document.getElementById("authGate");
  const mainContent = document.getElementById("mainContent");
  if (!authGate) return; // not a gated page

  const user = getCurrentUser();
  if (user) {
    authGate.style.display = "none";
    mainContent.style.display = "block";
  } else {
    authGate.style.display = "flex";
    mainContent.style.display = "none";
  }
}

function requireLogin(e) {
  if (e) e.preventDefault();
  const user = getCurrentUser();
  if (user) {
    window.location.href = "alumni.html";
  } else {
    openLoginModal();
  }
}

// ---- Login Modal ----
function openLoginModal() {
  const loginModal = document.getElementById("loginModal");
  if (loginModal) loginModal.style.display = "flex";
  clearLoginErrors();
}

function closeLoginModal() {
  const loginModal = document.getElementById("loginModal");
  if (loginModal) loginModal.style.display = "none";
  clearLoginErrors();
}

function switchToSignup() {
  document.getElementById("loginView").style.display = "none";
  document.getElementById("signupView").style.display = "block";
  clearLoginErrors();
}

function switchToLogin() {
  document.getElementById("signupView").style.display = "none";
  document.getElementById("loginView").style.display = "block";
  clearLoginErrors();
}

function clearLoginErrors() {
  ["loginNameError","loginEmailError","loginPasswordError",
   "signupNameError","signupEmailError","signupPasswordError"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = "";
  });
  document.querySelectorAll(".input-error").forEach(el => el.classList.remove("input-error"));
}

function handleLogin() {
  clearLoginErrors();
  const nameEl = document.getElementById("loginName");
  const emailEl = document.getElementById("loginEmail");
  const passEl = document.getElementById("loginPassword");
  const name = nameEl.value.trim();
  const email = emailEl.value.trim();
  const password = passEl.value;
  let valid = true;

  if (!name) {
    document.getElementById("loginNameError").textContent = "Please enter your name.";
    nameEl.classList.add("input-error"); valid = false;
  }
  if (!email || !validateEmail(email)) {
    document.getElementById("loginEmailError").textContent = "Please enter a valid email.";
    emailEl.classList.add("input-error"); valid = false;
  }
  if (!password) {
    document.getElementById("loginPasswordError").textContent = "Please enter your password.";
    passEl.classList.add("input-error"); valid = false;
  }
  if (!valid) return;

  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    document.getElementById("loginPasswordError").textContent = "Incorrect email or password. Try signing up if you're new.";
    passEl.classList.add("input-error");
    return;
  }

  setCurrentUser({ name: user.name, email: user.email });
  closeLoginModal();
  updateNav();
  updateHero();
  showToast(`Welcome back, ${user.name.split(" ")[0]}! 👋`);
}

function handleSignup() {
  clearLoginErrors();
  const nameEl = document.getElementById("signupName");
  const emailEl = document.getElementById("signupEmail");
  const passEl = document.getElementById("signupPassword");
  const name = nameEl.value.trim();
  const email = emailEl.value.trim();
  const password = passEl.value;
  let valid = true;

  if (!name) {
    document.getElementById("signupNameError").textContent = "Please enter your name.";
    nameEl.classList.add("input-error"); valid = false;
  }
  if (!email || !validateEmail(email)) {
    document.getElementById("signupEmailError").textContent = "Please enter a valid email.";
    emailEl.classList.add("input-error"); valid = false;
  }
  if (!password || password.length < 6) {
    document.getElementById("signupPasswordError").textContent = "Password must be at least 6 characters.";
    passEl.classList.add("input-error"); valid = false;
  }
  if (!valid) return;

  const users = getUsers();
  if (users.find(u => u.email === email)) {
    document.getElementById("signupEmailError").textContent = "An account with this email already exists.";
    emailEl.classList.add("input-error");
    return;
  }

  users.push({ name, email, password });
  saveUsers(users);
  setCurrentUser({ name, email });
  closeLoginModal();
  updateNav();
  updateHero();
  showToast(`Welcome to AlumniConnect, ${name.split(" ")[0]}! 🎉`);
}

function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "Hide";
  } else {
    input.type = "password";
    btn.textContent = "Show";
  }
}

window.addEventListener("click", (e) => {
  const loginModal = document.getElementById("loginModal");
  if (e.target === loginModal) closeLoginModal();
  if (e.target === modal) closeModal();
  if (e.target === profileModal) closeProfile();
});

// ===================== ALUMNI DATA =====================
const alumniData = [
  {
    name: "Sarah Johnson",
    role: "Software Engineer",
    company: "Google",
    degree: "Computer Science",
    year: 2020,
    location: "San Francisco",
    available: true,
    skills: ["Python", "Machine Learning", "System Design"],
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    bio: "Passionate about building scalable systems and mentoring new engineers. Happy to chat about breaking into Big Tech, interview prep, and navigating early career growth."
  },
  {
    name: "Michael Chen",
    role: "Senior Consultant",
    company: "Deloitte",
    degree: "Business Administration",
    year: 2019,
    location: "New York",
    available: true,
    skills: ["Strategy", "Financial Analysis", "Project Management"],
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    bio: "Specializing in digital transformation and organizational strategy. I love helping students figure out the consulting path and what it actually looks like day-to-day."
  },
  {
    name: "Emily Rodriguez",
    role: "Brand Marketing Manager",
    company: "Nike",
    degree: "Marketing",
    year: 2021,
    location: "Portland",
    available: true,
    skills: ["Brand Strategy", "Digital Marketing", "Content Creation"],
    photo: "https://randomuser.me/api/portraits/women/68.jpg",
    bio: "Working at the intersection of culture, sport, and storytelling. Reach out if you're curious about breaking into consumer brands or building a creative marketing career."
  },
  {
    name: "David Park",
    role: "Hardware Engineer",
    company: "Tesla",
    degree: "Electrical Engineering",
    year: 2018,
    location: "Austin",
    available: false,
    skills: ["Circuit Design", "Power Electronics", "Embedded Systems"],
    photo: "https://randomuser.me/api/portraits/men/75.jpg",
    bio: "Building the future of electric vehicles from the ground up. Currently unavailable for mentorship due to project commitments, but check back soon!"
  },
  {
    name: "Jessica Williams",
    role: "Clinical Psychologist",
    company: "Private Practice",
    degree: "Psychology",
    year: 2022,
    location: "Chicago",
    available: true,
    skills: ["Clinical Psychology", "Research", "Counseling"],
    photo: "https://randomuser.me/api/portraits/women/90.jpg",
    bio: "Running my own private practice focused on CBT and trauma-informed care. Happy to talk about grad school applications, licensure paths, and what clinical work really involves."
  },
  {
    name: "Alex Thompson",
    role: "Vice President",
    company: "Goldman Sachs",
    degree: "Finance",
    year: 2017,
    location: "New York",
    available: true,
    skills: ["Investment Banking", "M&A", "Financial Modeling"],
    photo: "https://randomuser.me/api/portraits/men/46.jpg",
    bio: "Eight years in investment banking, focused on M&A advisory. I mentor students on finance recruiting, networking, and building a career on Wall Street."
  }
];

// ===================== ALUMNI PAGE =====================
const grid = document.getElementById("alumniGrid");
const searchInput = document.getElementById("searchInput");
const degreeFilter = document.getElementById("degreeFilter");
const availableFilter = document.getElementById("availableFilter");
const sortSelect = document.getElementById("sortSelect");
const resultCount = document.getElementById("resultCount");

function getSortedFiltered() {
  const search = searchInput ? searchInput.value.toLowerCase() : "";
  const degree = degreeFilter ? degreeFilter.value : "";
  const onlyAvailable = availableFilter ? availableFilter.checked : false;
  const sort = sortSelect ? sortSelect.value : "";

  let filtered = alumniData.filter(a =>
    (!degree || a.degree === degree) &&
    (!onlyAvailable || a.available) &&
    JSON.stringify(a).toLowerCase().includes(search)
  );

  if (sort === "name-asc") filtered.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === "name-desc") filtered.sort((a, b) => b.name.localeCompare(a.name));
  else if (sort === "year-asc") filtered.sort((a, b) => a.year - b.year);
  else if (sort === "year-desc") filtered.sort((a, b) => b.year - a.year);

  return filtered;
}

function renderAlumni(data) {
  if (!grid) return;
  grid.innerHTML = "";
  resultCount.textContent = `${data.length} alumni found`;

  data.forEach((a, i) => {
    const globalIndex = alumniData.indexOf(a);
    const card = document.createElement("div");
    card.className = "alumni-card";
    card.style.animationDelay = `${i * 60}ms`;
    card.innerHTML = `
      <img src="${a.photo}" alt="${a.name}">
      <span class="availability-badge ${a.available ? 'badge-available' : 'badge-unavailable'}">
        ${a.available ? '● Available' : '● Unavailable'}
      </span>
      <h3>${a.name}</h3>
      <p class="role-line">${a.role} @ ${a.company}</p>
      <p class="meta-line">${a.degree} · ${a.year} · ${a.location}</p>
      <div class="skills">
        ${a.skills.map(s => `<span>${s}</span>`).join("")}
      </div>
      <div class="card-actions">
        <button class="btn btn-outline" onclick="openProfile(${globalIndex})">View Profile</button>
        <button class="btn" onclick="openModal(${globalIndex})" ${!a.available ? "disabled" : ""}>
          Message
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filterAlumni() {
  renderAlumni(getSortedFiltered());
}

if (grid) {
  renderAlumni(alumniData);
  if (searchInput) searchInput.addEventListener("input", filterAlumni);
  if (degreeFilter) degreeFilter.addEventListener("change", filterAlumni);
  if (availableFilter) availableFilter.addEventListener("change", filterAlumni);
  if (sortSelect) sortSelect.addEventListener("change", filterAlumni);
}

// ===================== PROFILE MODAL =====================
const profileModal = document.getElementById("profileModal");

function openProfile(index) {
  const a = alumniData[index];
  document.getElementById("profilePhoto").src = a.photo;
  document.getElementById("profileName").textContent = a.name;
  document.getElementById("profileRole").textContent = `${a.role} @ ${a.company}`;
  document.getElementById("profileMeta").textContent = `${a.degree} · Class of ${a.year} · ${a.location}`;
  document.getElementById("profileBio").textContent = a.bio;
  document.getElementById("profileSkills").innerHTML = a.skills.map(s => `<span>${s}</span>`).join("");
  document.getElementById("profileStatus").textContent = a.available ? "● Available for Mentorship" : "● Currently Unavailable";
  document.getElementById("profileStatus").className = `profile-status ${a.available ? 'badge-available' : 'badge-unavailable'}`;

  const msgBtn = document.getElementById("profileMessageBtn");
  if (a.available) {
    msgBtn.removeAttribute("disabled");
    msgBtn.onclick = () => { closeProfile(); openModal(index); };
  } else {
    msgBtn.setAttribute("disabled", true);
    msgBtn.onclick = null;
  }

  profileModal.style.display = "flex";
}

function closeProfile() {
  if (profileModal) profileModal.style.display = "none";
}

// ===================== MESSAGE MODAL =====================
const modal = document.getElementById("modal");
const messageBox = document.getElementById("messageBox");
const charCount = document.getElementById("charCount");
const senderName = document.getElementById("senderName");
const senderEmail = document.getElementById("senderEmail");
const modalRecipient = document.getElementById("modalRecipient");
let currentRecipientIndex = null;

function openModal(index) {
  currentRecipientIndex = index;
  const a = alumniData[index];
  if (modalRecipient) modalRecipient.textContent = `To: ${a.name}`;

  // Pre-fill from logged-in user
  const user = getCurrentUser();
  if (user) {
    if (senderName) senderName.value = user.name;
    if (senderEmail) senderEmail.value = user.email;
  }

  if (modal) modal.style.display = "flex";
  clearModalErrors();
}

function closeModal() {
  if (modal) modal.style.display = "none";
  if (messageBox) messageBox.value = "";
  if (charCount) charCount.textContent = "0";
  clearModalErrors();
}

function clearModalErrors() {
  document.querySelectorAll(".field-error").forEach(el => el.textContent = "");
  document.querySelectorAll(".input-error").forEach(el => el.classList.remove("input-error"));
}

function sendMessage() {
  clearModalErrors();
  let valid = true;
  const name = senderName ? senderName.value.trim() : "";
  const email = senderEmail ? senderEmail.value.trim() : "";
  const message = messageBox ? messageBox.value.trim() : "";

  if (!name) {
    document.getElementById("nameError").textContent = "Please enter your name.";
    senderName.classList.add("input-error"); valid = false;
  }
  if (!email || !validateEmail(email)) {
    document.getElementById("emailError").textContent = "Please enter a valid email address.";
    senderEmail.classList.add("input-error"); valid = false;
  }
  if (!message) {
    document.getElementById("messageError").textContent = "Please write a message.";
    messageBox.classList.add("input-error"); valid = false;
  }
  if (!valid) return;

  const recipient = alumniData[currentRecipientIndex];
  const newMsg = {
    id: Date.now(),
    to: recipient.name,
    toRole: `${recipient.role} @ ${recipient.company}`,
    toPhoto: recipient.photo,
    from: name,
    email: email,
    message: message,
    timestamp: new Date().toISOString()
  };

  const stored = JSON.parse(localStorage.getItem("alumniMessages") || "[]");
  stored.push(newMsg);
  localStorage.setItem("alumniMessages", JSON.stringify(stored));

  updateMessageBadge();
  showToast(`Message sent to ${recipient.name}! Redirecting…`);
  closeModal();
  setTimeout(() => { window.location.href = "messages.html"; }, 1800);
}

if (messageBox) {
  messageBox.addEventListener("input", () => {
    charCount.textContent = messageBox.value.length;
  });
}

// ===================== MESSAGES PAGE =====================
const messagesList = document.getElementById("messagesList");
const emptyState = document.getElementById("emptyState");

function renderMessages() {
  if (!messagesList) return;
  const stored = JSON.parse(localStorage.getItem("alumniMessages") || "[]");

  if (stored.length === 0) {
    if (emptyState) emptyState.style.display = "block";
    messagesList.style.display = "none";
    return;
  }

  if (emptyState) emptyState.style.display = "none";
  messagesList.style.display = "grid";
  messagesList.innerHTML = "";

  [...stored].reverse().forEach(msg => {
    const date = new Date(msg.timestamp);
    const formatted = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
      " at " + date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const el = document.createElement("div");
    el.className = "message-card";
    el.innerHTML = `
      <div class="message-header">
        <img src="${msg.toPhoto}" alt="${msg.to}">
        <div class="message-meta">
          <strong>To: ${msg.to}</strong>
          <span>${msg.toRole}</span>
          <small>${formatted}</small>
        </div>
        <button class="delete-btn" onclick="deleteMessage(${msg.id})" title="Delete">✕</button>
      </div>
      <div class="message-from">From: ${msg.from} &lt;${msg.email}&gt;</div>
      <p class="message-body">${msg.message}</p>
    `;
    messagesList.appendChild(el);
  });
}

function deleteMessage(id) {
  let stored = JSON.parse(localStorage.getItem("alumniMessages") || "[]");
  stored = stored.filter(m => m.id !== id);
  localStorage.setItem("alumniMessages", JSON.stringify(stored));
  updateMessageBadge();
  renderMessages();
}

function clearAllMessages() {
  if (confirm("Clear all messages? This cannot be undone.")) {
    localStorage.removeItem("alumniMessages");
    updateMessageBadge();
    renderMessages();
  }
}

if (messagesList) renderMessages();

// ===================== NAV BADGE =====================
function updateMessageBadge() {
  const badge = document.getElementById("msgBadge");
  if (!badge) return;
  const count = JSON.parse(localStorage.getItem("alumniMessages") || "[]").length;
  badge.textContent = count;
  badge.style.display = count > 0 ? "inline-block" : "none";
}

// ===================== TOAST =====================
function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// ===================== INIT =====================
updateNav();
updateHero();
checkAuthGate();