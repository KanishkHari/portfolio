


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
  
  //  initial pie chart
  renderPieChart(allProjects);
  
  //  search bar event listener
  const searchInput = document.querySelector('.searchBar');
  searchInput.addEventListener('input', (event) => {
    query = event.target.value;
    updateFilters();
  });
}


function updateFilters() {
  const projectsContainer = document.querySelector('.projects');
  
  // Start with all projects
  let filteredProjects = allProjects;
  
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

 * @param {Array} projectsGiven - Array of project objects to visualize
 */
function renderPieChart(projectsGiven) {
  
  let rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );
  
 
  let data = rolledData.map(([year, count]) => {
    return { label: year, value: count };
  });
  
  // STEP 1.4: Setup D3 generators
  
  let sliceGenerator = d3.pie().value((d) => d.value);
  
  let arcData = sliceGenerator(data);
  
  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  
  
  let colors = d3.scaleOrdinal(d3.schemeTableau10);
  
  
  let svg = d3.select('#projects-pie-plot');
  svg.selectAll('path').remove();
  
  let legend = d3.select('.legend');
  legend.selectAll('*').remove();
  
  // S
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
      
      
      selectedIndex = selectedIndex === clickedIndex ? -1 : clickedIndex;
      
      
      svg.selectAll('path')
        .attr('class', (_, idx) => selectedIndex === idx ? 'selected' : '');
      
      // Update visual state of all legend items
      legend.selectAll('li')
        .attr('class', (_, idx) => selectedIndex === idx ? 'legend-item selected' : 'legend-item');
      
      //
      updateFilters();
    });

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
      

      selectedIndex = selectedIndex === clickedIndex ? -1 : clickedIndex;
      
      svg.selectAll('path')
        .attr('class', (_, idx) => selectedIndex === idx ? 'selected' : '');
      
      
      legend.selectAll('li')
        .attr('class', (_, idx) => selectedIndex === idx ? 'legend-item selected' : 'legend-item');
      

      updateFilters();
    });
}


loadProjects();