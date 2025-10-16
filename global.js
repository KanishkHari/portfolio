console.log("IT'S ALIVE!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// Step 3.1: Define pages
const pages = [
  { url: "/portfolio/index.html", label: "Home" },
  { url: "/portfolio/projects/index.html", label: "Projects" },
  { url: "/portfolio/contact/index.html", label: "Contact" },
  { url: "https://github.com/kanishkhari", label: "GitHub", external: true },
  { url: "/portfolio/Resume/index.html", label: "Resume" },
];

// Step 3.2 + 3.3: Create and insert nav
const navHTML = `
  <nav>
    ${pages.map(page => `<a href="${page.url}">${page.label}</a>`).join("")}
  </nav>
`;

document.querySelector("#site-header").innerHTML = navHTML;

// Step 2.2 + 2.3: Highlight current page
const navLinks = $$("nav a");

const currentLink = navLinks.find(
  a => a.host === location.host && a.pathname === location.pathname
);

currentLink?.classList.add("current");
