// Renders an admin page in jsdom; fetch() is answered by the real PHP endpoints (via run.php).
const { JSDOM } = require('jsdom'); const fs = require('fs'); const { execFileSync } = require('child_process');
const ROOT = '/home/claude/library_management_system_final/admin/';
function phpFetch(url, opts = {}) {
  const m = String(url).match(/AdminPHP\/([\w.]+)/);
  if (!m) return Promise.resolve({ json: async () => ({ ok: true, user: { name: 'Himel' } }) });
  const args = ['run.php', m[1]]; if (opts.body) args.push(opts.body);
  let out; try { out = execFileSync('php', args, { cwd: __dirname, encoding: 'utf8' }); } catch (e) { out = e.stdout; }
  return Promise.resolve({ json: async () => JSON.parse(out) });
}
async function load(page, jsFiles) {
  const html = fs.readFileSync(ROOT + page, 'utf8').replace(/^<\?php.*?\?>/s, '');
  const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'http://localhost/admin/' + page });
  const w = dom.window;
  // let jsdom finish its own load first, so the load event can be fired by us exactly once
  if (w.document.readyState === 'loading') await new Promise(r => w.document.addEventListener('DOMContentLoaded', r));
  await new Promise(r => setTimeout(r, 50));
  w.fetch = phpFetch; w.eval('window.fetch = window.fetch;');
  // run ALL scripts in ONE eval so top-level const is shared
  w.eval(jsFiles.map(f => fs.readFileSync(ROOT + 'js/' + f, 'utf8')).join('\n;\n'));
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));      // fires exactly once
  await new Promise(r => setTimeout(r, 1500));
  return w;
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
module.exports = { load, sleep };
