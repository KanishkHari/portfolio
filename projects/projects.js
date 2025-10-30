import { fetchJSON, renderProjects } from '../global.js';

import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

async function loadProjects() {
  const projects = await fetchJSON('../lib/projects.json');
  console.log('Projects:', projects);

  const projectsContainer = document.querySelector('.projects');
  renderProjects(projects, projectsContainer, 'h2');

  const titleElement = document.querySelector('.projects-title');
  if (titleElement) {
    titleElement.textContent = `Projects (${projects.length})`;
  }
  renderPieChart(projects);

  let query = '';
  let searchInput = document.querySelector('.searchBar');

  renderPieChart(projects);
  searchInput.addEventListener('change', (event) => {
  // update query value
  query = event.target.value;
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
  renderProjects(filteredProjects, projectsContainer, 'h2');
});
}

loadProjects();



// Step 1.3 - import D3





  // TODO: render updated projects!
// import projects data from projects.json file
// let projects = [
//   {title:  "Personal Portfolio Website", year: "2025"},
//   {title: "NBA Stats Analyzer", year: "2023"},
//   {title: "Bridge Collapse Prediction",  year: "2024"},
//   {title: "AI Equation Solver/Grapher", year: "2023"},
//   {title: "Recipe Recommendation System", year: "2025"},
//   {title: "Data Visualization Dashboard", year: "2023"},
//   {title: "Earthquake Damage Visualizer", year: "2022"},
//   {title: "Stock Trend Predictor", year: "2023"},
//   {title: "Climate Change Impact Map", year: "2024"},
//   {title: "COVID-19 Data Tracker", year: "2023"},
//   {title: "Movie Review Sentiment Analyzer", year: "2024"},
//   {title: "Web Accessibility Audit Tool", year: "2025"}
// ]
function renderPieChart(projectsGiven) {
  // 🔹 1. Aggregate project counts by year
  let rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );

  // 🔹 2. Convert into objects D3 can understand
  let data = rolledData.map(([year, count]) => ({
    label: year,
    value: count,
  }));

  // 🔹 3. Define pie and arc generators
  let sliceGenerator = d3.pie().value((d) => d.value);
  let arcData = sliceGenerator(data);
  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  let arcs = arcData.map((d) => arcGenerator(d));

  // 🔹 4. Define colors
  let colors = d3.scaleOrdinal(d3.schemeTableau10);

  // 🔹 5. Clear previous SVG paths & legend items
  let svg = d3.select('#projects-pie-plot');
  svg.selectAll('path').remove();

  let legend = d3.select('.legend');
  legend.selectAll('*').remove();

  // 🔹 6. Draw new pie slices
  arcs.forEach((arc, idx) => {
    svg.append('path')
      .attr('d', arc)
      .attr('fill', colors(idx));
  });

  // 🔹 7. Draw matching legend
  data.forEach((d, idx) => {
    legend.append('li')
      .attr('style', `--color:${colors(idx)}`)
      .attr('class', 'legend-item')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}
