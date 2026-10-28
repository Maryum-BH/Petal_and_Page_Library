/* profile.js - admin profile: personal details, password change, own activity */
document.addEventListener('DOMContentLoaded', () => {
  const DEFAULT = { name: 'Himel', role: 'System Admin', email: 'himel@gmail.com', phone: '+880 1700-000000', joined: '12 Jan 2022' };
  const profile = Store.get('profile', DEFAULT);
  const $ = id => document.getElementById(id);
  const initials = n => n.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();

  function render() {
    $('avatar').textContent = initials(profile.name);
    $('p-name').textContent = profile.name;
    $('p-role').textContent = profile.role;
    $('p-joined').textContent = 'Member since ' + profile.joined;
    $('f-name').value = profile.name;   $('f-role').value = profile.role;
    $('f-email').value = profile.email; $('f-phone').value = profile.phone;
    refreshUserbox();                    // update the sidebar box too
  }

  $('save-profile').onclick = () => {
    const name = $('f-name').value.trim(), role = $('f-role').value.trim(), email = $('f-email').value.trim();
    if (!name || !role) return toast('Name and role are required.', 'error');
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast('Please enter a valid email address.', 'error');
    Object.assign(profile, { name, role, email, phone: $('f-phone').value.trim() });
    Store.set('profile', profile);
    logActivity('Updated profile', name);
    render(); renderActivity(); toast('Profile saved.');
  };

  // No backend yet, so the password is only validated, never stored.
  $('save-pw').onclick = () => {
    const old = $('pw-old').value, nw = $('pw-new').value, conf = $('pw-conf').value;
    if (!old) return toast('Enter your current password.', 'error');
    if (nw.length < 8) return toast('New password must be at least 8 characters.', 'error');
    if (nw !== conf) return toast('New passwords do not match.', 'error');
    $('pw-old').value = $('pw-new').value = $('pw-conf').value = '';
    logActivity('Changed password', 'Own account'); renderActivity();
    toast('Password updated.');
  };

  function renderActivity() {
    const rows = Store.get('activity', []).map(a =>
      `<tr><td>${esc(a.action)}</td><td>${esc(a.item)}</td><td>${esc(a.when)}</td></tr>`).join('');
    $('my-activity').innerHTML = '<tr><th>Action</th><th>Item</th><th>When</th></tr>' +
      (rows || '<tr><td colspan="3">No activity yet.</td></tr>');
  }

  render(); renderActivity();
});
