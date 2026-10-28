/* Inventory.js - needs api.js loaded first */
document.addEventListener('DOMContentLoaded', () => {
  const state = { search: '', category: '', status: '' };
  const tbody = $('.table tbody');

  const STATUS_UI = {
    available:    ['available',    'Available'],
    low_stock:    ['low-stock',    'Low stock'],
    out_of_stock: ['out-of-stock', 'Out of stock']
  };

  function rowHTML(b) {
    const [cls, label] = STATUS_UI[b.status];
    return `<tr data-id="${esc(b.id)}">
      <td class="book-id">${esc(b.id)}</td>
      <td class="book-name">${esc(b.title)}</td>
      <td class="author">${esc(b.author)}</td>
      <td><input type="number" min="0" step="1" class="qty-input ${b.copies === 0 ? 'zero' : ''}" data-field="copies" value="${b.copies}"></td>
      <td><input type="text" class="shelf-input" data-field="shelf" value="${esc(b.shelf)}"></td>
      <td><span class="status ${cls}">${label}</span></td>
    </tr>`;
  }

  async function load() {
    try {
      const rows = await API.listBooks(state);
      tbody.innerHTML = rows.length
        ? rows.map(rowHTML).join('')
        : '<tr><td colspan="6" class="text-muted py-4">No books found</td></tr>';
    } catch (e) { toast(e.message, 'danger'); }
  }

  // search box
  $('.filter input').addEventListener('input', debounce(e => {
    state.search = e.target.value;
    load();
  }));

  // the two dropdowns: 1st = category, 2nd = status (first item in each = "All")
  $$('.filter .dropdown').forEach((dd, i) => {
    const key = i === 0 ? 'category' : 'status';
    const btn = $('.filter-btn', dd);
    $$('.dropdown-item', dd).forEach((a, idx) => a.addEventListener('click', e => {
      e.preventDefault();
      const text = a.textContent.trim();
      btn.textContent = text;
      state[key] = idx === 0 ? '' : key === 'status' ? text.toLowerCase().replace(/ /g, '_') : text;
      load();
    }));
  });

  // auto-save: fires when a copies/shelf box loses focus or Enter is pressed
  tbody.addEventListener('change', async e => {
    const input = e.target.closest('input[data-field]');
    if (!input) return;
    const tr = input.closest('tr');
    try {
      const updated = await API.updateBook({ id: tr.dataset.id, [input.dataset.field]: input.value });
      tr.outerHTML = rowHTML(updated);          // refresh badge + red border
      toast('Saved');
    } catch (err) {
      toast(err.message, 'danger');
      load();                                    // put the old value back
    }
  });

  load();
});
