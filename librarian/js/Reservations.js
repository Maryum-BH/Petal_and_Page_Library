/* Reservations.js - needs api.js loaded first */
document.addEventListener('DOMContentLoaded', () => {
  const state = { search: '' };
  const tbody = $('.table tbody');
  const searchInput = $('.ledger-tools input');

  const STATUS_UI = {
    reserved:  ['res',     'Reserved'],
    expired:   ['expired', 'Expired'],
    picked_up: ['picked',  'Picked up'],
    shelved:   ['picked',  'Shelved']
  };
  const RED = 'style="color:#b80b0b"';

  function deadlineCell(r) {
    if (r.status === 'picked_up' || r.status === 'shelved' || !r.deadline) return '-----';
    const diff = new Date(r.deadline) - Date.now();
    if (diff < 0) return `<span ${RED}>Expired ${duration(-diff)} ago</span>`;
    if (diff <= 24 * 3600000) return `<span ${diff <= 2 * 3600000 ? RED : ''}>${duration(diff)} left</span>`;
    const d = new Date(r.deadline);
    const time = d.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' });
    return toISODate(d) === addDaysISO(todayISO(), 1)
      ? `Tomorrow ${time}`
      : `${d.toLocaleDateString('en', { day: 'numeric', month: 'short' })} ${time}`;
  }

  function actionCell(r) {
    if (r.status === 'reserved')
      return `<button class="clear-btn" data-id="${r.id}" data-action="picked_up">Mark picked up</button>`;
    if (r.status === 'expired')
      return `<button class="clear-btn" data-id="${r.id}" data-action="shelved">Mark shelved</button>`;
    return '<button class="clear-btn disabled" disabled>------</button>';
  }

  function rowHTML(r) {
    const [cls, label] = STATUS_UI[r.status];
    return `<tr>
      <td>${esc(r.book_title)}</td>
      <td>${esc(r.borrower_name)} - ${esc(r.borrower_id)}</td>
      <td>${deadlineCell(r)}</td>
      <td><span class="status ${cls}">${label}</span></td>
      <td>${actionCell(r)}</td>
    </tr>`;
  }

  async function load() {
    try {
      const { stats, rows } = await API.listReservations(state);
      const cards = $$('.card-title');                 // Reserved | Picked Up Today | Expiring Soon
      [stats.reserved, stats.picked_up_today, stats.expiring_soon].forEach((v, i) => {
        if (cards[i]) cards[i].textContent = v;
      });
      tbody.innerHTML = rows.length
        ? rows.map(rowHTML).join('')
        : '<tr><td colspan="5" class="text-muted py-4">No reservations found</td></tr>';
    } catch (e) { toast(e.message, 'danger'); }
  }

  // search: type, press Enter, or click the Search button
  const doSearch = () => { state.search = searchInput.value; load(); };
  searchInput.addEventListener('input', debounce(doSearch));
  searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
  $('.ledger-tools button').addEventListener('click', doSearch);

  // "Mark picked up" / "Mark shelved"
  tbody.addEventListener('click', async e => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    btn.disabled = true;
    try {
      await API.updateReservation({ id: Number(btn.dataset.id), action: btn.dataset.action });
      toast(btn.dataset.action === 'picked_up' ? 'Marked as picked up' : 'Marked as shelved');
    } catch (err) { toast(err.message, 'danger'); }
    load();
  });

  load();
  setInterval(load, 60000);          // keep the countdowns fresh
});
