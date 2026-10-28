/* fees.js - edit late-fee rules + a fee calculator */
document.addEventListener('DOMContentLoaded', () => {
  const tables = { physical: document.querySelectorAll('.row .box table')[0],
                   digital:  document.querySelectorAll('.row .box table')[1] };
  const GRACE = { Premium: 1 };   // from the "Late-Fee Notes": Premium gets 1 grace day

  const fees = Store.get('fees_v2', null) || Object.fromEntries(Object.entries(tables).map(([k, t]) =>
    [k, rowsOf(t).map(r => { const c = cellsOf(r); return { member: c[0], fee: num(c[1]), max: num(c[2]) }; })]));

  function render() {
    for (const kind in tables) {
      tables[kind].innerHTML = '<tr><th>Member</th><th>Fee / Day</th><th>Maximum</th><th></th></tr>' +
        fees[kind].map((r, i) => `<tr><td>${r.member}</td><td>৳${r.fee}</td><td>৳${r.max}</td>
          <td><button class="ui-btn small" data-kind="${kind}" data-i="${i}">Edit</button></td></tr>`).join('');
    }
    Store.set('fees_v2', fees);
    calculate();
  }

  document.querySelectorAll('.row .box table').forEach(t => t.addEventListener('click', e => {
    const { kind, i } = e.target.dataset;
    if (kind === undefined) return;
    const rule = fees[kind][i];
    openModal({
      title: `Edit ${rule.member} - ${kind === 'physical' ? 'Physical Books' : 'Digital Items'}`,
      body: `<label>Fee per day (৳)</label><input name="fee" type="number" min="0" value="${rule.fee}">
             <label>Maximum fee (৳)</label><input name="max" type="number" min="0" value="${rule.max}">`,
      onConfirm: m => {
        const fee = Number(field(m, 'fee')), max = Number(field(m, 'max'));
        if (isNaN(fee) || isNaN(max) || fee < 0 || max < 0) return 'Enter valid, non-negative numbers.';
        if (max < fee) return 'Maximum cannot be lower than the daily fee.';
        Object.assign(rule, { fee, max });
        logActivity('Updated late-fee rule', `${rule.member} - ${kind === 'physical' ? 'Physical' : 'Digital'}`);
        render(); toast('Fee rule updated.');
      }
    });
  }));

  // ----- Fee calculator card (added below the notes) -----
  document.querySelector('.right').insertAdjacentHTML('beforeend', `
    <div class="card"><h3>Fee Calculator</h3>
      <div class="row">
        <div class="box"><label>Item type</label><select id="c-kind"><option value="physical">Physical Book</option><option value="digital">Digital Item</option></select></div>
        <div class="box"><label>Member tier</label><select id="c-tier">${fees.physical.map(r => `<option>${r.member}</option>`).join('')}</select></div>
        <div class="box"><label>Days overdue</label><input id="c-days" type="number" min="0" value="0"></div>
      </div><p class="calc-result" id="c-result"></p></div>`);

  function calculate() {
    const kind = document.getElementById('c-kind').value, tier = document.getElementById('c-tier').value;
    const days = Math.max(0, Number(document.getElementById('c-days').value) || 0);
    const rule = fees[kind].find(r => r.member === tier);
    const chargeable = Math.max(0, days - (GRACE[tier] || 0));
    const total = Math.min(chargeable * rule.fee, rule.max);
    document.getElementById('c-result').textContent =
      `Late fee: ৳${total}` + (GRACE[tier] ? `  (${GRACE[tier]} grace day applied)` : '');
  }
  ['c-kind', 'c-tier', 'c-days'].forEach(id => document.getElementById(id).addEventListener('input', calculate));

  render();
});
