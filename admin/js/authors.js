/* authors.js - Author Database
   Everything comes from ../AdminPHP/authors.php (the database). "Titles Held" is counted by the
   database from the catalogue, so it cannot be edited here. */
document.addEventListener('DOMContentLoaded', () => {
  const table = document.querySelector('.card table');
  const [nameInput, genreInput] = document.querySelectorAll('.box input');
  const RIGHTS = ['Cleared', 'Pending Review', 'Public Domain'];
  const BADGE = { 'Cleared': 'ok', 'Pending Review': 'warn', 'Public Domain': 'off' };
  const KEYS = ['name', 'genre', 'titles', 'rights', 'updated_raw'];
  let authors = [], sortKey = null, sortDir = 1;

  function render() {
    const view = [...authors];
    if (sortKey) view.sort((a, b) => (a[sortKey] > b[sortKey] ? 1 : a[sortKey] < b[sortKey] ? -1 : 0) * sortDir);
    const heads = ['Author', 'Genre', 'Titles Held', 'Rights Status', 'Last Updated']
      .map((h, i) => `<th class="sortable" data-sort="${KEYS[i]}">${h}${sortKey === KEYS[i] ? (sortDir > 0 ? ' ▲' : ' ▼') : ''}</th>`).join('');
    table.innerHTML = `<tr>${heads}<th>Actions</th></tr>` + (view.length ? view.map(a => `<tr>
        <td>${esc(a.name)}</td><td>${esc(a.genre)}</td><td>${a.titles}</td>
        <td><span class="badge ${BADGE[a.rights] || ''}">${esc(a.rights)}</span></td><td>${esc(a.updated)}</td>
        <td><button class="ui-btn small" data-edit="${a.id}">Edit</button>
            <button class="ui-btn small danger" data-del="${a.id}">Delete</button></td></tr>`).join('')
      : '<tr><td colspan="6">No authors yet.</td></tr>');
    applySearch();
  }

  // send a change; on success show the fresh list from the server. Returns an error text (or '') for modals.
  async function send(body) {
    try {
      const data = await api('authors.php', body);
      authors = data.authors; render();
      if (data.message) toast(data.message);
      return '';
    } catch (e) { toast(e.message, 'error'); return e.message; }
  }

  document.querySelector('button.btn').classList.add('ui-btn');
  document.querySelector('button.btn').onclick = async () => {
    const name = nameInput.value.trim(), genre = genreInput.value.trim();
    if (!name || !genre) return toast('Name and genre are both required.', 'error');
    if (!(await send({ action: 'add', name, genre }))) nameInput.value = genreInput.value = '';
  };

  table.addEventListener('click', e => {
    const { sort, edit, del } = e.target.dataset;
    if (sort) { sortDir = sortKey === sort ? -sortDir : 1; sortKey = sort; render(); }
    if (edit !== undefined) {
      const a = authors.find(x => x.id === Number(edit));
      openModal({
        title: 'Edit Author',
        body: `<label>Name</label><input name="name" value="${esc(a.name)}">
               <label>Genre</label><input name="genre" value="${esc(a.genre)}">
               <label>Rights status</label><select name="rights">${RIGHTS.map(r => `<option ${r === a.rights ? 'selected' : ''}>${r}</option>`).join('')}</select>`,
        onConfirm: m => {
          if (!field(m, 'name') || !field(m, 'genre')) return 'Name and genre are required.';
          send({ action: 'edit', author_id: a.id, name: field(m, 'name'), genre: field(m, 'genre'), rights: field(m, 'rights') });
        }
      });
    }
    if (del !== undefined) {
      const a = authors.find(x => x.id === Number(del));
      confirmBox(`Delete ${a.name} from the database?`, () => { send({ action: 'delete', author_id: a.id }); });
    }
  });

  api('authors.php').then(d => { authors = d.authors; render(); })
    .catch(e => { table.innerHTML = '<tr><td colspan="6">Could not load authors.</td></tr>'; toast(e.message, 'error'); });
});
