/* membership.js - choose Monthly / Yearly first, then view and edit Basic / Premium / VIP */
document.addEventListener('DOMContentLoaded', () => {
  const chooser = document.getElementById('chooser');
  const plans = document.getElementById('plans');
  const tiersBox = document.getElementById('tiers');
  let period = null;

  // ----- Default data (from the design). Edits are saved over these. -----
  const FEATURES = {
    Basic:   ['Physical loans: 3', 'Hold requests: 1', 'Reading room: Day pass', '1 cozy study theme'],
    Premium: ['Physical loans: 8', 'Hold requests: 5', 'Reading room: Full hours', 'Late-fee grace: +1 day', '2 extra study themes'],
    VIP:     ['Physical loans: 20', 'Hold requests: 15', 'Reading room: Priority seating', 'Rare collection: by appointment', 'VIP appointments page', 'Exclusive Starlit study theme']
  };
  const TAGLINE = { Basic: 'Free access, casual readers', Premium: 'Regular readers & active learners', VIP: 'Frequent readers & advanced users' };
  const make = (name, price, note) => ({ tagline: TAGLINE[name], price, note, features: [...FEATURES[name]] });
  const defaults = () => ({
    monthly: { Basic: make('Basic', 'Free', 'No payment needed'), Premium: make('Premium', '৳150/mo', 'or ৳1,200/yr'), VIP: make('VIP', '৳300/mo', 'or ৳3,500/yr') },
    yearly:  { Basic: make('Basic', 'Free', 'No payment needed'), Premium: make('Premium', '৳1,200/yr', 'or ৳150/mo'), VIP: make('VIP', '৳3,500/yr', 'or ৳300/mo') }
  });
  const data = Store.get('tiers_v2', null) || defaults();

  // ----- Step 1: billing chooser -----
  function renderChooser() {
    document.querySelectorAll('.pick').forEach(p => {
      const d = data[p.dataset.period];
      p.querySelector('.pick-info').textContent = `Basic: ${d.Basic.price}  ·  Premium: ${d.Premium.price}  ·  VIP: ${d.VIP.price}`;
    });
  }
  document.querySelectorAll('.pick button').forEach(btn => btn.onclick = () => {
    period = btn.closest('.pick').dataset.period;
    chooser.hidden = true; plans.hidden = false;
    document.getElementById('plans-title').textContent = (period === 'monthly' ? 'Monthly' : 'Yearly') + ' Plans';
    renderTiers();
  });
  document.getElementById('back').onclick = () => { plans.hidden = true; chooser.hidden = false; renderChooser(); };

  // ----- Step 2: tier cards -----
  function renderTiers() {
    tiersBox.innerHTML = Object.entries(data[period]).map(([name, t]) => `
      <div class="box tier ${name === 'Premium' ? 'featured' : ''}">
        ${name === 'Premium' ? '<span class="tag">MOST SUBSCRIBED</span>' : ''}
        <h3>${name}</h3><p>${esc(t.tagline)}</p>
        <h2>${esc(t.price)}</h2><p class="note">${esc(t.note)}</p>
        <ul class="simple">${t.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul><br>
        <button class="btn" data-tier="${name}">Edit Tier</button>
      </div>`).join('');
  }

  tiersBox.addEventListener('click', e => {
    const name = e.target.dataset.tier;
    if (!name) return;
    const t = data[period][name];
    openModal({
      title: `Edit ${name} (${period})`,
      body: `<label>Description</label><input name="tagline" value="${esc(t.tagline)}">
             <label>Price (e.g. ৳150/mo or Free)</label><input name="price" value="${esc(t.price)}">
             <label>Small note under price</label><input name="note" value="${esc(t.note)}">
             <label>Features (one per line)</label><textarea name="features" rows="6">${esc(t.features.join('\n'))}</textarea>`,
      onConfirm: m => {
        const features = field(m, 'features').split('\n').map(f => f.trim()).filter(Boolean);
        if (!field(m, 'price')) return 'Price is required.';
        if (!features.length) return 'Add at least one feature.';
        Object.assign(t, { tagline: field(m, 'tagline'), price: field(m, 'price'), note: field(m, 'note'), features });
        Store.set('tiers_v2', data);
        logActivity(`Edited ${period} tier`, name);
        renderTiers(); toast(`${name} (${period}) updated.`);
      }
    });
  });

  renderChooser();
});
