/* common.js - helpers shared by every admin page.
   Load this BEFORE the page's own js file. */

/* ---------- Storage: data is kept in the browser (localStorage) ---------- */
const memory = {};   // fallback if the browser blocks localStorage (e.g. some file:// setups)
const Store = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem('ath_' + key)) ?? fallback; }
    catch { return memory[key] ?? fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('ath_' + key, JSON.stringify(value)); }
    catch { memory[key] = value; }
  }
};

/* ---------- Small utilities ---------- */
const esc = s => String(s).replace(/[&<>"']/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = s => Number(String(s).replace(/[^\d.]/g, '')) || 0;           // "৳1,200" -> 1200
const today = () => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const rowsOf = table => [...table.querySelectorAll('tr')].slice(1);        // all rows except header
const cellsOf = row => [...row.querySelectorAll('td')].map(td => td.textContent.trim());
const field = (modal, name) => modal.querySelector(`[name=${name}]`).value.trim();

/* ---------- Toast message ---------- */
function toast(msg, type = 'ok') {
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

/* ---------- Talk to an AdminPHP endpoint ----------
   api('catalogue.php')                     -> GET, returns the "data" part
   api('catalogue.php', {action:'add',..})  -> POST JSON, returns the "data" part
   If the server says no, this throws an Error with the server's message. */
async function api(file, body) {
  const options = { credentials: 'same-origin' };
  if (body) Object.assign(options, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const res = await fetch('../AdminPHP/' + file, options);
  let json;
  try { json = await res.json(); } catch { throw new Error('The server sent an unexpected reply.'); }
  if (!json.ok) throw new Error(json.error || 'Something went wrong.');
  return json.data;
}

/* ---------- Modal dialog ----------
   onConfirm(modal) may return an error string to keep the dialog open. */
function openModal({ title, body, confirmText = 'Save', onConfirm }) {
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = `<div class="modal"><h3>${esc(title)}</h3>
    <div>${body}</div><p class="modal-error"></p>
    <div class="modal-actions">
      <button class="ui-btn ghost" data-close>Cancel</button>
      <button class="ui-btn" data-ok>${esc(confirmText)}</button>
    </div></div>`;
  document.body.appendChild(overlay);
  const close = () => { overlay.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  overlay.addEventListener('click', e => {
    if (e.target === overlay || e.target.hasAttribute('data-close')) close();
  });
  overlay.querySelector('[data-ok]').onclick = () => {
    const error = onConfirm(overlay);
    if (error) overlay.querySelector('.modal-error').textContent = error; else close();
  };
  overlay.querySelector('input,select,textarea')?.focus();
}

function confirmBox(message, onYes) {
  openModal({ title: 'Please confirm', body: `<p>${esc(message)}</p>`,
              confirmText: 'Yes, continue', onConfirm: onYes });
}

/* ---------- Recent-activity log (shown on the Overview page) ---------- */
function logActivity(action, item) {
  const log = Store.get('activity', []);
  const when = new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  log.unshift({ action, item, by: 'Himel', when });
  Store.set('activity', log.slice(0, 15));
}

/* ---------- Top search box: filters table rows and any .searchable list ---------- */
function applySearch() {
  const q = (document.querySelector('.search')?.value || '').toLowerCase();
  document.querySelectorAll('tr:has(td), .searchable li').forEach(el => {
    el.hidden = !el.textContent.toLowerCase().includes(q);
  });
}

/* ---------- Hover tooltips for bar charts (label comes from the row under the chart) ---------- */
function addBarTooltips(unit = '') {
  document.querySelectorAll('.barbox').forEach(chart => {
    const labels = [...(chart.nextElementSibling?.children || [])];
    [...chart.children].forEach((bar, i) => {
      bar.title = `${labels[i]?.textContent || i + 1}: ${bar.style.height}${unit}`;
    });
  });
}

/* ---------- Draw a bar chart from real numbers ----------
   The biggest value gets a full-height bar, the others are scaled to it.
   box      = the .barbox element       values = list of numbers
   titles   = tooltip text for each bar  options.extremes = lowest bar red, highest bar green
   options.colour = a class to add to every bar (e.g. 'red') */
function drawBars(box, values, titles, options = {}) {
  const max = Math.max(...values, 0);
  const min = Math.min(...values);
  const varied = max !== min;
  box.innerHTML = values.map((v, i) => {
    const height = max > 0 ? Math.max(Math.round(v / max * 100), v > 0 ? 4 : 1) : 1;   // zero still shows a thin line
    let cls = 'bar ' + (options.colour || '');
    if (options.extremes && varied) {
      if (v === max) cls += ' green';
      else if (v === min) cls += ' red';
    }
    return `<div class="${cls.trim()}" style="height:${height}%" title="${esc(titles[i])}"></div>`;
  }).join('');
}

/* ---------- Sidebar user box: shows saved profile, click to open the profile page ---------- */
function refreshUserbox() {
  const box = document.querySelector('.userbox');
  const p = Store.get('profile', null);
  if (!box) return;
  if (p) { const t = box.querySelectorAll('p'); t[0].textContent = p.name; t[1].textContent = p.role; }
  box.style.cursor = 'pointer';
  box.title = 'Open my profile';
  box.onclick = () => { location.href = 'profile.php'; };
}

/* ---------- Runs on every page ---------- */
document.addEventListener('DOMContentLoaded', () => {
  fetch('../config/session_user.php', {credentials:'same-origin'})
    .then(r => r.json()).then(x => {
      if (x.ok && x.user) {
        const u=x.user;
        Store.set('profile', {
          name:u.name || 'Admin', role:'Administrator', email:u.email || '',
          phone:'', joined:'2026'
        });
      }
    }).catch(()=>{});

  document.querySelector('.search')?.addEventListener('input', applySearch);
  refreshUserbox();

  // "Reset demo data" button in the sidebar
  const user = document.querySelector('.userbox');
  if (user) {
    const btn = document.createElement('button');
    btn.className = 'ui-btn ghost reset-btn';
    btn.textContent = 'Reset demo data';
    btn.onclick = () => confirmBox('Clear all saved changes and restore the original data?', async () => {
      try {
        const r = await fetch('reset_demo.php', {method:'POST', credentials:'same-origin'});
        const j = await r.json();
        if (!j.ok) return toast(j.error || 'Reset failed', 'error');
        try { Object.keys(localStorage).filter(k => k.startsWith('ath_')).forEach(k => localStorage.removeItem(k)); } catch {}
        location.reload();
      } catch (e) { toast('Could not reset demo database.', 'error'); }
    });
    user.after(btn);

  }
});
