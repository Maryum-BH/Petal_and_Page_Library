/* digital.js - add publications, mark as ready, delete; summary cards update automatically */
document.addEventListener('DOMContentLoaded', () => {
  const table = document.querySelector('.card table');
  const [, titlesH2, pendingH2] = document.querySelectorAll('.box h2');
  const FORMATS = ['PDF', 'EPUB', 'MP3', 'MOBI'];

  let pubs = Store.get('pubs', null) ||
    rowsOf(table).map(r => { const c = cellsOf(r); return { title: c[0], format: c[1], size: c[2], status: c[3] }; });
  let counts = Store.get('digital_counts', { titles: num(titlesH2.textContent), pending: num(pendingH2.textContent) });

  function render() {
    table.innerHTML = '<tr><th>Publication</th><th>Format</th><th>Size</th><th>Status</th><th>Actions</th></tr>' +
      pubs.map((p, i) => `<tr><td>${esc(p.title)}</td><td>${esc(p.format)}</td><td>${esc(p.size)}</td>
        <td><span class="badge ${p.status === 'Ready' ? 'ok' : 'warn'}">${esc(p.status)}</span></td>
        <td>${p.status === 'Processing' ? `<button class="ui-btn small" data-ready="${i}">Mark Ready</button> ` : ''}
            <button class="ui-btn small danger" data-del="${i}">Delete</button></td></tr>`).join('');
    titlesH2.textContent = counts.titles.toLocaleString();
    pendingH2.textContent = counts.pending;
    Store.set('pubs', pubs); Store.set('digital_counts', counts);
    applySearch();
  }

  // Button placed next to the table heading
  const heading = document.querySelector('.card h3');
  heading.insertAdjacentHTML('afterend', '<button class="ui-btn" id="add-pub">+ Add Publication</button>');
  document.getElementById('add-pub').onclick = () => openModal({
    title: 'Add Publication',
    body: `<label>Title</label><input name="title" placeholder="Publication title">
           <label>Format</label><select name="format">${FORMATS.map(f => `<option>${f}</option>`).join('')}</select>
           <label>Size (MB)</label><input name="size" type="number" min="1" placeholder="e.g. 45">`,
    confirmText: 'Add',
    onConfirm: m => {
      if (!field(m, 'title')) return 'Title is required.';
      if (!(Number(field(m, 'size')) > 0)) return 'Enter a valid size in MB.';
      pubs.unshift({ title: field(m, 'title'), format: field(m, 'format'), size: field(m, 'size') + ' MB', status: 'Processing' });
      counts.titles++; counts.pending++;
      logActivity('Uploaded publication', field(m, 'title'));
      render();
      toast('Publication added and queued for processing.');
    }
  });

  table.addEventListener('click', e => {
    const { ready, del } = e.target.dataset;
    if (ready !== undefined) {
      pubs[ready].status = 'Ready'; counts.pending = Math.max(0, counts.pending - 1);
      logActivity('Published item', pubs[ready].title); render();
    }
    if (del !== undefined) {
      const p = pubs[del];
      confirmBox(`Delete "${p.title}"?`, () => {
        if (p.status === 'Processing') counts.pending = Math.max(0, counts.pending - 1);
        counts.titles = Math.max(0, counts.titles - 1);
        pubs.splice(del, 1); logActivity('Deleted publication', p.title); render(); toast('Publication deleted.');
      });
    }
  });

  render();
});
