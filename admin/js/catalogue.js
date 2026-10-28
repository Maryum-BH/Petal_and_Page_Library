/* catalogue.js - Catalogue and Categories
   Everything comes from ../AdminPHP/catalogue.php (the database). Nothing is stored in the browser. */
document.addEventListener('DOMContentLoaded', () => {
  const table = document.querySelector('.card table');
  const list = document.querySelector('ul.simple');
  const nameInput = document.querySelector('.box input');
  const parentSelect = document.querySelector('.box select');
  const addBtn = document.querySelector('.box button');
  list.classList.add('searchable');
  let cats = [];

  // draw the list, the table and the "parent" drop-down from the rows the server sent
  function render() {
    const active = cats.filter(c => c.active);
    list.innerHTML = active.length
      ? active.map(c => `<li>${esc(c.name)} - ${c.titles.toLocaleString()}</li>`).join('')
      : '<li>No active categories.</li>';
    table.innerHTML = '<tr><th>Category</th><th>Titles</th><th>Physical</th><th>Digital</th><th>Status</th><th>Actions</th></tr>' +
      (cats.length ? cats.map(c => `<tr>
        <td>${esc(c.name)}${c.parent ? ` <small>(under ${esc(c.parent)})</small>` : ''}</td>
        <td>${c.titles.toLocaleString()}</td><td>${c.physical.toLocaleString()}</td><td>${c.digital.toLocaleString()}</td>
        <td><span class="badge ${c.active ? 'ok' : 'off'}">${c.active ? 'Active' : 'Inactive'}</span></td>
        <td><button class="ui-btn small" data-toggle="${c.id}">${c.active ? 'Deactivate' : 'Activate'}</button>
            <button class="ui-btn small danger" data-del="${c.id}">Delete</button></td></tr>`).join('')
        : '<tr><td colspan="6">No categories yet.</td></tr>');
    const chosen = parentSelect.value;
    parentSelect.innerHTML = '<option value="">None</option>' +
      cats.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
    parentSelect.value = chosen;
    applySearch();
  }

  // run a request, show the fresh list the server sends back, or show the server's error
  async function send(body, okMessage) {
    try {
      const data = await api('catalogue.php', body);
      cats = data.categories;
      render();
      const msg = okMessage || data.message;
      if (msg) toast(msg);
      return true;
    } catch (e) { toast(e.message, 'error'); return false; }
  }

  addBtn.onclick = async () => {
    const name = nameInput.value.trim();
    if (!name) return toast('Please enter a category name.', 'error');
    if (await send({ action: 'add', name, parent_id: parentSelect.value || null })) nameInput.value = '';
  };

  table.addEventListener('click', e => {
    const { toggle, del } = e.target.dataset;
    if (toggle !== undefined) send({ action: 'toggle', category_id: Number(toggle) });
    if (del !== undefined) {
      const c = cats.find(x => x.id === Number(del));
      confirmBox(`Delete the category "${c.name}"?`, () => { send({ action: 'delete', category_id: c.id }, 'Category deleted.'); });
    }
  });

  api('catalogue.php').then(d => { cats = d.categories; render(); })
    .catch(e => { table.innerHTML = '<tr><td colspan="6">Could not load categories.</td></tr>'; list.innerHTML = '<li>Could not load.</li>'; toast(e.message, 'error'); });
});
