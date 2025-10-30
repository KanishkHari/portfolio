import { fetchJSON, renderProjects } from '../global.js';
async function loadProjects() {
  const projects = await fetchJSON('../lib/projects.json');
  console.log('Projects:', projects);
  const projectsContainer = document.querySelector('.projects');
  renderProjects(projects, projectsContainer, 'h2');

  const titleElement = document.querySelector('.projects-title');
  if (titleElement) {
    titleElement.textContent = `Projects (${projects.length})`;
  }
}

loadProjects();

// import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
// let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
// let arc = arcGenerator({
//   startAngle: 0,
//   endAngle: 2 * Math.PI,
// });
// d3.select('svg').append('path').attr('d', arc).attr('fill', 'red');


// let data = [1, 2];
// let total = 0;

// for (let d of data) {
//   total += d;
// }
// let angle = 0;
// let arcData = [];

// for (let d of data) {
//   let endAngle = angle + (d / total) * 2 * Math.PI;
//   arcData.push({ startAngle: angle, endAngle });
//   angle = endAngle;
// }
// let arcs = arcData.map((d) => arcGenerator(d));

// arcs.forEach((arc) => {
//   // TODO, fill in step for appending path to svg using D3

// });

// Step 1.3 - import D3
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// Step 1.4 - basic data
let data = [1, 2];

// Step 1.3 - create an arc generator
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

// Step 1.4 - use D3 pie helper
let sliceGenerator = d3.pie();
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));

// Step 1.5 - color scale
let colors = d3.scaleOrdinal(d3.schemeTableau10);

// draw arcs
arcs.forEach((arc, idx) => {
  d3.select('svg')
    .append('path')
    .attr('d', arc)
    .attr('fill', colors(idx));
});

