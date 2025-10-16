console.log("IT'S ALIVE!");

// ===== Helper =====
function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// ===== Navigation =====
const pages = [
  { url: "/portfolio/index.html", label: "Home" },
  { url: "/portfolio/projects/index.html", label: "Projects" },
  { url: "/portfolio/contact/index.html", label: "Contact" },
  { url: "https://github.com/kanishkhari", label: "GitHub", external: true },
  { url: "/portfolio/Resume/index.html", label: "Resume" },
];

const navHTML = `
  <nav>
    ${pages.map(page => {
      const target = page.external ? 'target="_blank"' : "";
      return `<a href="${page.url}" ${target}>${page.label}</a>`;
    }).join("")}
  </nav>
`;

document.querySelector("#site-header").innerHTML = navHTML;

const navLinks = $$("nav a");
const currentLink = navLinks.find(
  a => a.host === location.host && a.pathname === location.pathname
);
currentLink?.classList.add("current");

// ===== Theme Switcher =====
document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <label class="color-scheme">
    Theme:
    <select>
      <option value="system">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>
  `
);

const themeSelect = document.querySelector('.color-scheme select');

// ---- Apply theme ----
function setColorScheme(scheme) {
  if (scheme === "system") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", scheme);
  }
  localStorage.setItem("theme", scheme);
  themeSelect.value = scheme;
}

// ---- Load saved preference ----
const savedTheme = localStorage.getItem("theme") || "system";
setColorScheme(savedTheme);

// ---- Listen for changes ----
themeSelect.addEventListener("input", (e) => {
  setColorScheme(e.target.value);
});
