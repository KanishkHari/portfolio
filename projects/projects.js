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
  searchInput.addEventListener('input', updateFilters);

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



let selectedIndex = -1;
let searchInput = document.querySelector('.searchBar');
const projectsContainer = document.querySelector('.projects');
function renderPieChart(projectsGiven) {
  // 🔹 1. Aggregate project counts by year
  let rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );

  let data = rolledData.map(([year, count]) => ({
    label: year,
    value: count,
  }));

  let sliceGenerator = d3.pie().value((d) => d.value);
  let arcData = sliceGenerator(data);
  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

  let colors = d3.scaleOrdinal(d3.schemeTableau10);

  let svg = d3.select('#projects-pie-plot');
  svg.selectAll('path').remove();

  let legend = d3.select('.legend');
  legend.selectAll('*').remove();

  // Draw slices
  arcData.forEach((d, i) => {
    svg.append('path')
      .attr('d', arcGenerator(d))
      .attr('fill', colors(i))
      .style('cursor', 'pointer')
      .classed('selected', selectedIndex === i) // highlight if selected
      .on('click', () => {
        selectedIndex = selectedIndex === i ? -1 : i; // toggle selection
        updateFilters(); // call function to apply filters and update chart
      });
  });

  // Draw legend items
  data.forEach((d, i) => {
    legend.selectAll('li')
    .data(data)
    .join('li')
    .text(d => `${d.label} (${d.value})`)
    .classed('selected', d => selectedIndex === d.label)
    .on('click', (event, d) => {
      selectedIndex = selectedIndex === d.label ? null : d.label;
      updateFilters();
    });
  });
}

function updateFilters() {
  // Filter projects by selected year
  let rolledData = d3.rollups(
    projects,
    (v) => v.length,
    (d) => d.year
  );

  let filteredByYear = selectedIndex === -1
    ? projects
    : projects.filter(p => p.year === rolledData[selectedIndex][0]);

  // Step 2: Filter by search query
  let query = searchInput.value.toLowerCase();
  let finalFiltered = filteredByYear.filter(project =>
    Object.values(project).join('\n').toLowerCase().includes(query)
  );

  // Step 3: Render projects and pie chart
  renderProjects(finalFiltered, projectsContainer, 'h2');
  renderPieChart(finalFiltered);
}

searchInput.addEventListener('input', updateFilters);

renderProjects(projects, projectsContainer, 'h2');
renderPieChart(projects);


loadProjects();