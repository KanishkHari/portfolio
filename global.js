// global.js
console.log("ITS ALIVE!");

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
  { url: "Resume/", title: "Resume" },
  { url: "contact/", title: "Contact" },
  { url: "https://github.com/KanishkHari", title: "Github" },
  { url: "meta/", title: "Meta"},
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

// 1️⃣ Add theme switcher HTML
document.body.insertAdjacentHTML(
  "afterbegin",
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

const select = document.querySelector(".color-scheme select");

function setColorScheme(scheme) {
  if (scheme === "system") {
    // Follow system preference
    document.documentElement.removeAttribute("data-theme");
  } else {
    // Apply specific theme
    document.documentElement.setAttribute("data-theme", scheme);
  }

  // Save the choice to localStorage
  localStorage.setItem("colorScheme", scheme);

  // Update dropdown
  select.value = scheme;
}

const savedScheme = localStorage.getItem("colorScheme") || "system";
setColorScheme(savedScheme);

select.addEventListener("input", (event) => {
  setColorScheme(event.target.value);
});

// function from step 1.2 lab 4
export async function fetchJSON(url) {
  try {
    // Fetch the JSON file from the given URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    const data = await response.json();
    return data;


  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}

// lab 4 - step 1.4
// renderProjects function
export function renderProject(project) {
  const projectCard = document.createElement("div");
  projectCard.classList.add("project-card");

  // Create wrapper (link if URL exists, otherwise div)
  let wrapper;
  if (project.url) {
    wrapper = document.createElement("a");
    wrapper.href = project.url;
    wrapper.target = "_blank";
    wrapper.rel = "noopener noreferrer";
    wrapper.classList.add("project-link");
  } else {
    wrapper = document.createElement("div");
  }

  // Project image
  const img = document.createElement("img");
  img.src = project.image;
  img.alt = project.title;

  // Title
  const title = document.createElement("h3");
  title.textContent = project.title.replace(/-/g, " ");

  // Description
  const description = document.createElement("p");
  description.textContent = project.description;

  // Tags (if they exist)
  let tagsContainer;
  if (project.tags && project.tags.length > 0) {
    tagsContainer = document.createElement("div");
    tagsContainer.classList.add("tags");
    
    project.tags.forEach(tag => {
      const tagSpan = document.createElement("span");
      tagSpan.classList.add("tag");
      tagSpan.textContent = tag;
      tagsContainer.appendChild(tagSpan);
    });
  }

  // Year (if it exists)
  let year;
  if (project.year) {
    year = document.createElement("p");
    year.textContent = `Year: ${project.year}`;
    year.classList.add("project-year");
  }

  // Assemble the card
  wrapper.appendChild(img);
  wrapper.appendChild(title);
  wrapper.appendChild(description);
  
  if (tagsContainer) {
    wrapper.appendChild(tagsContainer);
  }
  
  if (year) {
    wrapper.appendChild(year);
  }

  projectCard.appendChild(wrapper);

  return projectCard;
}

export async function fetchGithubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
  // return statement here
}



