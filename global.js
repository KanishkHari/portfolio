console.log("IT'S ALIVE!");

function $$(selector, context = document) { 
  return Array.from(context.querySelectorAll(selector));
}

const pages = [
  { url: "/portfolio/index.html", label: "Home" },
  { url: "/portfolio/projects/index.html", label: "Projects" },
  { url: "/portfolio/contact/index.html", label: "Contact" },
  { url: "https://github.com/kanishkhari", label: "GitHub", external: true },
  { url: "/portfolio/Resume/index.html", label: "Resume" },
];



const navHTML = `
  <nav>
    ${pages.map(page => `<a href="${page.url}">${page.label}</a>`).join("")}
  </nav>
`;

document.querySelector("#site-header").innerHTML = navHTML;


const navLinks = $$("nav a");

const currentLink = navLinks.find(
  a => a.host === location.host && a.pathname === location.pathname
);

currentLink?.classList.add("current");


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


const themeSelect = document.querySelector('.color-scheme select');

themeSelect.addEventListener('change', (e) => {
  document.documentElement.style.colorScheme = e.target.value;
});


const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  themeSelect.value = savedTheme;
  document.documentElement.style.colorScheme = savedTheme;
}
themeSelect.addEventListener('change', (e) => {
  const value = e.target.value;
  document.documentElement.style.colorScheme = value;
  document.documentElement.classList.remove('light', 'dark');

  if (value === 'light' || value === 'dark') {
    document.documentElement.classList.add(value);
  }

  localStorage.setItem('theme', value);
});
