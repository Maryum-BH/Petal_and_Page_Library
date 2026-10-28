/* metrics.js - Check-Out Metrics page
   Every number comes from ../AdminPHP/metrics.php (which reads the database). */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('../AdminPHP/metrics.php', { credentials: 'same-origin' });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error);
    const d = json.data;

    showCards(d);
    showHourly(d.hourly);
    showWeekly(d.weekly);
    showDemand(d.high_demand);
  } catch (e) {
    toast(e.message || 'Could not load the metrics', 'error');
  }
  addExportButton();
});

// write a value and a small note into one of the three top boxes
function setCard(key, value, note) {
  const box = document.querySelector(`[data-kpi="${key}"]`);
  box.querySelector('h2').textContent = value;
  box.querySelector('p:last-child').textContent = note;
}

function showCards(d) {
  if (d.peak_hour) setCard('peak_hour', d.peak_hour.label, `${d.peak_hour.checkouts} check-outs`);
  else setCard('peak_hour', 'No data', 'No check-outs yet');

  if (d.busiest_category) setCard('busiest_category', d.busiest_category.name, `${d.busiest_category.percent}% of check-outs`);
  else setCard('busiest_category', 'No data', 'No check-outs yet');

  const s = d.storage;
  setCard('storage', `${Number(s.used_mb).toLocaleString()} MB`,
          `${s.percent}% of ${(s.capacity_mb / 1000000).toLocaleString()} TB capacity`);
}

// check-outs by hour (6 AM to 11 PM, the labels under the chart are already in the page)
function showHourly(hours) {
  const label = h => (h % 12 === 0 ? 12 : h % 12) + (h < 12 ? 'a' : 'p');
  drawBars(document.getElementById('hourBars'), hours.map(h => h.count),
           hours.map(h => `${label(h.hour)}: ${h.count} check-out${h.count === 1 ? '' : 's'}`));
}

// digital sessions for each day of the week
function showWeekly(days) {
  drawBars(document.getElementById('weekBars'), days.map(d => d.sessions),
           days.map(d => `${d.day}: ${d.sessions} session${d.sessions === 1 ? '' : 's'}`), { colour: 'red' });
}

// titles with a waitlist
function showDemand(rows) {
  const table = document.getElementById('demandTable');
  table.querySelector('.loading-row')?.remove();
  const wait = n => (n < 1 ? 'Today' : `${n} day${n === 1 ? '' : 's'}`);
  const html = rows.length
    ? rows.map(r => `<tr><td>${esc(r.title)}</td><td>${r.waitlist}</td><td>${wait(r.avg_wait_days)}</td></tr>`).join('')
    : '<tr><td colspan="3">Nobody is waiting for a book right now</td></tr>';
  table.querySelector('tr').insertAdjacentHTML('afterend', html);
}

// "Export CSV" button above the high-demand table
function addExportButton() {
  const box = [...document.querySelectorAll('.box')].pop();     // the High-Demand Resources box
  const table = box.querySelector('table');
  box.querySelector('h3').insertAdjacentHTML('afterend', '<button class="ui-btn small" id="export">Export CSV</button>');

  document.getElementById('export').onclick = () => {
    const csv = [...table.querySelectorAll('tr:not(.loading-row)')]
      .map(r => [...r.children].map(c => `"${c.textContent.trim().replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'high-demand-resources.csv';
    a.click();
    URL.revokeObjectURL(a.href);
    toast('CSV exported.');
  };
}
