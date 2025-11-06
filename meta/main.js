import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
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
        // What other options do we need to set?
        // Hint: look up configurable, writable, and enumerable
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
  const files = d3.group(data, d => d.file);
  dl.append('dt').text('Number of Files');
  dl.append('dd').text(files.size);
  // avg lines per commit
  const avgLines = d3.mean(commits, d => d.totalLines);
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


let data = await loadData();
let commits = processCommits(data);

renderCommitInfo(data, commits);
