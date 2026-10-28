/* =====================================================================
   api.js  -  shared data layer + helpers
   Load this BEFORE the page script on every librarian page:
       <script src="api.js"></script>
       <script src="Inventory.js"></script>

   HOW THE PHP SWITCH WORKS
   ------------------------
   Every page script talks ONLY to the `API` object at the bottom of this
   file. While API_MODE is 'mock', the data lives in localStorage.
   When your PHP is ready:
       1. set API_MODE = 'php'
       2. create the PHP files listed below inside the php/ folder
   The page scripts do not change at all.

   PHP CONTRACT  (every call is a POST with a JSON body)
   -----------------------------------------------------
   Every PHP file must answer with JSON:
       success:  {"ok": true,  "data": ...}
       failure:  {"ok": false, "error": "Message to show the librarian"}

   php/dashboard_stats.php   {}
        -> {total_books, reserved_today, returns_today, overdue,
            notifications:[{type:'warning'|'info', title?, text}],
            activity:[{title?, text}]}
   php/books_list.php        {search, category, status}
        status values: '' | 'available' | 'low_stock' | 'out_of_stock'
        -> [{id, title, author, category, copies, shelf, status}]
   php/book_update.php       {id, copies?, shelf?}
        -> the updated book (same shape as above)
   php/reservations_list.php {search}
        -> {stats:{reserved, picked_up_today, expiring_soon},
            rows:[{id, book_title, borrower_id, borrower_name,
                   deadline (ISO string|null),
                   status:'reserved'|'expired'|'picked_up'|'shelved'}]}
   php/reservation_update.php {id, action:'picked_up'|'shelved'}
        -> true
   php/borrower_find.php     {id}                (a Library ID, e.g. LIB-00824)
        -> {id, name, tier, loan_days}           (error if not found)
   php/loan_create.php       {book_id, borrower_id, borrowed_on, due_on}
        dates are 'YYYY-MM-DD'  -> the new loan
   php/loans_find.php        {q}                 (open loans only)
        -> [{id, book_id, book_title, borrower_id, borrower_name,
             due_on, days_late, late_fee}]
   php/return_process.php    {loan_id, condition, waive_fee}
        condition: 'excellent' | 'good' | 'damaged'
        -> {fine_created, amount, needs_review}
   php/fines_list.php        {search}
        -> {stats:{total_unpaid, borrowers_with_fines, cleared_this_week},
            rows:[{id, borrower_id, borrower_name, book_title,
                   days_late, amount, status:'unpaid'|'cleared'}]}
   php/fine_clear.php        {id}
        -> true
   ===================================================================== */

const API_MODE = 'php';   // 'mock' = localStorage   |   'php' = real backend
const API_BASE = '../php/';  // PHP folder, relative to the HTML pages (html-css/)
const IMG_BASE = '../img/';  // image folder, relative to the HTML pages
const CURRENCY = 'tk';     // display only

/* ---- rules the SERVER will own later (only used by the mock) ---- */
const FINE_PER_DAY     = 10;   // 5 days late = 50 tk
const LOW_STOCK_AT     = 2;    // copies <= 2 counts as "low stock"
const EXPIRING_MINUTES = 120;  // "expiring soon" window for reservations
const TIER_DAYS = { Standard: 12, Premium: 21, VIP: 30 };   // loan length

/* =====================  small helpers (front-end)  ===================== */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = n => `${n} ${CURRENCY}`;
const debounce = (fn, ms = 300) => {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
};

function toast(msg, type = 'success') {           // type: success|danger|warning|info
  const el = document.createElement('div');
  el.className = `alert alert-${type} shadow`;
  el.style.cssText = 'position:fixed;top:20px;right:20px;z-index:2000;min-width:240px;max-width:360px;';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

const pad = n => String(n).padStart(2, '0');
const toISODate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayISO  = () => toISODate(new Date());
const addDaysISO = (iso, n) => {
  const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return toISODate(d);
};
const daysBetween = (a, b) =>
  Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000);
const isoToDMY = iso => (iso ? iso.split('-').reverse().join('/') : '');
function dmyToISO(str) {                          // '27/07/2026' -> '2026-07-27' | null
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(str).trim());
  if (!m) return null;
  const [, d, mo, y] = m.map(Number);
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return `${y}-${pad(mo)}-${pad(d)}`;
}
function duration(ms) {                           // 5940000 -> '1h 39m'
  const m = Math.max(0, Math.floor(ms / 60000));
  if (m >= 1440) return `${Math.floor(m / 1440)}d ${Math.floor((m % 1440) / 60)}h`;
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
}

/* =====================  PHP transport  ===================== */
async function callPhp(endpoint, payload) {
  const res = await fetch(API_BASE + endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',                  // sends the PHP session cookie
    body: JSON.stringify(payload || {})
  });
  let json;
  try { json = await res.json(); }
  catch { throw new Error('Server returned an invalid response'); }
  if (!json.ok) throw new Error(json.error || 'Request failed');
  return json.data;
}

function run(endpoint, payload, mockFn) {
  if (API_MODE === 'php') return callPhp(endpoint, payload);
  return new Promise((resolve, reject) => setTimeout(() => {   // tiny delay = like a network
    try { resolve(mockFn(payload || {})); } catch (e) { reject(e); }
  }, 120));
}

/* =====================  THE API  (page scripts use only this)  ===================== */
const API = {
  dashboardStats:    p => run('dashboard_stats.php',    p, MOCK.dashboardStats),
  listBooks:         p => run('books_list.php',         p, MOCK.listBooks),
  updateBook:        p => run('book_update.php',        p, MOCK.updateBook),
  listReservations:  p => run('reservations_list.php',  p, MOCK.listReservations),
  updateReservation: p => run('reservation_update.php', p, MOCK.updateReservation),
  findBorrower:      p => run('borrower_find.php',      p, MOCK.findBorrower),
  createLoan:        p => run('loan_create.php',        p, MOCK.createLoan),
  findLoans:         p => run('loans_find.php',         p, MOCK.findLoans),
  processReturn:     p => run('return_process.php',     p, MOCK.processReturn),
  listFines:         p => run('fines_list.php',         p, MOCK.listFines),
  clearFine:         p => run('fine_clear.php',         p, MOCK.clearFine)
};

/* =====================================================================
   EVERYTHING BELOW IS THE FAKE DATABASE (mock mode only).
   Once API_MODE = 'php' you can delete this whole section.
   ===================================================================== */
const DB_KEY = 'library_mock_db_v1';

function seed() {
  const now = Date.now(), today = todayISO();
  const min = m => new Date(now + m * 60000).toISOString();
  const day = n => addDaysISO(today, n);
  return {
    books: [
      { id: 'BK-1042', title: 'Clean Code',           author: 'Robert Martin',  category: 'Programming', copies: 4,  shelf: 'A-12' },
      { id: 'BK-1043', title: 'The Alchemist',        author: 'Paulo Coelho',   category: 'Fiction',     copies: 10, shelf: 'C-02' },
      { id: 'BK-1044', title: 'Shadow Slave',         author: 'Guiltythree',    category: 'Fiction',     copies: 2,  shelf: 'E-09' },
      { id: 'BK-0579', title: 'Six of Crows',         author: 'Leigh Bardugo',  category: 'Fiction',     copies: 0,  shelf: 'B-06' },
      { id: 'BK-2001', title: 'AI Basics',            author: 'Sample Author',  category: 'Science',     copies: 3,  shelf: 'D-01' },
      { id: 'BK-2002', title: 'C Programming',        author: 'Sample Author',  category: 'Programming', copies: 5,  shelf: 'A-03' },
      { id: 'BK-2003', title: 'Biology II',           author: 'Sample Author',  category: 'Science',     copies: 3,  shelf: 'F-04' },
      { id: 'BK-2004', title: 'Coding For Beginners', author: 'Sample Author',  category: 'Programming', copies: 0,  shelf: 'B-08' },
      { id: 'BK-2005', title: 'Fundamental Calculus', author: 'Sample Author',  category: 'Mathematics', copies: 6,  shelf: 'C-05' },
      { id: 'BK-2006', title: 'Java Programming',     author: 'Sample Author',  category: 'Programming', copies: 4,  shelf: 'A-07' }
    ],
    borrowers: [
      { id: 'LIB-00824', name: 'Faija Ahmed Mim', tier: 'Standard' },
      { id: 'LIB-00215', name: 'Sarah',           tier: 'Standard' },
      { id: 'LIB-00113', name: 'Asma',            tier: 'Premium'  },
      { id: 'LIB-00079', name: 'Faija',           tier: 'Standard' },
      { id: 'LIB-00219', name: 'Faija',           tier: 'Premium'  }
    ],
    loans: [
      { id: 1, book_id: 'BK-2003', borrower_id: 'LIB-00219', borrowed_on: day(-17), due_on: day(-5), returned_on: null,  condition: null },
      { id: 2, book_id: 'BK-2001', borrower_id: 'LIB-00215', borrowed_on: day(-12), due_on: day(0),  returned_on: null,  condition: null },
      { id: 3, book_id: 'BK-2002', borrower_id: 'LIB-00113', borrowed_on: day(-14), due_on: day(-2), returned_on: null,  condition: null },
      { id: 4, book_id: 'BK-2006', borrower_id: 'LIB-00113', borrowed_on: day(-10), due_on: day(2),  returned_on: today, condition: 'good' }
    ],
    fines: [
      { id: 1, loan_id: null, borrower_id: 'LIB-00215', book_id: 'BK-2001', days_late: 5, amount: 50, status: 'unpaid',  cleared_on: null },
      { id: 2, loan_id: null, borrower_id: 'LIB-00113', book_id: 'BK-2002', days_late: 2, amount: 20, status: 'cleared', cleared_on: today },
      { id: 3, loan_id: null, borrower_id: 'LIB-00079', book_id: 'BK-1043', days_late: 7, amount: 70, status: 'unpaid',  cleared_on: null }
    ],
    reservations: [
      { id: 1, book_id: 'BK-2001', borrower_id: 'LIB-00215', deadline: min(100),   status: 'reserved',  created_on: today, picked_on: null },
      { id: 2, book_id: 'BK-2002', borrower_id: 'LIB-00113', deadline: min(1200),  status: 'reserved',  created_on: today, picked_on: null },
      { id: 3, book_id: 'BK-1043', borrower_id: 'LIB-00079', deadline: min(-49),   status: 'reserved',  created_on: today, picked_on: null },
      { id: 4, book_id: 'BK-2001', borrower_id: 'LIB-00215', deadline: min(-123),  status: 'reserved',  created_on: today, picked_on: null },
      { id: 5, book_id: 'BK-1044', borrower_id: 'LIB-00113', deadline: null,       status: 'picked_up', created_on: today, picked_on: today }
    ],
    activity: [
      { type: 'info', text: 'Reservation approved for Faija' },
      { type: 'info', title: 'Java Programming',     text: 'returned by Asma' },
      { type: 'info', title: 'Fundamental Calculus', text: 'shelf location updated to C-05' }
    ]
  };
}

function db() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(DB_KEY)); } catch { /* ignore */ }
  if (!d) { d = seed(); saveDb(d); }
  return d;
}
const saveDb = d => localStorage.setItem(DB_KEY, JSON.stringify(d));
globalThis.resetMockDb = () => { localStorage.removeItem(DB_KEY); if (globalThis.location) location.reload(); };

const bookOf   = (d, id) => d.books.find(b => b.id === id);
const personOf = (d, id) => d.borrowers.find(p => p.id === id);
const nextId   = arr => arr.reduce((m, x) => Math.max(m, x.id), 0) + 1;
const bookStatus = copies => (copies <= 0 ? 'out_of_stock' : copies <= LOW_STOCK_AT ? 'low_stock' : 'available');
const resStatus  = r => (r.status === 'reserved' && r.deadline && new Date(r.deadline) < new Date() ? 'expired' : r.status);
const isExpiringSoon = r => resStatus(r) === 'reserved' && new Date(r.deadline) - Date.now() <= EXPIRING_MINUTES * 60000;
function log(d, entry) {
  d.activity.unshift({ type: 'info', ...entry, at: new Date().toISOString() });
  d.activity = d.activity.slice(0, 30);
}

const MOCK = {
  dashboardStats() {
    const d = db(), today = todayISO(), notifications = [];
    d.books.filter(b => b.copies <= 0).forEach(b =>
      notifications.push({ type: 'warning', title: b.title, text: `is out of stock at shelf ${b.shelf}` }));
    const expiring = d.reservations.filter(isExpiringSoon).length;
    if (expiring) notifications.push({ type: 'warning',
      text: `${expiring} reservation${expiring > 1 ? 's' : ''} expire within ${EXPIRING_MINUTES / 60} hours` });
    const dueToday = d.loans.filter(l => !l.returned_on && l.due_on === today).length;
    if (dueToday) notifications.push({ type: 'info',
      text: `${dueToday} return${dueToday > 1 ? 's' : ''} due for today` });
    return {
      total_books:    d.books.reduce((s, b) => s + b.copies, 0),
      reserved_today: d.reservations.filter(r => r.created_on === today).length,
      returns_today:  d.loans.filter(l => l.returned_on === today).length,
      overdue:        d.loans.filter(l => !l.returned_on && l.due_on < today).length,
      notifications,
      activity: d.activity.slice(0, 5)
    };
  },

  listBooks({ search = '', category = '', status = '' }) {
    const q = search.trim().toLowerCase();
    return db().books
      .map(b => ({ ...b, status: bookStatus(b.copies) }))
      .filter(b => (!q || `${b.id} ${b.title} ${b.author}`.toLowerCase().includes(q))
                && (!category || b.category === category)
                && (!status || b.status === status));
  },

  updateBook({ id, copies, shelf }) {
    const d = db(), b = bookOf(d, id);
    if (!b) throw new Error('Book not found');
    if (copies !== undefined) {
      const n = Number(copies);
      if (String(copies).trim() === '' || !Number.isInteger(n) || n < 0)
        throw new Error('Copies must be a whole number, 0 or more');
      b.copies = n;
    }
    if (shelf !== undefined) {
      const s = String(shelf).trim().toUpperCase();
      if (!s) throw new Error('Shelf cannot be empty');
      if (s !== b.shelf) { b.shelf = s; log(d, { title: b.title, text: `shelf location updated to ${s}` }); }
    }
    saveDb(d);
    return { ...b, status: bookStatus(b.copies) };
  },

  listReservations({ search = '' }) {
    const d = db(), q = search.trim().toLowerCase(), today = todayISO();
    const all = d.reservations.map(r => ({
      id: r.id,
      book_title: bookOf(d, r.book_id)?.title,
      borrower_id: r.borrower_id,
      borrower_name: personOf(d, r.borrower_id)?.name,
      deadline: r.deadline,
      status: resStatus(r)
    }));
    return {
      stats: {
        reserved: all.filter(r => r.status === 'reserved').length,
        picked_up_today: d.reservations.filter(r => r.status === 'picked_up' && r.picked_on === today).length,
        expiring_soon: d.reservations.filter(isExpiringSoon).length
      },
      rows: all.filter(r => !q || `${r.book_title} ${r.borrower_name} ${r.borrower_id}`.toLowerCase().includes(q))
    };
  },

  updateReservation({ id, action }) {
    const d = db(), r = d.reservations.find(x => x.id === Number(id));
    if (!r) throw new Error('Reservation not found');
    const b = bookOf(d, r.book_id), p = personOf(d, r.borrower_id), st = resStatus(r);
    if (action === 'picked_up') {
      if (st !== 'reserved') throw new Error('This reservation is not active');
      r.status = 'picked_up'; r.picked_on = todayISO();
      log(d, { title: b?.title, text: `picked up by ${p?.name}` });
    } else if (action === 'shelved') {
      if (st !== 'expired') throw new Error('Only expired reservations can be shelved');
      r.status = 'shelved';
      log(d, { title: b?.title, text: 'returned to the shelf' });
    } else throw new Error('Unknown action');
    saveDb(d);
    return true;
  },

  findBorrower({ id }) {
    const key = String(id || '').trim().toLowerCase();
    const p = db().borrowers.find(x => x.id.toLowerCase() === key);
    if (!p) throw new Error('Library ID not found');
    return { ...p, loan_days: TIER_DAYS[p.tier] || 12 };
  },

  createLoan({ book_id, borrower_id, borrowed_on, due_on }) {
    const d = db(), b = bookOf(d, book_id), p = personOf(d, borrower_id);
    if (!b) throw new Error('Book not found');
    if (!p) throw new Error('Borrower not found');
    if (b.copies <= 0) throw new Error('No copies available');
    if (due_on < borrowed_on) throw new Error('Due date cannot be before the borrow date');
    b.copies -= 1;
    const loan = { id: nextId(d.loans), book_id, borrower_id, borrowed_on, due_on, returned_on: null, condition: null };
    d.loans.push(loan);
    log(d, { title: b.title, text: `checked out by ${p.name}` });
    saveDb(d);
    return loan;
  },

  findLoans({ q = '' }) {
    const d = db(), s = q.trim().toLowerCase(), today = todayISO();
    return d.loans.filter(l => !l.returned_on).map(l => {
      const days = Math.max(0, daysBetween(l.due_on, today));
      return {
        id: l.id, book_id: l.book_id, book_title: bookOf(d, l.book_id)?.title,
        borrower_id: l.borrower_id, borrower_name: personOf(d, l.borrower_id)?.name,
        due_on: l.due_on, days_late: days, late_fee: days * FINE_PER_DAY
      };
    }).filter(l => `${l.book_title} ${l.borrower_name} ${l.borrower_id}`.toLowerCase().includes(s));
  },

  processReturn({ loan_id, condition, waive_fee }) {
    const d = db(), l = d.loans.find(x => x.id === Number(loan_id) && !x.returned_on);
    if (!l) throw new Error('Open loan not found');
    if (!['excellent', 'good', 'damaged'].includes(condition)) throw new Error('Choose the book condition');
    const b = bookOf(d, l.book_id), p = personOf(d, l.borrower_id), today = todayISO();
    const days = Math.max(0, daysBetween(l.due_on, today)), amount = days * FINE_PER_DAY;
    l.returned_on = today; l.condition = condition;
    if (condition !== 'damaged') b.copies += 1;          // damaged copies wait for review
    let fine_created = false;
    if (amount > 0 && !waive_fee) {
      d.fines.push({ id: nextId(d.fines), loan_id: l.id, borrower_id: l.borrower_id, book_id: l.book_id,
                     days_late: days, amount, status: 'unpaid', cleared_on: null });
      fine_created = true;
    }
    log(d, { title: b.title, text: `returned by ${p.name}` + (condition === 'damaged' ? ' (damaged - needs review)' : '') });
    saveDb(d);
    return { fine_created, amount: fine_created ? amount : 0, needs_review: condition === 'damaged' };
  },

  listFines({ search = '' }) {
    const d = db(), q = search.trim().toLowerCase(), weekAgo = addDaysISO(todayISO(), -7);
    const sum = arr => arr.reduce((s, f) => s + f.amount, 0);
    const unpaid = d.fines.filter(f => f.status === 'unpaid');
    return {
      stats: {
        total_unpaid: sum(unpaid),
        borrowers_with_fines: new Set(unpaid.map(f => f.borrower_id)).size,
        cleared_this_week: sum(d.fines.filter(f => f.status === 'cleared' && f.cleared_on >= weekAgo))
      },
      rows: d.fines.map(f => ({
        id: f.id, borrower_id: f.borrower_id, borrower_name: personOf(d, f.borrower_id)?.name,
        book_title: bookOf(d, f.book_id)?.title, days_late: f.days_late, amount: f.amount, status: f.status
      })).filter(f => !q || `${f.borrower_name} ${f.borrower_id}`.toLowerCase().includes(q))
    };
  },

  clearFine({ id }) {
    const d = db(), f = d.fines.find(x => x.id === Number(id));
    if (!f) throw new Error('Fine not found');
    if (f.status !== 'unpaid') throw new Error('This fine is already cleared');
    f.status = 'cleared'; f.cleared_on = todayISO();
    log(d, { text: `Fine cleared for ${personOf(d, f.borrower_id)?.name}` });
    saveDb(d);
    return true;
  }
};
