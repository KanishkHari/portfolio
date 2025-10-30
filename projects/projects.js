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
  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );

  let newData = newRolledData.map(([year, count]) => {
    return { label: year, value: count };
  });

  let newSliceGenerator = d3.pie().value((d) => d.value);
  let newArcData = newSliceGenerator(newData);
  let newArcGenerator = d3.arc().innerRadius(0).outerRadius(50);

  let colors = d3.scaleOrdinal(d3.schemeTableau10);

  let svg = d3.select('#projects-pie-plot');
  svg.selectAll('path').remove();
  arcs.forEach((arc, i) => {
    svg
    .selectAll('path')
    .data(newArcData)
    .join('path')
    .attr('d', newArcGenerator)
    .attr('fill', (_, i) => colors(i))
    .style('cursor', 'pointer')
    .classed('selected', (_, i) => selectedIndex == i)
    .on('click', () => {
      selectedIndex = selectedIndex === i ? -1 : i;
    });
  });

  let legend = d3.select('.legend');
  legend.selectAll('*').remove();

  // Draw slices
  
    

  // Draw legend items
  legend
    .selectAll('li')
    .data(newData)
    .join('li')
    .text((d) => `${d.label} (${d.value})`)
    .classed('selected', (_, i) => selectedIndex === i)
    .on('click', (_, d) => {
      const idx = newData.findIndex(a => a.label === d.label);
      selectedIndex = selectedIndex === idx ? -1 : idx;
      updateFilters();
    });
  }
  loadProjects();