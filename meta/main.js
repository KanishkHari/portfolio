import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// Declare scales and commits at module level so they're accessible to all functions
let xScale, yScale, commits;
let filteredCommits;

async function loadData() {
  const data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));
  return data;
}

function processCommits(data) {
  return d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
        id: commit,
        url: 'https://github.com/kanishkhari/portfolio/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, 'lines', {
        value: lines,
        configurable: true,
        enumerable: false,
        writable: true,
      });

      return ret;
    });
}

function renderCommitInfo(data, commits) {
  // create dl element
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');
  // add total LOC
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  // add total commits
  dl.append('dt').text('Total Commits');
  dl.append('dd').text(commits.length);
  
  // num files
  const files = d3.group(data, (d) => d.file);
  dl.append('dt').text('Number of Files');
  dl.append('dd').text(files.size);
  
  // avg lines per commit
  const avgLines = d3.mean(commits, (d) => d.totalLines);
  dl.append('dt').text('Avg Lines per Commit');
  dl.append('dd').text(Math.round(avgLines));
  
  // work by time period
  const workByPeriod = d3.rollups(
    data,
    v => v.length,
    d => {
      const hour = commits.find(c => c.lines.includes(d))?.datetime.getHours() || 0;
      if (hour < 6) return 'Night';
      if (hour < 12) return 'Morning';
      if (hour < 18) return 'Afternoon';
      return 'Evening';
    }
  );
  
  // work by longest period
  const maxPeriod = d3.greatest(workByPeriod, d => d[1]);
  dl.append('dt').text('Most Active Period');
  dl.append('dd').text(maxPeriod ? maxPeriod[0] : 'N/A');
}

function renderScatterPlot(data, commits) {
  const width = 1000;
  const height = 600;
  const margin = { top: 10, right: 10, bottom: 30, left: 50 };
  
  // usableArea
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');
  
  // create xScale and yScale - UPDATE RANGES TO USE USABLE AREA
  xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([usableArea.left, usableArea.right])
    .nice();
    
  yScale = d3
    .scaleLinear()
    .domain([0, 24])
    .range([usableArea.bottom, usableArea.top]);
    
  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
  const rScale = d3.scaleSqrt()
    .domain([minLines, maxLines])
    .range([3, 20]);

  // Add gridlines BEFORE axes
  const gridLines = svg
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);

  gridLines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

  // create axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3
    .axisLeft(yScale)
    .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

  // add X axis
  svg
  .append('g')
  .attr('class', 'x-axis')
  .attr('transform', `translate(0, ${usableArea.bottom})`)
  .call(xAxis);
    
  // add y axis
  svg
    .append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);

  const sortedCommits = d3.sort(commits, d => -d.totalLines); 
  
  const dots = svg.append('g').attr('class', 'dots');
  
  dots
    .selectAll('circle')
    .data(sortedCommits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => rScale(d.totalLines))
    .attr('fill', 'steelblue')
    .style('fill-opacity', 0.7)
    .on('mouseenter', (event, commit) => {
      d3.select(event.currentTarget).style('fill-opacity', 1);
      renderTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mouseleave', (event) => {
      d3.select(event.currentTarget).style('fill-opacity', 0.7);
      updateTooltipVisibility(false);
    });

  // FIXED: Added brushed function to the event handler
  svg.call(d3.brush().on('start brush end', brushed));
  svg.selectAll('.dots, .overlay ~ *').raise();
}
function updateScatterPlot(data, commits) {
  const width = 1000;
  const height = 600;
  const margin = { top: 10, right: 10, bottom: 30, left: 50 };

  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  // Use the existing SVG
  const svg = d3.select("#chart").select("svg");

  // Update x-scale domain based on filtered commits
  xScale.domain(d3.extent(commits, (d) => d.datetime));

  // Rebuild rScale so bubbles resize properly
  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
  const rScale = d3.scaleSqrt()
    .domain([minLines, maxLines])
    .range([3, 20]);

  // Update X-axis
  const xAxis = d3.axisBottom(xScale);
  const xAxisGroup = svg.select("g.x-axis");
  xAxisGroup.selectAll("*").remove();
  xAxisGroup.call(xAxis);

  // Update dots
  const dots = svg.select("g.dots");

  const sorted = d3.sort(commits, (d) => -d.totalLines);

  dots
    .selectAll("circle")
    .data(sorted, (d) => d.id)
    .join(
      (enter) =>
        enter
          .append("circle")
          .attr("cx", (d) => xScale(d.datetime))
          .attr("cy", (d) => yScale(d.hourFrac))
          .attr("r", (d) => rScale(d.totalLines))
          .attr("fill", "steelblue")
          .style("fill-opacity", 0.7)
          .on("mouseenter", (event, commit) => {
            d3.select(event.currentTarget).style("fill-opacity", 1);
            renderTooltipContent(commit);
            updateTooltipVisibility(true);
            updateTooltipPosition(event);
          })
          .on("mouseleave", (event) => {
            d3.select(event.currentTarget).style("fill-opacity", 0.7);
            updateTooltipVisibility(false);
          }),

      (update) =>
        update
          .attr("cx", (d) => xScale(d.datetime))
          .attr("cy", (d) => yScale(d.hourFrac))
          .attr("r", (d) => rScale(d.totalLines)),

      (exit) => exit.remove()
    );
}

function renderTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const time = document.getElementById('commit-time');
  const author = document.getElementById('commit-author');
  const lines = document.getElementById('commit-lines');

  if (Object.keys(commit).length === 0) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', {
    dateStyle: 'full',
  });
  time.textContent = commit.time;
  author.textContent = commit.author;
  lines.textContent = commit.totalLines;
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;
}

function isCommitSelected(selection, commit) {
  if (!selection) {
    return false;
  }
  const [[x0, y0], [x1, y1]] = selection;
  const cx = xScale(commit.datetime);
  const cy = yScale(commit.hourFrac);
  
  return cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1;
}

function brushed(event) {
  const selection = event.selection;
  d3.selectAll('circle').classed('selected', (d) =>
    isCommitSelected(selection, d),
  );
  renderSelectionCount(selection);
  renderLanguageBreakdown(selection);
}

function renderSelectionCount(selection) {
  const selectedCommits = selection
    ? commits.filter((d) => isCommitSelected(selection, d))
    : [];

  const countElement = document.querySelector('#selection-count');
  countElement.textContent = `${
    selectedCommits.length || 'No'
  } commits selected`;

  return selectedCommits;
}

function renderLanguageBreakdown(selection) {
  const selectedCommits = selection
    ? commits.filter((d) => isCommitSelected(selection, d))
    : [];
  const container = document.getElementById('language-breakdown');

  if (selectedCommits.length === 0) {
    container.innerHTML = '';
    return;
  }
  const requiredCommits = selectedCommits.length ? selectedCommits : commits;
  const lines = requiredCommits.flatMap((d) => d.lines);

  // Use d3.rollup to count lines per language
  const breakdown = d3.rollup(
    lines,
    (v) => v.length,
    (d) => d.type,
  );

  // Update DOM with breakdown
  container.innerHTML = '';

  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format('.1~%')(proportion);

    container.innerHTML += `
      <dt>${language}</dt>
      <dd>${count} lines (${formatted})</dd>
    `;
  }
}

// Load data and render
let data = await loadData();
commits = processCommits(data);
filteredCommits = commits;

renderCommitInfo(data, commits);
renderScatterPlot(data, commits);

// Step 1.1 — Evolution timeline slider
let commitProgress = 100;
let timeScale;
let commitMaxTime;

function onTimeSliderChange() {
  const slider = document.getElementById("commit-progress");

  commitProgress = Number(slider.value);
  commitMaxTime = timeScale.invert(commitProgress);

  document.getElementById("commit-time").textContent =
    commitMaxTime.toLocaleString("en", {
      dateStyle: "long",
      timeStyle: "short",
    });

  filteredCommits = commits.filter((d) => d.datetime <= commitMaxTime);

  
  updateScatterPlot(data, filteredCommits);
}

// Build the time scale AFTER commits exist
timeScale = d3.scaleTime()
  .domain([
    d3.min(commits, d => d.datetime),
    d3.max(commits, d => d.datetime)
  ])
  .range([0, 100]);

commitMaxTime = timeScale.invert(commitProgress);

// Attach event listener
const slider = document.getElementById("commit-progress");
slider.addEventListener("input", onTimeSliderChange);

// Initialize UI once on load
onTimeSliderChange();