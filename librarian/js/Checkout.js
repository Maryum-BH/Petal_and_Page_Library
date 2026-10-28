/* Checkout.js - needs api.js loaded first
   Needs these ids in Checkout.php:
     #bookSearch  #libraryId  #borrowerName  #dateBorrowed  #dueDate           */
document.addEventListener('DOMContentLoaded', () => {
  const state = { book: null, borrower: null, dueEdited: false };
  let books = [];

  const el = {
    bookSearch:   $('#bookSearch'),
    libraryId:    $('#libraryId'),
    borrowerName: $('#borrowerName'),
    borrowed:     $('#dateBorrowed'),
    due:          $('#dueDate'),
    banner:       $('.confirm-banner'),
    confirm:      $('.confirm-btn')
  };

  /* ---------- initial setup (replaces the sample content in the HTML) ---------- */
  $('.book-result')?.remove();
  const results = document.createElement('div');
  results.id = 'bookResults';
  el.bookSearch.after(results);

  el.borrowerName.readOnly = true;
  el.banner.style.display = 'none';
  el.borrowed.placeholder = el.due.placeholder = 'DD/MM/YYYY';
  el.borrowed.value = isoToDMY(todayISO());
  el.due.value = '';

  /* ---------- step 1: find the book ---------- */
  function bookCard(b) {
    const out = b.copies <= 0, picked = state.book && state.book.id === b.id;
    return `<div class="book-result" data-id="${esc(b.id)}"
                 style="cursor:${out ? 'not-allowed' : 'pointer'};opacity:${out ? 0.6 : 1};
                        ${picked ? 'border:2px solid #F69FD0;' : ''}">
      <div class="book-cover"><img src="${IMG_BASE}book-03.png" alt="book"></div>
      <div class="book-info">
        <h5><b>${esc(b.title)}</b></h5>
        <p>By ${esc(b.author)}</p>
        <p class="book-meta">Shelf ${esc(b.shelf)}<br>${out ? 'Out of stock' : `${b.copies} cop${b.copies === 1 ? 'y' : 'ies'} available`}</p>
      </div></div>`;
  }
  const drawBooks = () => {
    results.innerHTML = books.length
      ? books.map(bookCard).join('')
      : (el.bookSearch.value.trim() ? '<p class="text-muted mt-3">No books found</p>' : '');
  };

  el.bookSearch.addEventListener('input', debounce(async () => {
    state.book = null;
    const q = el.bookSearch.value.trim();
    if (!q) { books = []; return drawBooks(); }
    try { books = (await API.listBooks({ search: q })).slice(0, 5); drawBooks(); }
    catch (e) { toast(e.message, 'danger'); }
  }));

  results.addEventListener('click', e => {
    const card = e.target.closest('.book-result');
    if (!card) return;
    const b = books.find(x => x.id === card.dataset.id);
    if (b.copies <= 0) return toast('No copies of this book are available', 'warning');
    state.book = b;
    drawBooks();
  });

  /* ---------- step 2: borrower ---------- */
  function showBanner(ok, text) {
    el.banner.style.display = 'flex';
    el.banner.style.backgroundColor = ok ? '' : '#f7b8b8';
    const check = $('.check', el.banner);
    check.textContent = ok ? '\u2713' : '\u2715';
    check.style.backgroundColor = ok ? '' : '#c92a2a';
    $('span:last-child', el.banner).textContent = text;
  }

  async function lookupBorrower() {
    const id = el.libraryId.value.trim();
    state.borrower = null;
    el.borrowerName.value = '';
    el.banner.style.display = 'none';
    if (!id) return;
    try {
      const p = await API.findBorrower({ id });
      state.borrower = p;
      el.borrowerName.value = p.name;
      showBanner(true, `${p.name} --- ${p.tier} Tier`);
      state.dueEdited = false;
      updateDue();
    } catch (e) { showBanner(false, e.message); }
  }
  el.libraryId.addEventListener('input', debounce(lookupBorrower, 500));
  el.libraryId.addEventListener('keydown', e => { if (e.key === 'Enter') lookupBorrower(); });

  /* ---------- step 3: dates ---------- */
  function updateDue() {                       // due = borrowed + tier days (unless edited by hand)
    if (state.dueEdited || !state.borrower) return;
    const b = dmyToISO(el.borrowed.value);
    if (b) el.due.value = isoToDMY(addDaysISO(b, state.borrower.loan_days));
  }
  el.borrowed.addEventListener('input', updateDue);
  el.due.addEventListener('input', () => { state.dueEdited = true; });

  /* ---------- calendar icons: open the browser's real date picker ---------- */
  $$('.date-input-wrap').forEach(wrap => {
    const textBox = $('.checkout-input', wrap);
    const icon = $('img', wrap);

    // a hidden <input type="date"> sitting under the icon (it holds the calendar)
    const picker = document.createElement('input');
    picker.type = 'date';
    picker.style.cssText = 'position:absolute;right:12px;top:50%;width:20px;height:20px;opacity:0;pointer-events:none;';
    wrap.appendChild(picker);
    icon.style.cursor = 'pointer';

    // clicking the icon opens the calendar, starting on the date already typed
    icon.addEventListener('click', () => {
      picker.value = dmyToISO(textBox.value) || '';
      try { picker.showPicker(); } catch { picker.click(); }
    });

    // when a date is chosen, write it in the text box as DD/MM/YYYY
    picker.addEventListener('change', () => {
      if (!picker.value) return;
      textBox.value = isoToDMY(picker.value);
      textBox.dispatchEvent(new Event('input'));   // so the due date recalculates / marks as edited
    });
  });

  /* ---------- confirm ---------- */
  function resetForm() {
    state.book = state.borrower = null; state.dueEdited = false; books = [];
    el.bookSearch.value = el.libraryId.value = el.borrowerName.value = '';
    el.banner.style.display = 'none';
    el.borrowed.value = isoToDMY(todayISO());
    el.due.value = '';
    drawBooks();
  }

  el.confirm.addEventListener('click', async () => {
    const borrowed = dmyToISO(el.borrowed.value), due = dmyToISO(el.due.value);
    if (!state.book)     return toast('Select a book first', 'warning');
    if (!state.borrower) return toast('Enter a valid Library ID', 'warning');
    if (!borrowed || !due) return toast('Dates must look like DD/MM/YYYY', 'warning');
    if (due < borrowed)  return toast('Due date cannot be before the borrow date', 'warning');

    el.confirm.disabled = true;
    try {
      await API.createLoan({
        book_id: state.book.id, borrower_id: state.borrower.id,
        borrowed_on: borrowed, due_on: due               // sent as YYYY-MM-DD
      });
      toast(`"${state.book.title}" checked out to ${state.borrower.name}`);
      resetForm();
    } catch (e) { toast(e.message, 'danger'); }
    finally { el.confirm.disabled = false; }
  });
});
