console.log("IT'S ALIVE!");


function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const navLinks = $$("nav a");
const current = navLinks.find(link => 
  link.host === location.host && link.pathname === location.pathname
);
if (current) {
  current.classList.add("current");
}


let currentLink = navLinks.find(
  (a) => a.host === location.host && a.pathname === location.pathname,
);