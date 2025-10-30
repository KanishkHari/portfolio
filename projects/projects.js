// import { fetchJSON, renderProjects } from '../global.js';

// import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// async function loadProjects() {
//   const projects = await fetchJSON('../lib/projects.json');
//   console.log('Projects:', projects);

//   const projectsContainer = document.querySelector('.projects');
//   renderProjects(projects, projectsContainer, 'h2');

//   const titleElement = document.querySelector('.projects-title');
//   if (titleElement) {
//     titleElement.textContent = `Projects (${projects.length})`;
//   }
//   renderPieChart(projects);

//   let query = '';
//   let searchInput = document.querySelector('.searchBar');
//   searchInput.addEventListener('input', updateFilters);

//   renderPieChart(projects);
//   searchInput.addEventListener('change', (event) => {
//   // update query value
//   query = event.target.value;
//   let filteredProjects = projects.filter((project) => {
//     let values = Object.values(project).join('\n').toLowerCase();
//     return values.includes(query.toLowerCase());
//   });
//   renderProjects(filteredProjects, projectsContainer, 'h2');
// });
// }

// loadProjects();



// // Step 1.3 - import D3





//   // TODO: render updated projects!
// // import projects data from projects.json file
// // let projects = [
// //   {title:  "Personal Portfolio Website", year: "2025"},
// //   {title: "NBA Stats Analyzer", year: "2023"},
// //   {title: "Bridge Collapse Prediction",  year: "2024"},
// //   {title: "AI Equation Solver/Grapher", year: "2023"},
// //   {title: "Recipe Recommendation System", year: "2025"},
// //   {title: "Data Visualization Dashboard", year: "2023"},
// //   {title: "Earthquake Damage Visualizer", year: "2022"},
// //   {title: "Stock Trend Predictor", year: "2023"},
// //   {title: "Climate Change Impact Map", year: "2024"},
// //   {title: "COVID-19 Data Tracker", year: "2023"},
// //   {title: "Movie Review Sentiment Analyzer", year: "2024"},
// //   {title: "Web Accessibility Audit Tool", year: "2025"}
// // ]

// let selectedIndex = -1;
// let searchInput = document.querySelector('.searchBar');
// const projectsContainer = document.querySelector('.projects');
// function renderPieChart(projectsGiven) {
//   // 🔹 1. Aggregate project counts by year
//   let rolledData = d3.rollups(
//     projectsGiven,
//     (v) => v.length,
//     (d) => d.year
//   );

//   let data = rolledData.map(([year, count]) => ({
//     label: year,
//     value: count,
//   }));

//   let sliceGenerator = d3.pie().value((d) => d.value);
//   let arcData = sliceGenerator(data);
//   let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

//   let colors = d3.scaleOrdinal(d3.schemeTableau10);

//   let svg = d3.select('#projects-pie-plot');
//   svg.selectAll('path').remove();

//   let legend = d3.select('.legend');
//   legend.selectAll('*').remove();

//   // Draw slices
//   arcData.forEach((d, i) => {
//     svg.append('path')
//       .attr('d', arcGenerator(d))
//       .attr('fill', colors(i))
//       .style('cursor', 'pointer')
//       .classed('selected', selectedIndex === i) // highlight if selected
//       .on('click', () => {
//         selectedIndex = selectedIndex === i ? -1 : i; // toggle selection
//         updateFilters(); // call function to apply filters and update chart
//       });
//   });

//   // Draw legend items
//   data.forEach((d, i) => {
//     legend.selectAll('li')
//     .data(data)
//     .join('li')
//     .text(d => `${d.label} (${d.value})`)
//     .classed('selected', d => selectedYear === d.label)
//     .on('click', (event, d) => {
//       selectedYear = selectedYear === d.label ? null : d.label;
//       updateFilters();
//     });
//   });
// }

// function updateFilters() {
//   // Filter projects by selected year
//   let rolledData = d3.rollups(
//     projects,
//     (v) => v.length,
//     (d) => d.year
//   );

//   let filteredByYear = selectedIndex === -1
//     ? projects
//     : projects.filter(p => p.year === rolledData[selectedIndex][0]);

//   // Step 2: Filter by search query
//   let query = searchInput.value.toLowerCase();
//   let finalFiltered = filteredByYear.filter(project =>
//     Object.values(project).join('\n').toLowerCase().includes(query)
//   );

//   // Step 3: Render projects and pie chart
//   renderProjects(finalFiltered, projectsContainer, 'h2');
//   renderPieChart(finalFiltered);
// }

// searchInput.addEventListener('input', updateFilters);

// renderProjects(projects, projectsContainer, 'h2');
// renderPieChart(projects);


import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

let selectedIndex = -1;
let query = '';
let projects = [];
let searchInput;
let projectsContainer;

async function loadProjects() {
  projects = await fetchJSON('../lib/projects.json');
  projectsContainer = document.querySelector('.projects');
  searchInput = document.querySelector('.searchBar');

  renderProjects(projects, projectsContainer, 'h2');
  renderPieChart(projects);

  const titleElement = document.querySelector('.projects-title');
  if (titleElement) {
    titleElement.textContent = `Projects (${projects.length})`;
  }

  // Event listener for search input
  searchInput.addEventListener('input', () => {
    query = searchInput.value.toLowerCase();
    updateFilters();
  });
}

function renderPieChart(projectsGiven) {
  const svg = d3.select('#projects-pie-plot');
  const legend = d3.select('.legend');
  svg.selectAll('*').remove();
  legend.selectAll('*').remove();

  // 1️⃣ Aggregate project counts by year
  const rolledData = d3.rollups(projectsGiven, v => v.length, d => d.year);
  const data = rolledData.map(([year, count]) => ({ label: year, value: count }));

  const pie = d3.pie().value(d => d.value);
  const arcGenerator = d3.arc().innerRadius(0).outerRadius(60);
  const color = d3.scaleOrdinal(d3.schemeTableau10);
  const arcData = pie(data);

  // 2️⃣ Draw slices
  svg.selectAll('path')
    .data(arcData)
    .join('path')
    .attr('d', arcGenerator)
    .attr('fill', (d, i) => color(i))
    .classed('selected', (_, i) => selectedIndex === i)
    .on('click', (_, d, i) => {
      const idx = arcData.findIndex(a => a.data.label === d.data.label);
      selectedIndex = selectedIndex === idx ? -1 : idx;
      updateFilters();
    })
    .style('cursor', 'pointer');

  // 3️⃣ Draw legend
  legend.selectAll('li')
    .data(data)
    .join('li')
    .text(d => `${d.label} (${d.value})`)
    .classed('selected', (_, i) => selectedIndex === i)
    .on('click', (_, d) => {
      const idx = data.findIndex(a => a.label === d.label);
      selectedIndex = selectedIndex === idx ? -1 : idx;
      updateFilters();
    });
}

function updateFilters() {
  // 🟡 Filter by year
  const rolledData = d3.rollups(projects, v => v.length, d => d.year);
  const filteredByYear = selectedIndex === -1
    ? projects
    : projects.filter(p => p.year === rolledData[selectedIndex][0]);

  // 🟡 Filter by search query
  const filtered = filteredByYear.filter(p =>
    Object.values(p).join('\n').toLowerCase().includes(query)
  );

  // 🟢 Re-render everything
  renderProjects(filtered, projectsContainer, 'h2');
  renderPieChart(filtered);

  const titleElement = document.querySelector('.projects-title');
  if (titleElement) {
    titleElement.textContent = `Projects (${filtered.length})`;
  }
}

loadProjects();
