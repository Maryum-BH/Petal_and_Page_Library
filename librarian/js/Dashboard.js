/* Dashboard.js - needs api.js loaded first */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const s = await API.dashboardStats();

    // the 4 number cards, in page order
    const cards = $$('.card-title');
    [s.total_books, s.reserved_today, s.returns_today, s.overdue].forEach((v, i) => {
      if (cards[i]) cards[i].textContent = Number(v).toLocaleString();
    });

    const note = $('#copiesNote');
    if (note) note.textContent = `${Number(s.total_copies).toLocaleString()} copies in total`;

    fillList($('.notifications:not(.activity)'), s.notifications, 'notif');
    fillList($('.notifications.activity'), s.activity, 'activity');
  } catch (e) {
    toast(e.message, 'danger');
  }
});

function fillList(panel, items, kind) {
  if (!panel) return;
  $$('.notification, .loading-note', panel).forEach(n => n.remove());   // remove the old rows / loading line

  if (!items.length) {
    panel.insertAdjacentHTML('beforeend', '<p class="text-muted">Nothing to show</p>');
    return;
  }
  panel.insertAdjacentHTML('beforeend', items.map(i => {
    const warn = i.type === 'warning';
    const icon = IMG_BASE + (kind === 'activity' ? 'task-01.png' : warn ? 'alert-02.png' : 'activity.png');
    const title = i.title ? `<b><i>${esc(i.title)}</i></b> ` : '';
    return `<div class="notification ${warn ? 'warning' : 'info'}">
              <span><img class="image" src="${icon}" alt=""></span>
              <p>${title}${esc(i.text)}</p>
            </div>`;
  }).join(''));
}
