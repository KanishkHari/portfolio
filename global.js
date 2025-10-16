// global.js
console.log("IT’S ALIVE!");

// ===== Helper =====
function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// ===== Step 3: Automatic Navigation Menu =====

// Detect base path: local vs GitHub Pages
const BASE_PATH =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "/" // Local dev
    : "/portfolio/"; // Replace 'portfolio' with your GitHub Pages repo name

// Define site pages
const pages = [
  { url: "", title: "Home" },
  { url: "projects/", title: "Projects" },
  { url: "contact/", title: "Contact" },
  { url: "https://github.com/KanishkHari", title: "Github" },
  { url: "Resume/", title: "Resume" },
];

// Create <nav> and add to top of <body>
const nav = document.createElement("nav");
document.body.prepend(nav);

// Build navigation links
for (const p of pages) {
  let url = p.url;
  const title = p.title;

  // Prefix internal links with BASE_PATH
  if (!url.startsWith("http")) {
    url = BASE_PATH + url;
  }

  // Create <a> element
  const a = document.createElement("a");
  a.href = url;
  a.textContent = title;

  // Highlight the current page
  a.classList.toggle(
    "current",
    a.host === location.host && a.pathname === location.pathname
  );

  // Open external links (like GitHub) in new tab
  if (a.host !== location.host) {
    a.target = "_blank";
  }

  // Add link to the nav
  nav.append(a);
}

// ===== Step 4: Dark Mode / Theme Switcher =====

document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <label class="color-scheme">
    Theme:
    <select>
      <option value="light dark">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>
  `
);

// 2️⃣ Get reference to the <select> element
const select = document.querySelector('label.color-scheme select');

// 3️⃣ Function to set color scheme
function setColorScheme(scheme) {
  document.documentElement.style.setProperty('color-scheme', scheme);
  localStorage.colorScheme = scheme; // persist preference
}

// 4️⃣ Load saved preference on page load (if exists)
if ('colorScheme' in localStorage) {
  setColorScheme(localStorage.colorScheme);
  select.value = localStorage.colorScheme;
} else {
  // default to automatic
  setColorScheme('light dark');
  select.value = 'light dark';
}

// 5️⃣ Listen for changes in the select dropdown
select.addEventListener('input', (event) => {
  setColorScheme(event.target.value);
});