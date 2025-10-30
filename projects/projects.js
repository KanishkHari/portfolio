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



// let selectedIndex = -1;
// let searchInput = document.querySelector('.searchBar');
// const projectsContainer = document.querySelector('.projects');
// function renderPieChart(projectsGiven) {
//   // 🔹 1. Aggregate project counts by year
//   let newRolledData = d3.rollups(
//     projectsGiven,
//     (v) => v.length,
//     (d) => d.year
//   );

//   let newData = newRolledData.map(([year, count]) => {
//     return { label: year, value: count };
//   });

//   let newSliceGenerator = d3.pie().value((d) => d.value);
//   let newArcData = newSliceGenerator(newData);
//   let newArcGenerator = d3.arc().innerRadius(0).outerRadius(50);

//   let colors = d3.scaleOrdinal(d3.schemeTableau10);

//   let svg = d3.select('#projects-pie-plot');
//   svg.selectAll('path').remove();
//   arcs.forEach((arc, i) => {
//     svg
//     .selectAll('path')
//     .data(newArcData)
//     .join('path')
//     .attr('d', newArcGenerator)
//     .attr('fill', (_, i) => colors(i))
//     .style('cursor', 'pointer')
//     .classed('selected', (_, i) => selectedIndex == i)
//     .on('click', () => {
//       selectedIndex = selectedIndex === i ? -1 : i;
//     });
//   });

//   let legend = d3.select('.legend');
//   legend.selectAll('*').remove();

//   // Draw slices
  
    

//   // Draw legend items
//   legend
//     .selectAll('li')
//     .data(newData)
//     .join('li')
//     .text((d) => `${d.label} (${d.value})`)
//     .classed('selected', (_, i) => selectedIndex === i)
//     .on('click', (_, d) => {
//       const idx = newData.findIndex(a => a.label === d.label);
//       selectedIndex = selectedIndex === idx ? -1 : idx;
//       updateFilters();
//     });
//   }
//   loadProjects();


import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// Global variables
let selectedIndex = -1;
let query = '';
let allProjects = [];

async function loadProjects() {
  // Fetch projects data
  allProjects = await fetchJSON('../lib/projects.json');
  console.log('Projects:', allProjects);
  
  const projectsContainer = document.querySelector('.projects');
  const titleElement = document.querySelector('.projects-title');
  
  // Initial render
  renderProjects(allProjects, projectsContainer, 'h2');
  
  if (titleElement) {
    titleElement.textContent = `Projects (${allProjects.length})`;
  }
  
  // Render initial pie chart
  renderPieChart(allProjects);
  
  // Setup search bar event listener
  const searchInput = document.querySelector('.searchBar');
  searchInput.addEventListener('input', (event) => {
    query = event.target.value;
    updateFilters();
  });
}

/**
 * Updates both the pie chart and projects display based on current filters
 */
function updateFilters() {
  const projectsContainer = document.querySelector('.projects');
  
  // Start with all projects
  let filteredProjects = allProjects;
  
  // Apply search query filter
  if (query.trim() !== '') {
    filteredProjects = filteredProjects.filter((project) => {
      let values = Object.values(project).join('\n').toLowerCase();
      return values.includes(query.toLowerCase());
    });
  }
  
  // Apply year filter (from pie chart selection)
  if (selectedIndex !== -1) {
    // Get the year from the current filtered data
    let rolledData = d3.rollups(
      filteredProjects,
      (v) => v.length,
      (d) => d.year
    );
    let data = rolledData.map(([year, count]) => {
      return { label: year, value: count };
    });
    
    const selectedYear = data[selectedIndex]?.label;
    if (selectedYear) {
      filteredProjects = filteredProjects.filter(
        (project) => project.year === selectedYear
      );
    }
  }
  
  // Update the display
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(query.trim() !== '' ? 
    allProjects.filter((project) => {
      let values = Object.values(project).join('\n').toLowerCase();
      return values.includes(query.toLowerCase());
    }) : allProjects
  );
}

/**
 * Renders the pie chart and legend based on given projects
 * @param {Array} projectsGiven - Array of project objects to visualize
 */
function renderPieChart(projectsGiven) {
  // STEP 3.1: Calculate data from projects
  // Group projects by year and count them
  let rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );
  
  // Convert to the format we need: [{ label: year, value: count }, ...]
  let data = rolledData.map(([year, count]) => {
    return { label: year, value: count };
  });
  
  // STEP 1.4: Setup D3 generators
  // Create slice generator (converts data values to angles)
  let sliceGenerator = d3.pie().value((d) => d.value);
  
  // Generate arc data (objects with startAngle and endAngle)
  let arcData = sliceGenerator(data);
  
  // Create arc generator (converts angles to path strings)
  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  
  // STEP 1.5: Setup color scale
  let colors = d3.scaleOrdinal(d3.schemeTableau10);
  
  // STEP 4.4: Clear existing paths and legend items
  let svg = d3.select('#projects-pie-plot');
  svg.selectAll('path').remove();
  
  let legend = d3.select('.legend');
  legend.selectAll('*').remove();
  
  // STEP 1.4 & STEP 5.2: Draw pie slices
  svg.selectAll('path')
    .data(arcData)
    .join('path')
    .attr('d', arcGenerator)
    .attr('fill', (_, i) => colors(i))
    .style('cursor', 'pointer')
    .attr('class', (_, i) => selectedIndex === i ? 'selected' : '')
    .on('click', (event, d) => {
      // Get the index of the clicked slice
      const clickedIndex = arcData.indexOf(d);
      
      // STEP 5.2: Toggle selection
      selectedIndex = selectedIndex === clickedIndex ? -1 : clickedIndex;
      
      // Update visual state of all paths
      svg.selectAll('path')
        .attr('class', (_, idx) => selectedIndex === idx ? 'selected' : '');
      
      // Update visual state of all legend items
      legend.selectAll('li')
        .attr('class', (_, idx) => selectedIndex === idx ? 'legend-item selected' : 'legend-item');
      
      // STEP 5.3: Filter projects based on selection
      updateFilters();
    });
  
  // STEP 2.2: Draw legend items
  legend.selectAll('li')
    .data(data)
    .join('li')
    .attr('style', (_, i) => `--color: ${colors(i)}`)
    .attr('class', (_, i) => selectedIndex === i ? 'legend-item selected' : 'legend-item')
    .html((d) => `<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
    .style('cursor', 'pointer')
    .on('click', (event, d) => {
      // Find the index of this data item
      const clickedIndex = data.indexOf(d);
      
      // STEP 5.2: Toggle selection
      selectedIndex = selectedIndex === clickedIndex ? -1 : clickedIndex;
      
      // Update visual state of all paths
      svg.selectAll('path')
        .attr('class', (_, idx) => selectedIndex === idx ? 'selected' : '');
      
      // Update visual state of all legend items
      legend.selectAll('li')
        .attr('class', (_, idx) => selectedIndex === idx ? 'legend-item selected' : 'legend-item');
      
      // STEP 5.3: Filter projects based on selection
      updateFilters();
    });
}

// Start the application
loadProjects();