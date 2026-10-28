/* index.js - Overview page
   Every number comes from ../AdminPHP/overview.php (which reads the database). */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('../AdminPHP/overview.php', { credentials: 'same-origin' });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error);

    showCards(json.data.cards);
    showCirculation(json.data.circulation);
    showCategories(json.data.categories);
    showActivity(json.data.activity);
  } catch (e) {
    toast(e.message || 'Could not load the overview', 'error');
  }
});

// the four boxes at the top (each box has data-kpi="name")
function showCards(cards) {
  Object.keys(cards).forEach(key => {
    const box = document.querySelector(`[data-kpi="${key}"]`);
    if (!box) return;
    countUp(box.querySelector('h2'), cards[key].value);
    box.querySelector('p:last-child').textContent = cards[key].note;
  });
}

// numbers count up from 0 (same little animation as before)
function countUp(el, target) {
  let step = 0;
  const timer = setInterval(() => {
    step++;
    el.textContent = Math.round(target * step / 30).toLocaleString();
    if (step === 30) clearInterval(timer);
  }, 20);
}

// circulation, last 14 days
function showCirculation(days) {
  const dates = days.map(d => new Date(d.date + 'T12:00:00'));
  const titles = days.map((d, i) => {
    const label = dates[i].toLocaleDateString('en', { day: 'numeric', month: 'short' });
    return `${label}: ${d.count} check-out${d.count === 1 ? '' : 's'}`;
  });
  drawBars(document.getElementById('circBars'), days.map(d => d.count), titles, { extremes: true });
  document.getElementById('circDates').innerHTML = dates.map(d => `<span>${d.getDate()}</span>`).join('');
}

// demand by category (the longest bar = the busiest category)
function showCategories(list) {
  const box = document.getElementById('catList');
  if (!list.length) { box.innerHTML = '<p>No check-outs yet</p>'; return; }
  const max = Math.max(...list.map(c => c.count));
  box.innerHTML = list.map(c => `
    <div class="category">
      <span>${esc(c.name)} - ${c.percent}%</span>
      <div class="track"><div class="fill" style="width:${Math.round(c.count / max * 100)}%"></div></div>
    </div>`).join('');
}

// latest staff actions
function showActivity(rows) {
  const table = document.getElementById('activityTable');
  table.querySelector('.loading-row')?.remove();
  const html = rows.length
    ? rows.map(a => `<tr><td>${esc(a.action)}</td><td>${esc(a.item)}</td><td>${esc(a.by)}</td><td>${esc(a.when)}</td></tr>`).join('')
    : '<tr><td colspan="4">No activity yet</td></tr>';
  table.querySelector('tr').insertAdjacentHTML('afterend', html);
}
