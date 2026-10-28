/* profile.js  –  page script for "Profile" (loads after core.js) */
function upl(el) {
    const f = el.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
        user.img = r.result;
        save();
        render(true);
        say("Photo updated 📷");
    };
    r.readAsDataURL(f);
}
function saveP() {
    user.name = $("#pn").value.trim() || user.name;
    user.nick = $("#pk").value.trim() || user.nick;
    user.username = $("#pu").value.trim() || user.username;
    save();
    say("Saved 💖");
    render(true);
}
V.profile = () =>
    `<h1>Profile picture</h1><div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap"><div class="av" style="width:120px;height:120px;border:5px solid var(--co)">${avH()}</div><div><h3>Your photo</h3><p class="sub">Pick a cute avatar below, or use your own photo.</p><label class="btn o">Choose from gallery<input type="file" accept="image/*" hidden onchange="upl(this)"></label> <label class="btn o">Take a photo<input type="file" accept="image/*" capture="user" hidden onchange="upl(this)"></label> <button class="btn o" onclick="user.img='';save();render(true)">Remove photo</button></div></div><h3 style="margin:22px 0 10px">Cute avatars</h3><div class="avs">${KEYS.map((a) => `<div class="${!user.img && user.av == a ? "on" : ""}" onclick="user.av='${a}';user.img='';save();render(true)">${face(a)}</div>`).join("")}</div><div class="card" style="margin-top:22px;max-width:480px"><label class="sub">Full name</label><input id="pn" value="${user.name}"><label class="sub">Nickname</label><input id="pk" value="${user.nick}"><label class="sub">Username</label><input id="pu" value="${user.username}"><button class="btn" onclick="saveP()">Save changes</button> <button class="btn o" onclick="logout()">Log out</button></div>`;

render();
