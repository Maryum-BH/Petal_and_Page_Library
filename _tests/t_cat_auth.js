const { load, sleep } = require('./page'); const { execSync } = require('child_process');
const sql = q => execSync(`mysql -uroot library_db -N -e "${q}"`, { encoding: 'utf8' }).trim();
const BASE = Number(sql('SELECT MAX(activity_id) FROM activity_log'));
const logged = (action, item) => sql(`SELECT COUNT(*) FROM activity_log WHERE activity_id>${BASE} AND action='${action}' AND item='${item}'`);
let fails = 0; const check = (name, ok, extra='') => { console.log((ok ? 'PASS ' : 'FAIL ') + name + (ok ? '' : '  ' + extra)); if (!ok) fails++; };
(async () => {
  // ---------- Catalogue ----------
  let w = await load('catalogue.php', ['common.js', 'catalogue.js']);
  let d = w.document;
  const rows = [...d.querySelectorAll('.card table tr')].slice(1);
  check('catalogue: table rows = categories in DB', rows.length === Number(sql('SELECT COUNT(*) FROM categories')), rows.length);
  const first = rows.find(r => r.cells[0].textContent.startsWith('Fiction'));
  const db = sql("SELECT titles,physical_titles,digital_titles FROM v_category_stats WHERE category='Fiction'").split('\t');
  check('catalogue: Fiction counts match v_category_stats', first && [1,2,3].every(i => first.cells[i].textContent.replace(/,/g,'') === db[i-1]), first && first.textContent.replace(/\s+/g,' '));
  const activeLi = d.querySelectorAll('ul.simple li').length;
  check('catalogue: active list = active categories', activeLi === Number(sql('SELECT COUNT(*) FROM categories WHERE is_active=1')), activeLi);
  const csrc = require('fs').readFileSync('/home/claude/library_management_system_final/admin/catalogue.php','utf8');
  check('catalogue: catalogue.php source holds no numbers/rows', !/4,210|3,880|1,884|<td>Fiction/.test(csrc));
  // add through the UI
  d.querySelector('.box input').value = 'UI Test Cat'; d.querySelector('.box select').value = '';
  d.querySelector('.box button').click(); await sleep(1500);
  check('catalogue: add via UI writes to DB', sql("SELECT COUNT(*) FROM categories WHERE name='UI Test Cat'") === '1');
  check('catalogue: add via UI logged in activity_log', logged('Added category','UI Test Cat') === '1');
  check('catalogue: new row shown', d.body.textContent.includes('UI Test Cat'));
  // deactivate then delete via UI
  const newId = sql("SELECT category_id FROM categories WHERE name='UI Test Cat'");
  d.querySelector(`[data-toggle="${newId}"]`).click(); await sleep(1500);
  check('catalogue: deactivate saved', sql(`SELECT is_active FROM categories WHERE category_id=${newId}`) === '0');
  d.querySelector(`[data-del="${newId}"]`).click(); d.querySelector('[data-ok]').click(); await sleep(1500);
  check('catalogue: delete saved', sql("SELECT COUNT(*) FROM categories WHERE name='UI Test Cat'") === '0');
  // delete a category that has books -> error toast, row stays
  const busy = sql('SELECT DISTINCT category_id FROM books LIMIT 1');
  d.querySelector(`[data-del="${busy}"]`).click(); d.querySelector('[data-ok]').click(); await sleep(1500);
  check('catalogue: category with books refused', sql(`SELECT COUNT(*) FROM categories WHERE category_id=${busy}`) === '1' && !!d.querySelector('.toast.error'));

  // ---------- Authors ----------
  w = await load('authors.php', ['common.js', 'authors.js']); d = w.document;
  const arows = [...d.querySelectorAll('.card table tr')].slice(1);
  check('authors: rows = authors in DB', arows.length === Number(sql('SELECT COUNT(*) FROM authors')), arows.length);
  const dumas = arows.find(r => r.cells[0].textContent === 'Alexandre Dumas');
  check('authors: Titles Held from v_author_stats', dumas && dumas.cells[2].textContent === sql("SELECT titles_held FROM v_author_stats WHERE name='Alexandre Dumas'"));
  const src = require('fs').readFileSync('/home/claude/library_management_system_final/admin/authors.php','utf8');
  check('authors: authors.php source holds no author rows', !/Amara Okafor|Hiroshi Tanaka|Margaret Fell|<td>\d+<\/td>/.test(src));
  const [n, g] = d.querySelectorAll('.box input'); n.value = 'UI Author'; g.value = 'Essays';
  d.querySelector('button.btn').click(); await sleep(1500);
  check('authors: add writes DB + activity_log', sql("SELECT COUNT(*) FROM authors WHERE name='UI Author'") === '1' && logged('Added author','UI Author') === '1');
  const aid = sql("SELECT author_id FROM authors WHERE name='UI Author'");
  d.querySelector(`[data-edit="${aid}"]`).click();
  const m = d.querySelector('.modal'); m.querySelector('[name=genre]').value = 'Criticism'; m.querySelector('[name=rights]').value = 'Cleared';
  d.querySelector('[data-ok]').click(); await sleep(1500);
  check('authors: edit saved', sql(`SELECT CONCAT(primary_genre,'/',rights_status) FROM authors WHERE author_id=${aid}`) === 'Criticism/Cleared');
  check('authors: edit logged', logged('Updated author','UI Author') === '1');
  d.querySelector('th[data-sort="titles"]').click(); await sleep(50);
  const counts = [...d.querySelectorAll('.card table tr')].slice(1).map(r => Number(r.cells[2].textContent));
  check('authors: sort by titles ascending', counts.every((v, i) => i === 0 || counts[i-1] <= v));
  d.querySelector(`[data-del="${aid}"]`).click(); d.querySelector('[data-ok]').click(); await sleep(1500);
  check('authors: delete saved + logged', sql("SELECT COUNT(*) FROM authors WHERE name='UI Author'") === '0' && logged('Deleted author','UI Author') === '1');
  console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED'); process.exit(fails ? 1 : 0);
})();
