/* Return.js - needs api.js loaded first (no HTML edits needed besides the script tags) */
document.addEventListener('DOMContentLoaded', () => {
  const state = { loan: null, waived: false };
  let matches = [];

  const input      = $('.search-row input');
  const findBtn    = $('.find-btn');
  const card       = $('.loan-card');
  const waiveBtn   = $('.waive-btn');
  const confirmBtn = $('.confirm-return-btn');
  const radios     = $$('input[name="condition"]');

  ['excellent', 'good', 'damaged'].forEach((v, i) => { radios[i].value = v; });

  const placeholder = msg => {
    card.innerHTML = `<div class="loan-line text-muted">${esc(msg)}</div>`;
    waiveBtn.textContent = 'Waive Fee';
  };

  function showLoan() {
    const l = state.loan;
    const due = new Date(l.due_on + 'T12:00:00').toLocaleDateString('en', { month: 'long', day: 'numeric' });
    const fee = l.days_late > 0
      ? `<span class="late-fee" ${state.waived ? 'style="text-decoration:line-through"' : ''}>&nbsp;${money(l.late_fee)} - ${l.days_late} day${l.days_late > 1 ? 's' : ''} late</span>${state.waived ? ' <b>(waived)</b>' : ''}`
      : '<span>&nbsp;None</span>';
    card.innerHTML = `
      <div class="loan-line">Borrower : ${esc(l.borrower_name)} - ${esc(l.borrower_id)}</div>
      <div class="loan-line">Book : ${esc(l.book_title)}</div>
      <div class="loan-line">Due Date : ${due}</div>
      <div class="loan-line">Late fee : ${fee}</div>`;
    waiveBtn.textContent = state.waived ? 'Fee waived \u2713' : 'Waive Fee';
  }

  function showChoices() {                       // several loans matched the search
    card.innerHTML = matches.map(l => `
      <div class="loan-line" style="justify-content:space-between;align-items:center">
        <span>${esc(l.book_title)} \u2014 ${esc(l.borrower_name)} (${esc(l.borrower_id)})</span>
        <button type="button" class="waive-btn" data-id="${l.id}" style="padding:6px 16px">Select</button>
      </div>`).join('');
  }

  async function find() {
    const q = input.value.trim();
    if (!q) return toast('Type a borrower name, library ID or book title', 'warning');
    state.loan = null; state.waived = false;
    try {
      matches = await API.findLoans({ q });
      if (!matches.length) return placeholder('No open loan found for that search');
      if (matches.length === 1) { state.loan = matches[0]; showLoan(); }
      else showChoices();
    } catch (e) { toast(e.message, 'danger'); }
  }

  findBtn.addEventListener('click', find);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') find(); });

  card.addEventListener('click', e => {
    const btn = e.target.closest('button[data-id]');
    if (!btn) return;
    state.loan = matches.find(l => l.id === Number(btn.dataset.id));
    state.waived = false;
    showLoan();
  });

  waiveBtn.addEventListener('click', () => {
    if (!state.loan) return toast('Find a loan first', 'warning');
    if (state.loan.late_fee <= 0) return toast('This loan has no late fee', 'info');
    state.waived = !state.waived;
    showLoan();
  });

  confirmBtn.addEventListener('click', async () => {
    if (!state.loan) return toast('Find a loan first', 'warning');
    const cond = radios.find(r => r.checked);
    if (!cond) return toast('Choose the book condition', 'warning');

    confirmBtn.disabled = true;
    try {
      const res = await API.processReturn({
        loan_id: state.loan.id, condition: cond.value, waive_fee: state.waived
      });
      toast(res.fine_created
        ? `Returned. Fine of ${money(res.amount)} added to the ledger`
        : res.needs_review ? 'Returned. Book flagged for damage review' : 'Return confirmed');
      state.loan = null; state.waived = false; matches = [];
      radios.forEach(r => { r.checked = false; });
      input.value = '';
      placeholder('Search for a loan to begin');
    } catch (e) { toast(e.message, 'danger'); }
    finally { confirmBtn.disabled = false; }
  });

  placeholder('Search for a loan to begin');
});
