/* Fines.js - needs api.js loaded first */
document.addEventListener('DOMContentLoaded', () => {
  const state = { search: '' };
  let rows = [];

  const tbody = $('.table tbody');
  const searchInput = $('.ledger-tools input');
  const pdfBtn = $('.ledger-tools button');

  function rowHTML(r) {
    const unpaid = r.status === 'unpaid';
    return `<tr>
      <td>${esc(r.borrower_name)} - ${esc(r.borrower_id)}</td>
      <td>${esc(r.book_title)}</td>
      <td>${r.days_late}</td>
      <td>${money(r.amount)}</td>
      <td><span class="status ${unpaid ? 'unpaid' : 'cleared'}">${unpaid ? 'Unpaid' : 'Cleared'}</span></td>
      <td>${unpaid
        ? `<button class="clear-btn" data-id="${r.id}">Clear</button>`
        : '<button class="clear-btn disabled" disabled>----</button>'}</td>
    </tr>`;
  }

  async function load() {
    try {
      const res = await API.listFines(state);
      rows = res.rows;
      const cards = $$('.card-title');            // Total Fines | Borrowers With Fines | Cleared This Week
      if (cards[0]) cards[0].textContent = money(res.stats.total_unpaid);
      if (cards[1]) cards[1].textContent = res.stats.borrowers_with_fines;
      if (cards[2]) cards[2].textContent = money(res.stats.cleared_this_week);
      tbody.innerHTML = rows.length
        ? rows.map(rowHTML).join('')
        : '<tr><td colspan="6" class="text-muted py-4">No fines found</td></tr>';
    } catch (e) { toast(e.message, 'danger'); }
  }

  searchInput.addEventListener('input', debounce(() => { state.search = searchInput.value; load(); }));

  tbody.addEventListener('click', async e => {
    const btn = e.target.closest('button[data-id]');
    if (!btn) return;
    if (!confirm('Mark this fine as paid?')) return;
    btn.disabled = true;
    try { await API.clearFine({ id: Number(btn.dataset.id) }); toast('Fine cleared'); }
    catch (err) { toast(err.message, 'danger'); }
    load();
  });

  /* Download PDF.
     For now: open a clean print view -> the librarian chooses "Save as PDF".
     Later with PHP: replace the body of this function with
         window.location.href = API_BASE + 'fines_pdf.php?search=' + encodeURIComponent(state.search);  */
  pdfBtn.addEventListener('click', () => {
    if (!rows.length) return toast('Nothing to export', 'warning');
    const w = window.open('', '_blank');
    if (!w) return toast('Allow pop-ups to download the PDF', 'warning');
    const body = rows.map(r => `<tr><td>${esc(r.borrower_name)} - ${esc(r.borrower_id)}</td>
      <td>${esc(r.book_title)}</td><td>${r.days_late}</td><td>${money(r.amount)}</td>
      <td>${r.status === 'unpaid' ? 'Unpaid' : 'Cleared'}</td></tr>`).join('');
    w.document.write(`<!doctype html><title>Fines ledger</title>
      <style>body{font-family:Arial,sans-serif;padding:24px}table{width:100%;border-collapse:collapse}
      th,td{border:1px solid #999;padding:8px;text-align:left}</style>
      <h2>Fines ledger</h2><p>${new Date().toLocaleDateString()}</p>
      <table><tr><th>Borrower</th><th>Book</th><th>Days late</th><th>Fine</th><th>Status</th></tr>${body}</table>`);
    w.document.close(); w.focus(); w.print();
  });

  load();
});
